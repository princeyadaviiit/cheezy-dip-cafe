"use server";

import { getAuthSession, requireCustomerAuth } from "@/lib/auth/server";
import { getTableContext } from "@/lib/auth/table-cookie";
import { calculateOrderPricing } from "@/lib/orders/pricing";
import {
  ORDERS_STORE,
  IDEMPOTENCY_STORE,
  getNextOrderNumber,
  type OrderRecord,
} from "@/lib/orders/order-store";

export type { OrderRecord };

import { PlaceOrderSchema, type PlaceOrderInput } from "@/lib/orders/order-schema";
export type { PlaceOrderInput };
import { sendTelegramOrderAlert } from "@/services/telegram-service";

export async function placeOrder(rawInput: PlaceOrderInput): Promise<OrderRecord> {
  const input = PlaceOrderSchema.parse(rawInput);
  const session = await getAuthSession();

  // 1. Resolve Table Context for Dine-In (Table ID is NEVER from request body)
  let tableId: string | undefined;
  let tableLabel: string | undefined;

  if (input.orderType === "dine_in") {
    const tableCtx = await getTableContext();
    if (!tableCtx) {
      throw new Error(
        "DINE_IN_ERROR: No active table session found. Please scan the QR code located on your table."
      );
    }
    tableId = tableCtx.tableId;
    tableLabel = tableCtx.tableLabel;

    // Enforce default payment method for dine-in
    if (input.paymentMethod !== "pay_at_counter") {
      throw new Error("DINE_IN_ERROR: Dine-in orders currently use Pay at counter.");
    }
  } else {
    // Delivery validation
    if (!input.deliveryAddressSnapshot) {
      throw new Error("DELIVERY_ERROR: Delivery address is required for home delivery.");
    }
    if (input.paymentMethod !== "razorpay") {
      throw new Error("DELIVERY_ERROR: Delivery orders require online payment via Razorpay.");
    }
  }

  // 2. Resolve Customer Identity (Logged-in user or Guest Diner)
  const customerClerkId =
    session?.userId ||
    (input.orderType === "dine_in"
      ? `guest_tbl_${(tableLabel || "table").toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now().toString(36)}`
      : `guest_del_${Date.now().toString(36)}`);

  const contactPhone =
    input.customerPhone ||
    input.deliveryAddressSnapshot?.phone ||
    session?.phone ||
    "Dine-in Guest";

  // 3. Check idempotency deduplication
  const idempotencyKeyCompound = `${customerClerkId}:${input.idempotencyKey}`;
  const existingOrderId = IDEMPOTENCY_STORE.get(idempotencyKeyCompound);
  if (existingOrderId) {
    const existingOrder = ORDERS_STORE.get(existingOrderId);
    if (existingOrder) {
      return existingOrder;
    }
  }

  // 4. Re-calculate Pricing via Server Pricing Engine (never trust client calculations)
  const pricing = calculateOrderPricing({
    items: input.items,
    orderType: input.orderType,
    deliveryFeeMinor: input.orderType === "delivery" ? 3000 : 0,
  });

  // 5. Generate Order Record
  const orderNumber = getNextOrderNumber();
  const orderId = `ord_${Math.random().toString(36).substring(2, 10)}`;
  const now = new Date().toISOString();

  const deliverySnapshot =
    input.deliveryAddressSnapshot ||
    (input.customerName ? { recipientName: input.customerName } : undefined);

  const orderRecord: OrderRecord = {
    id: orderId,
    orderNumber,
    customerClerkId,
    contactPhone,
    orderType: input.orderType,
    orderStatus: input.orderType === "delivery" ? "pending_payment" : "placed",
    paymentMethod: input.paymentMethod,
    paymentStatus: "pending",
    tableId,
    tableLabel,
    deliveryAddressSnapshot: deliverySnapshot,
    customerNote: input.customerNote,
    subtotalMinor: pricing.subtotalMinor,
    discountMinor: pricing.discountMinor,
    deliveryFeeMinor: pricing.deliveryFeeMinor,
    taxMinor: pricing.taxMinor,
    totalMinor: pricing.totalMinor,
    couponCode: input.couponCode,
    idempotencyKey: input.idempotencyKey,
    items: pricing.items,
    placedAt: now,
    updatedAt: now,
  };

  ORDERS_STORE.set(orderId, orderRecord);
  IDEMPOTENCY_STORE.set(idempotencyKeyCompound, orderId);

  // Send realtime Telegram alert to admin bot if order is immediately placed (dine-in)
  if (orderRecord.orderStatus === "placed") {
    sendTelegramOrderAlert(orderRecord).catch((err) =>
      console.error("[Telegram] Dine-in order alert dispatch error:", err)
    );
  }

  return orderRecord;
}

export async function getOrderById(orderId: string): Promise<OrderRecord | null> {
  const session = await getAuthSession();
  const order = ORDERS_STORE.get(orderId);
  if (!order) return null;

  // 1. Staff can view all orders
  if (session?.role) {
    return order;
  }

  // 2. Customer tracking their order via direct unique order URL or session
  return order;
}

export async function getCustomerOrders(): Promise<OrderRecord[]> {
  const session = await getAuthSession();
  if (!session?.userId) {
    return [];
  }
  return Array.from(ORDERS_STORE.values()).filter(
    (order) => order.customerClerkId === session.userId
  );
}
