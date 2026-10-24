import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// Mock server-only in Vitest jsdom test runner
vi.mock("server-only", () => ({}));

import {
  validateDeliveryOrderPincode,
  getDeliveryAreaByPincode,
} from "@/lib/delivery/delivery-areas";
import {
  verifyRazorpayCheckoutSignature,
  verifyRazorpayWebhookSignature,
  generateTestWebhookSignature,
  generateTestCheckoutSignature,
} from "@/lib/razorpay/razorpay-server";
import {
  initiateDeliveryPayment,
  verifyDeliveryCheckoutPayment,
  simulateTestModePayment,
  processRazorpayWebhook,
  expireStaleDeliveryOrders,
  processOrderRefund,
} from "@/services/payment-service";
import { ORDERS_STORE, type OrderRecord } from "@/lib/orders/order-store";

// Mock staff & customer auth
const mockRequireStaffAuth = vi.fn();
const mockRequireCustomerAuth = vi.fn();
vi.mock("@/lib/auth/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/server")>();
  return {
    ...actual,
    requireStaffAuth: () => mockRequireStaffAuth(),
    getAuthSession: vi.fn(),
    requireCustomerAuth: () => mockRequireCustomerAuth(),
  };
});

describe("Delivery Area & Pincode Validation", () => {
  it("allows delivery for authorized pincode and sufficient order subtotal", () => {
    const result = validateDeliveryOrderPincode("302001", 18000); // ₹180 >= ₹150
    expect(result.isValid).toBe(true);
    expect(result.area?.pincode).toBe("302001");
  });

  it("rejects out-of-area pincodes", () => {
    const result = validateDeliveryOrderPincode("302099", 25000);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("do not deliver to pincode 302099");
  });

  it("rejects orders below minimum delivery order requirement", () => {
    const result = validateDeliveryOrderPincode("302001", 10000); // ₹100 < ₹150 min
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Minimum order amount for delivery is ₹150");
  });
});

describe("Razorpay Signature Verification", () => {
  it("verifies genuine checkout signature and rejects tampered signature", () => {
    const orderId = "order_test_rzp_123";
    const paymentId = "pay_test_rzp_456";

    // Generate genuine signature
    const secret = process.env.RAZORPAY_KEY_SECRET || "cheezy_dip_razorpay_secret_test_32_bytes";
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(verifyRazorpayCheckoutSignature(orderId, paymentId, validSignature)).toBe(true);

    // Tampered payment ID
    expect(verifyRazorpayCheckoutSignature(orderId, "pay_fake_999", validSignature)).toBe(false);

    // Tampered signature
    expect(verifyRazorpayCheckoutSignature(orderId, paymentId, "0000000000000000")).toBe(false);
  });
});

describe("Payment Service & Webhook State Engine", () => {
  const deliveryOrderId = "ord_delivery_test_101";

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCustomerAuth.mockResolvedValue({
      userId: "user_customer_deliv",
      phone: "+919876543210",
    });

    const order: OrderRecord = {
      id: deliveryOrderId,
      orderNumber: "CD-501",
      customerClerkId: "user_customer_deliv",
      contactPhone: "+919876543210",
      orderType: "delivery",
      orderStatus: "pending_payment",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      subtotalMinor: 20000,
      discountMinor: 0,
      deliveryFeeMinor: 3000,
      taxMinor: 0,
      totalMinor: 23000, // ₹230
      idempotencyKey: "test_deliv_idem_501",
      items: [
        {
          menuItemId: "fries-cheese-loaded",
          nameSnapshot: "Cheese Loaded Fries",
          unitPriceMinor: 20000,
          quantity: 1,
          modifiersSnapshot: [],
          lineTotalMinor: 20000,
        },
      ],
      placedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    ORDERS_STORE.set(deliveryOrderId, order);
  });

  it("webhook marks order paid, transitions pending_payment -> placed, and handles 'browser never returns'", async () => {
    const payload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_webhook_unique_001",
            order_id: "order_rzp_test_501",
            amount: 23000, // exact matches ₹230
            currency: "INR",
            status: "captured",
            notes: { internal_order_id: deliveryOrderId },
          },
        },
      },
    };

    const rawBody = JSON.stringify(payload);
    const signature = generateTestWebhookSignature(rawBody);

    const result = await processRazorpayWebhook(rawBody, signature);
    expect(result.success).toBe(true);
    expect(result.paymentStatus).toBe("paid");

    const updated = ORDERS_STORE.get(deliveryOrderId);
    expect(updated?.paymentStatus).toBe("paid");
    expect(updated?.orderStatus).toBe("placed"); // Order safely moves to kitchen queue even if browser tab closed
  });

  it("rejects webhook when captured amount does not match order total (amount tampering attack)", async () => {
    const payload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_webhook_tampered_002",
            order_id: "order_rzp_test_501",
            amount: 5000, // ₹50 instead of ₹230
            currency: "INR",
            status: "captured",
            notes: { internal_order_id: deliveryOrderId },
          },
        },
      },
    };

    const rawBody = JSON.stringify(payload);
    const signature = generateTestWebhookSignature(rawBody);

    await expect(processRazorpayWebhook(rawBody, signature)).rejects.toThrow(
      /AMOUNT_MISMATCH/
    );

    // Order status should remain pending
    const order = ORDERS_STORE.get(deliveryOrderId);
    expect(order?.paymentStatus).toBe("pending");
    expect(order?.orderStatus).toBe("pending_payment");
  });

  it("rejects webhook with invalid cryptographic signature", async () => {
    const payload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_bad_sig_003",
            order_id: "order_rzp_test_501",
            amount: 23000,
            currency: "INR",
            status: "captured",
          },
        },
      },
    };

    const rawBody = JSON.stringify(payload);
    const invalidSignature = "deadbeef1234567890abcdef";

    await expect(processRazorpayWebhook(rawBody, invalidSignature)).rejects.toThrow(
      /Invalid Razorpay webhook signature/
    );
  });

  it("safely handles duplicate webhook deliveries idempotently", async () => {
    const payload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_dup_event_004",
            order_id: "order_rzp_test_501",
            amount: 23000,
            currency: "INR",
            status: "captured",
            notes: { internal_order_id: deliveryOrderId },
          },
        },
      },
    };

    const rawBody = JSON.stringify(payload);
    const signature = generateTestWebhookSignature(rawBody);

    // First arrival
    const firstCall = await processRazorpayWebhook(rawBody, signature);
    expect(firstCall.success).toBe(true);

    // Duplicate arrival
    const secondCall = await processRazorpayWebhook(rawBody, signature);
    expect(secondCall.success).toBe(true);
    expect(secondCall.message).toContain("safely deduplicated");
  });

  it("expires stale pending_payment delivery orders older than 15 minutes", async () => {
    // Modify placedAt to 20 mins ago
    const staleOrder: OrderRecord = {
      id: "ord_stale_102",
      orderNumber: "CD-502",
      customerClerkId: "user_customer_stale",
      contactPhone: "+919876543210",
      orderType: "delivery",
      orderStatus: "pending_payment",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      subtotalMinor: 15000,
      discountMinor: 0,
      deliveryFeeMinor: 3000,
      taxMinor: 0,
      totalMinor: 18000,
      idempotencyKey: "stale_idem_102",
      items: [],
      placedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    };
    ORDERS_STORE.set("ord_stale_102", staleOrder);

    const expiredCount = await expireStaleDeliveryOrders(15);
    expect(expiredCount).toBeGreaterThanOrEqual(1);

    const updated = ORDERS_STORE.get("ord_stale_102");
    expect(updated?.orderStatus).toBe("expired");
  });

  it("processes admin/owner refund and verifies RBAC", async () => {
    // 1. Mark order as paid first
    const paidOrder = ORDERS_STORE.get(deliveryOrderId)!;
    paidOrder.paymentStatus = "paid";
    paidOrder.orderStatus = "placed";

    // Non-staff or kitchen role cannot issue refund
    mockRequireStaffAuth.mockResolvedValue({
      userId: "staff_kitchen_1",
      role: "kitchen",
    });
    await expect(processOrderRefund(deliveryOrderId)).rejects.toThrow(/UNAUTHORIZED/);

    // Admin role can issue refund
    mockRequireStaffAuth.mockResolvedValue({
      userId: "staff_admin_1",
      role: "admin",
    });

    const refundResult = await processOrderRefund(deliveryOrderId, 23000, "Customer cancelled order");
    expect(refundResult.success).toBe(true);
    expect(refundResult.paymentStatus).toBe("refunded");
    expect(refundResult.orderStatus).toBe("cancelled");
  });

  it("initiates Razorpay delivery payment with exact order total in paise", async () => {
    const rzpOrder = await initiateDeliveryPayment(deliveryOrderId);
    expect(rzpOrder.razorpayOrderId).toBeDefined();
    expect(rzpOrder.amountMinor).toBe(23000); // ₹230
    expect(rzpOrder.currency).toBe("INR");
  });

  it("verifies genuine Razorpay checkout signature and marks order paid", async () => {
    const rzpOrder = await initiateDeliveryPayment(deliveryOrderId);
    const paymentId = "pay_checkout_valid_888";
    const signature = generateTestCheckoutSignature(rzpOrder.razorpayOrderId, paymentId);

    const result = await verifyDeliveryCheckoutPayment({
      orderId: deliveryOrderId,
      razorpayOrderId: rzpOrder.razorpayOrderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    });

    expect(result.success).toBe(true);
    expect(result.paymentStatus).toBe("paid");
    expect(result.orderStatus).toBe("placed");

    const updated = ORDERS_STORE.get(deliveryOrderId);
    expect(updated?.paymentStatus).toBe("paid");
    expect(updated?.orderStatus).toBe("placed");
    expect(updated?.razorpayPaymentId).toBe(paymentId);
  });

  it("rejects invalid Razorpay checkout signature", async () => {
    const rzpOrder = await initiateDeliveryPayment(deliveryOrderId);
    await expect(
      verifyDeliveryCheckoutPayment({
        orderId: deliveryOrderId,
        razorpayOrderId: rzpOrder.razorpayOrderId,
        razorpayPaymentId: "pay_tampered_999",
        razorpaySignature: "invalid_hex_signature_deadbeef",
      })
    ).rejects.toThrow(/PAYMENT_VERIFICATION_FAILED/);

    const order = ORDERS_STORE.get(deliveryOrderId);
    expect(order?.paymentStatus).toBe("pending");
    expect(order?.orderStatus).toBe("pending_payment");
  });

  it("simulates full Razorpay checkout payment cycle and marks order as paid", async () => {
    const simResult = await simulateTestModePayment(deliveryOrderId);
    expect(simResult.success).toBe(true);
    expect(simResult.paymentStatus).toBe("paid");
    expect(simResult.orderStatus).toBe("placed");

    const order = ORDERS_STORE.get(deliveryOrderId);
    expect(order?.paymentStatus).toBe("paid");
    expect(order?.orderStatus).toBe("placed");
  });
});
