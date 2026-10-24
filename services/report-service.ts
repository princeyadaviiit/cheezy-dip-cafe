"use server";

import { requireStaffAuth } from "@/lib/auth/server";
import { ORDERS_STORE, type OrderRecord } from "@/lib/orders/order-store";
import { loadAllOrderRecords } from "@/lib/orders/order-persistence";

export interface SalesReportSummary {
  timeframe: "today" | "week" | "month";
  grossSalesMinor: number;
  totalOrdersCount: number;
  averageOrderValueMinor: number;
  dineIn: {
    ordersCount: number;
    revenueMinor: number;
  };
  delivery: {
    ordersCount: number;
    revenueMinor: number;
  };
  paymentMethodSplit: {
    payAtCounterMinor: number;
    razorpayMinor: number;
  };
  topDishes: Array<{
    name: string;
    quantity: number;
    revenueMinor: number;
  }>;
}

export async function getSalesReport(
  timeframe: "today" | "week" | "month" = "today"
): Promise<SalesReportSummary> {
  await requireStaffAuth();

  const now = Date.now();
  const startTime =
    timeframe === "today"
      ? now - 24 * 60 * 60 * 1000
      : timeframe === "week"
      ? now - 7 * 24 * 60 * 60 * 1000
      : now - 30 * 24 * 60 * 60 * 1000;

  // Filter orders in timeframe that are paid or active (excluding cancelled/expired)
  const allOrders = await loadAllOrderRecords();
  const orders = allOrders.filter((o) => {
    const placed = new Date(o.placedAt).getTime();
    const isFinishedOrActive =
      o.orderStatus !== "cancelled" && o.orderStatus !== "expired" && o.orderStatus !== "rejected";
    return placed >= startTime && isFinishedOrActive;
  });

  let grossSalesMinor = 0;
  let dineInRevenueMinor = 0;
  let dineInOrdersCount = 0;
  let deliveryRevenueMinor = 0;
  let deliveryOrdersCount = 0;
  let payAtCounterMinor = 0;
  let razorpayMinor = 0;

  const dishMap: Map<string, { quantity: number; revenueMinor: number }> = new Map();

  for (const ord of orders) {
    grossSalesMinor += ord.totalMinor;

    if (ord.orderType === "dine_in") {
      dineInOrdersCount += 1;
      dineInRevenueMinor += ord.totalMinor;
    } else {
      deliveryOrdersCount += 1;
      deliveryRevenueMinor += ord.totalMinor;
    }

    if (ord.paymentMethod === "pay_at_counter") {
      payAtCounterMinor += ord.totalMinor;
    } else {
      razorpayMinor += ord.totalMinor;
    }

    // Dish breakdown
    for (const item of ord.items) {
      const existing = dishMap.get(item.nameSnapshot) || { quantity: 0, revenueMinor: 0 };
      dishMap.set(item.nameSnapshot, {
        quantity: existing.quantity + item.quantity,
        revenueMinor: existing.revenueMinor + item.lineTotalMinor,
      });
    }
  }

  const totalOrdersCount = orders.length;
  const averageOrderValueMinor =
    totalOrdersCount > 0 ? Math.round(grossSalesMinor / totalOrdersCount) : 0;

  const topDishes = Array.from(dishMap.entries())
    .map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenueMinor: data.revenueMinor,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    timeframe,
    grossSalesMinor,
    totalOrdersCount,
    averageOrderValueMinor,
    dineIn: {
      ordersCount: dineInOrdersCount,
      revenueMinor: dineInRevenueMinor,
    },
    delivery: {
      ordersCount: deliveryOrdersCount,
      revenueMinor: deliveryRevenueMinor,
    },
    paymentMethodSplit: {
      payAtCounterMinor,
      razorpayMinor,
    },
    topDishes,
  };
}
