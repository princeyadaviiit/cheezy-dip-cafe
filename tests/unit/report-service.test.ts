import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getSalesReport } from "@/services/report-service";
import { ORDERS_STORE, type OrderRecord } from "@/lib/orders/order-store";

// Mock staff auth
vi.mock("@/lib/auth/server", () => ({
  requireStaffAuth: vi.fn().mockResolvedValue({
    userId: "staff_admin_test",
    role: "admin",
  }),
  getAuthSession: vi.fn(),
  requireCustomerAuth: vi.fn(),
}));

describe("Sales Report Service", () => {
  const testOrderId = "report_test_order_1";

  beforeEach(() => {
    vi.clearAllMocks();
    const sampleOrder: OrderRecord = {
      id: testOrderId,
      orderNumber: "CD-RPT-1",
      customerClerkId: "cust_test_1",
      contactPhone: "+918696321018",
      orderType: "dine_in",
      orderStatus: "served",
      paymentMethod: "pay_at_counter",
      paymentStatus: "paid",
      tableId: "tbl_1",
      tableLabel: "Table 1",
      items: [
        {
          menuItemId: "burger-crispy",
          nameSnapshot: "Crispy Veg Burger",
          unitPriceMinor: 12900,
          quantity: 2,
          modifiersSnapshot: [],
          lineTotalMinor: 25800,
        },
      ],
      subtotalMinor: 25800,
      discountMinor: 0,
      deliveryFeeMinor: 0,
      taxMinor: 0,
      totalMinor: 25800,
      idempotencyKey: "idem_rpt_test_1",
      placedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    ORDERS_STORE.set(testOrderId, sampleOrder);
  });

  afterEach(() => {
    ORDERS_STORE.delete(testOrderId);
  });

  it("calculates sales metrics and channel split matching active orders", async () => {
    const report = await getSalesReport("today");

    expect(report.timeframe).toBe("today");
    expect(typeof report.grossSalesMinor).toBe("number");
    expect(report.grossSalesMinor).toBeGreaterThan(0);
    expect(report.totalOrdersCount).toBeGreaterThan(0);
    expect(report.averageOrderValueMinor).toBeGreaterThan(0);

    // Channel split totals must equal gross sales
    const channelSum = report.dineIn.revenueMinor + report.delivery.revenueMinor;
    expect(channelSum).toBe(report.grossSalesMinor);

    // Payment method split totals must equal gross sales
    const paymentSum =
      report.paymentMethodSplit.payAtCounterMinor +
      report.paymentMethodSplit.razorpayMinor;
    expect(paymentSum).toBe(report.grossSalesMinor);

    // Top dishes array
    expect(Array.isArray(report.topDishes)).toBe(true);
    if (report.topDishes.length > 0) {
      expect(typeof report.topDishes[0].name).toBe("string");
      expect(report.topDishes[0].quantity).toBeGreaterThan(0);
    }
  });

  it("filters sales by timeframe (week and month)", async () => {
    const weekReport = await getSalesReport("week");
    expect(weekReport.timeframe).toBe("week");

    const monthReport = await getSalesReport("month");
    expect(monthReport.timeframe).toBe("month");
  });
});
