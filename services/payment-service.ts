"use server";

import { requireStaffAuth, requireCustomerAuth } from "@/lib/auth/server";
import {
  createRazorpayOrder,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay/razorpay-server";
import {
  ORDERS_STORE,
  AUDIT_LOGS_STORE,
  type OrderRecord,
  type AuditLogEntry,
} from "@/lib/orders/order-store";

// Deduplication store for processed webhook payment IDs
const PROCESSED_PAYMENTS: Set<string> = new Set();

// Active payments mapping: internalOrderId -> razorpayOrderId
const ORDER_RAZORPAY_MAP: Map<string, string> = new Map();

/**
 * Initiate Razorpay checkout order on server for delivery order
 */
export async function initiateDeliveryPayment(orderId: string) {
  const user = await requireCustomerAuth();
  const order = ORDERS_STORE.get(orderId);

  if (!order) {
    throw new Error(`ORDER_NOT_FOUND: Order with ID '${orderId}' does not exist.`);
  }

  if (order.customerClerkId !== user.userId) {
    throw new Error("UNAUTHORIZED: You do not own this order.");
  }

  if (order.orderStatus !== "pending_payment") {
    throw new Error(
      `INVALID_PAYMENT_STATE: Cannot initiate payment for order in '${order.orderStatus}' status.`
    );
  }

  const rzpOrder = await createRazorpayOrder(order.id, order.totalMinor);
  ORDER_RAZORPAY_MAP.set(order.id, rzpOrder.razorpayOrderId);

  return rzpOrder;
}

export interface WebhookPaymentPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number; // in integer paise
        currency: string;
        status: string;
        notes?: {
          internal_order_id?: string;
        };
      };
    };
  };
}

/**
 * Process incoming Razorpay webhook with raw body verification, amount match, and idempotency
 */
export async function processRazorpayWebhook(rawBody: string, signatureHeader: string) {
  // 1. Verify signature on the raw body
  const isValid = verifyRazorpayWebhookSignature(rawBody, signatureHeader);
  if (!isValid) {
    throw new Error("WEBHOOK_ERROR: Invalid Razorpay webhook signature.");
  }

  // 2. Parse payload
  let data: WebhookPaymentPayload;
  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error("WEBHOOK_ERROR: Malformed webhook JSON payload.");
  }

  const payment = data.payload?.payment?.entity;
  if (!payment) {
    return { success: true, message: "Ignored event without payment entity" };
  }

  const paymentId = payment.id;
  const razorpayOrderId = payment.order_id;
  const capturedAmountMinor = payment.amount;

  // 3. Idempotency check: if this payment was already handled, return 200 without duplicate action
  if (PROCESSED_PAYMENTS.has(paymentId)) {
    return { success: true, message: "Duplicate webhook event safely deduplicated" };
  }

  // 4. Find matching internal order
  let matchedOrder: OrderRecord | undefined;
  for (const [internalId, rzpId] of ORDER_RAZORPAY_MAP.entries()) {
    if (rzpId === razorpayOrderId) {
      matchedOrder = ORDERS_STORE.get(internalId);
      break;
    }
  }

  // Fallback to internal_order_id in notes if available
  if (!matchedOrder && payment.notes?.internal_order_id) {
    matchedOrder = ORDERS_STORE.get(payment.notes.internal_order_id);
  }

  if (!matchedOrder) {
    // If not found in mapping, try matching order with same total in pending_payment
    matchedOrder = Array.from(ORDERS_STORE.values()).find(
      (o) => o.orderStatus === "pending_payment" && o.totalMinor === capturedAmountMinor
    );
  }

  if (!matchedOrder) {
    throw new Error(`WEBHOOK_ERROR: No order matching Razorpay order '${razorpayOrderId}'.`);
  }

  // 5. Amount mismatch validation (Rule: NEVER accept tampered payment amounts)
  if (capturedAmountMinor !== matchedOrder.totalMinor) {
    throw new Error(
      `AMOUNT_MISMATCH: Captured payment of ${capturedAmountMinor} paise does not match order total of ${matchedOrder.totalMinor} paise.`
    );
  }

  // 6. Transition order: pending_payment -> placed, mark paymentStatus = paid
  matchedOrder.paymentStatus = "paid";
  matchedOrder.orderStatus = "placed";
  matchedOrder.updatedAt = new Date().toISOString();
  ORDERS_STORE.set(matchedOrder.id, matchedOrder);

  // Record payment ID in idempotency set
  PROCESSED_PAYMENTS.add(paymentId);

  // 7. Audit Log Entry
  const auditEntry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    entity: "payment",
    entityId: matchedOrder.id,
    action: "webhook_payment_captured",
    actorRole: "admin",
    actorUserId: "system_razorpay_webhook",
    metadata: {
      paymentId,
      razorpayOrderId,
      amountMinor: capturedAmountMinor,
      orderNumber: matchedOrder.orderNumber,
    },
    createdAt: new Date().toISOString(),
  };
  AUDIT_LOGS_STORE.push(auditEntry);

  return {
    success: true,
    orderId: matchedOrder.id,
    orderNumber: matchedOrder.orderNumber,
    paymentStatus: matchedOrder.paymentStatus,
  };
}

/**
 * Expire stale delivery orders in pending_payment older than maxAgeMinutes (default 15 mins)
 */
export async function expireStaleDeliveryOrders(maxAgeMinutes = 15): Promise<number> {
  const cutoffTime = Date.now() - maxAgeMinutes * 60 * 1000;
  let expiredCount = 0;

  for (const order of ORDERS_STORE.values()) {
    if (
      order.orderType === "delivery" &&
      order.orderStatus === "pending_payment" &&
      new Date(order.placedAt).getTime() < cutoffTime
    ) {
      order.orderStatus = "expired";
      order.updatedAt = new Date().toISOString();
      ORDERS_STORE.set(order.id, order);
      expiredCount += 1;

      AUDIT_LOGS_STORE.push({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        entity: "order",
        entityId: order.id,
        action: "order_stale_expired",
        actorRole: "admin",
        actorUserId: "system_cron",
        metadata: { orderNumber: order.orderNumber, placedAt: order.placedAt },
        createdAt: new Date().toISOString(),
      });
    }
  }

  return expiredCount;
}

/**
 * Process a full or partial refund for an order (Admin / Owner only)
 */
export async function processOrderRefund(
  orderId: string,
  refundAmountMinor?: number,
  reason: string = "Customer requested cancellation"
) {
  const staff = await requireStaffAuth();
  if (staff.role !== "admin" && staff.role !== "owner") {
    throw new Error("UNAUTHORIZED: Only admin or owner can issue payment refunds.");
  }

  const order = ORDERS_STORE.get(orderId);
  if (!order) {
    throw new Error(`ORDER_NOT_FOUND: Order '${orderId}' not found.`);
  }

  if (order.paymentStatus !== "paid") {
    throw new Error(`CANNOT_REFUND: Order payment status is '${order.paymentStatus}', must be 'paid'.`);
  }

  const actualRefundMinor = refundAmountMinor !== undefined ? refundAmountMinor : order.totalMinor;
  if (actualRefundMinor <= 0 || actualRefundMinor > order.totalMinor) {
    throw new Error(`INVALID_REFUND_AMOUNT: Refund amount must be between ₹1 and ₹${Math.round(order.totalMinor / 100)}.`);
  }

  order.paymentStatus = "refunded";
  order.orderStatus = "cancelled";
  order.updatedAt = new Date().toISOString();
  ORDERS_STORE.set(order.id, order);

  // Record audit trail
  AUDIT_LOGS_STORE.push({
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    entity: "refund",
    entityId: order.id,
    action: "order_refunded",
    actorRole: staff.role,
    actorUserId: staff.userId,
    metadata: {
      refundAmountMinor: actualRefundMinor,
      orderTotalMinor: order.totalMinor,
      reason,
      orderNumber: order.orderNumber,
    },
    createdAt: new Date().toISOString(),
  });

  return {
    success: true,
    orderId: order.id,
    refundAmountMinor: actualRefundMinor,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
  };
}
