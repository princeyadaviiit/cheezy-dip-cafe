import { describe, it, expect, vi, beforeEach } from "vitest";
import { placeOrder } from "@/services/order-service";

// Mock customer auth
vi.mock("@/lib/auth/server", () => ({
  requireCustomerAuth: vi.fn().mockResolvedValue({
    userId: "user_test_customer_123",
    role: null,
    phone: "+919876543210",
  }),
  getAuthSession: vi.fn().mockResolvedValue({
    userId: "user_test_customer_123",
    role: null,
    phone: "+919876543210",
  }),
}));

// Mock table cookie helper
const mockGetTableContext = vi.fn();
vi.mock("@/lib/auth/table-cookie", () => ({
  getTableContext: () => mockGetTableContext(),
  TABLE_COOKIE_NAME: "table_ctx",
}));

describe("Order Service (placeOrder validation & security)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("places a valid dine-in order when signed table cookie is present", async () => {
    mockGetTableContext.mockResolvedValue({
      tableId: "d0000000-0000-0000-0000-000000000001",
      tableLabel: "Table 1",
      issuedAt: Date.now(),
    });

    const order = await placeOrder({
      orderType: "dine_in",
      paymentMethod: "pay_at_counter",
      idempotencyKey: "idem_key_test_001",
      items: [
        { menuItemId: "fries-cheese-loaded", quantity: 1 }, // 10900
        { menuItemId: "burger-crispy", quantity: 2 }, // 4000 * 2 = 8000
      ],
      customerNote: "Please serve hot",
    });

    expect(order.orderNumber).toMatch(/^CD-\d+$/);
    expect(order.orderType).toBe("dine_in");
    expect(order.orderStatus).toBe("placed");
    expect(order.paymentStatus).toBe("pending");
    expect(order.paymentMethod).toBe("pay_at_counter");
    expect(order.tableLabel).toBe("Table 1");
    expect(order.tableId).toBe("d0000000-0000-0000-0000-000000000001");
    // 10900 + 8000 = 18900
    expect(order.subtotalMinor).toBe(18900);
    expect(order.totalMinor).toBe(18900);
    expect(order.deliveryFeeMinor).toBe(0);
  });

  it("rejects dine-in order when table cookie is missing", async () => {
    mockGetTableContext.mockResolvedValue(null); // No table cookie

    await expect(
      placeOrder({
        orderType: "dine_in",
        paymentMethod: "pay_at_counter",
        idempotencyKey: "idem_key_test_002",
        items: [{ menuItemId: "fries-cheese-loaded", quantity: 1 }],
      })
    ).rejects.toThrow(/No active table session found/);
  });

  it("rejects dine-in order if payment method is not pay_at_counter", async () => {
    mockGetTableContext.mockResolvedValue({
      tableId: "d0000000-0000-0000-0000-000000000001",
      tableLabel: "Table 1",
      issuedAt: Date.now(),
    });

    await expect(
      placeOrder({
        orderType: "dine_in",
        paymentMethod: "razorpay", // Invalid for dine-in default
        idempotencyKey: "idem_key_test_003",
        items: [{ menuItemId: "fries-cheese-loaded", quantity: 1 }],
      })
    ).rejects.toThrow(/Dine-in orders currently use Pay at counter/);
  });

  it("deduplicates orders with the same idempotency key", async () => {
    mockGetTableContext.mockResolvedValue({
      tableId: "d0000000-0000-0000-0000-000000000001",
      tableLabel: "Table 1",
      issuedAt: Date.now(),
    });

    const key = "idem_key_test_duplicate_check";

    const order1 = await placeOrder({
      orderType: "dine_in",
      paymentMethod: "pay_at_counter",
      idempotencyKey: key,
      items: [{ menuItemId: "fries-cheese-loaded", quantity: 1 }],
    });

    const order2 = await placeOrder({
      orderType: "dine_in",
      paymentMethod: "pay_at_counter",
      idempotencyKey: key,
      items: [{ menuItemId: "fries-cheese-loaded", quantity: 1 }],
    });

    // Both calls must return identical order without incrementing sequence or creating new ID
    expect(order1.id).toBe(order2.id);
    expect(order1.orderNumber).toBe(order2.orderNumber);
  });

  it("places a guest dine-in order successfully without requiring customer login when signed table cookie is present", async () => {
    // Simulate unauthenticated guest (getAuthSession returns null)
    const { getAuthSession } = await import("@/lib/auth/server");
    vi.mocked(getAuthSession).mockResolvedValueOnce(null);

    mockGetTableContext.mockResolvedValue({
      tableId: "d0000000-0000-0000-0000-000000000003",
      tableLabel: "Table 3",
      issuedAt: Date.now(),
    });

    const order = await placeOrder({
      orderType: "dine_in",
      paymentMethod: "pay_at_counter",
      idempotencyKey: "idem_guest_diner_no_login_001",
      customerName: "Rahul",
      customerPhone: "+919876543210",
      items: [{ menuItemId: "fries-cheese-loaded", quantity: 1 }],
      customerNote: "Make it extra cheesy",
    });

    expect(order.orderNumber).toMatch(/^CD-\d+$/);
    expect(order.orderType).toBe("dine_in");
    expect(order.tableLabel).toBe("Table 3");
    expect(order.customerClerkId).toMatch(/^guest_tbl_table_3_/);
    expect(order.contactPhone).toBe("+919876543210");
    expect(order.deliveryAddressSnapshot).toEqual({ recipientName: "Rahul" });
    expect(order.orderStatus).toBe("placed");
    expect(order.paymentStatus).toBe("pending");
    expect(order.paymentMethod).toBe("pay_at_counter");
  });
});
