import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getKitchenOrders,
  transitionOrderStatus,
  markOrderPaidAtCounter,
  getAuditLogs,
} from "@/services/kitchen-service";
import {
  toggleMenuItemAvailability,
  updateCafeSettings,
  rotateTableToken,
} from "@/services/admin-service";
import { ORDERS_STORE, type OrderRecord } from "@/lib/orders/order-store";

// Mock staff auth
const { mockRequireStaffAuth } = vi.hoisted(() => ({
  mockRequireStaffAuth: vi.fn(),
}));

vi.mock("@/lib/auth/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/server")>();
  return {
    ...actual,
    requireStaffAuth: () => mockRequireStaffAuth(),
  };
});

describe("Kitchen & Admin Services (Phase 6 State Machine & RBAC)", () => {
  const testOrderId = "test_ord_kitchen_101";

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup a clean test order in ORDERS_STORE
    const testOrder: OrderRecord = {
      id: testOrderId,
      orderNumber: "CD-999",
      customerClerkId: "user_customer_test",
      contactPhone: "+919876543210",
      orderType: "dine_in",
      orderStatus: "placed",
      paymentMethod: "pay_at_counter",
      paymentStatus: "pending",
      tableId: "d0000000-0000-0000-0000-000000000001",
      tableLabel: "Table 1",
      subtotalMinor: 10900,
      discountMinor: 0,
      deliveryFeeMinor: 0,
      taxMinor: 0,
      totalMinor: 10900,
      idempotencyKey: "test_idem_999",
      items: [
        {
          menuItemId: "fries-cheese-loaded",
          nameSnapshot: "Cheese Loaded Fries",
          unitPriceMinor: 10900,
          quantity: 1,
          modifiersSnapshot: [],
          lineTotalMinor: 10900,
        },
      ],
      placedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    ORDERS_STORE.set(testOrderId, testOrder);
  });

  it("fetches active orders for kitchen in FIFO order", async () => {
    mockRequireStaffAuth.mockResolvedValue({
      userId: "staff_kitchen_1",
      role: "kitchen",
    });

    const orders = await getKitchenOrders();
    expect(Array.isArray(orders)).toBe(true);
    const found = orders.find((o) => o.id === testOrderId);
    expect(found).toBeDefined();
    expect(found?.orderStatus).toBe("placed");
  });

  it("kitchen executes valid dine-in order lifecycle: placed -> accepted -> preparing -> ready -> served", async () => {
    mockRequireStaffAuth.mockResolvedValue({
      userId: "staff_kitchen_1",
      role: "kitchen",
    });

    // 1. Accept
    const orderAccepted = await transitionOrderStatus(testOrderId, "accepted");
    expect(orderAccepted.orderStatus).toBe("accepted");

    // 2. Start cooking
    const orderPreparing = await transitionOrderStatus(testOrderId, "preparing");
    expect(orderPreparing.orderStatus).toBe("preparing");

    // 3. Mark ready
    const orderReady = await transitionOrderStatus(testOrderId, "ready");
    expect(orderReady.orderStatus).toBe("ready");

    // 4. Mark served
    const orderServed = await transitionOrderStatus(testOrderId, "served");
    expect(orderServed.orderStatus).toBe("served");

    // Check audit logs
    const logs = await getAuditLogs(testOrderId);
    expect(logs.length).toBeGreaterThanOrEqual(4);
    const lastLog = logs[logs.length - 1];
    expect(lastLog.action).toBe("order_status_transition");
    expect(lastLog.actorRole).toBe("kitchen");
  });

  it("rejects illegal skip transition (e.g. placed directly to ready)", async () => {
    mockRequireStaffAuth.mockResolvedValue({
      userId: "staff_kitchen_1",
      role: "kitchen",
    });

    await expect(transitionOrderStatus(testOrderId, "ready")).rejects.toThrow(
      /INVALID_TRANSITION/
    );
  });

  it("allows staff to mark dine-in order as paid at counter", async () => {
    mockRequireStaffAuth.mockResolvedValue({
      userId: "staff_admin_1",
      role: "admin",
    });

    const paidOrder = await markOrderPaidAtCounter(testOrderId);
    expect(paidOrder.paymentStatus).toBe("paid");
  });

  it("enforces RBAC: kitchen role CANNOT toggle menu availability or change cafe settings", async () => {
    mockRequireStaffAuth.mockResolvedValue({
      userId: "staff_kitchen_1",
      role: "kitchen", // Kitchen role only
    });

    await expect(
      toggleMenuItemAvailability("burger-crispy", false)
    ).rejects.toThrow(/UNAUTHORIZED/);

    await expect(
      updateCafeSettings({ isOpen: false })
    ).rejects.toThrow(/UNAUTHORIZED/);

    await expect(
      rotateTableToken("d0000000-0000-0000-0000-000000000001")
    ).rejects.toThrow(/UNAUTHORIZED/);
  });

  it("allows admin and owner to toggle menu availability and rotate table tokens", async () => {
    mockRequireStaffAuth.mockResolvedValue({
      userId: "staff_admin_1",
      role: "admin",
    });

    const toggleResult = await toggleMenuItemAvailability("burger-crispy", false);
    expect(toggleResult.isAvailable).toBe(false);

    const newToken = await rotateTableToken("d0000000-0000-0000-0000-000000000001");
    expect(newToken).toMatch(/^cd_tbl_tok_/);
  });
});
