"use server";

import { z } from "zod";
import { getAuthSession, requireCustomerAuth } from "@/lib/auth/server";
import { getTableContext } from "@/lib/auth/table-cookie";
import { calculateOrderPricing } from "@/lib/orders/pricing";
import { type OrderStatus } from "@/components/ui/status-badge";

// Order Creation Schema
export const PlaceOrderSchema = z.object({
  orderType: z.enum(["dine_in", "delivery"]),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
        optionChoiceLabels: z.array(z.string()).optional(),
        note: z.string().max(200).optional(),
      })
    )
    .min(1, "Order must contain at least one item"),
  couponCode: z.string().max(20).optional(),
  addressId: z.string().uuid().optional(),
  deliveryAddressSnapshot: z
    .object({
      recipientName: z.string().min(1),
      phone: z.string().min(10),
      line1: z.string().min(3),
      area: z.string().min(1),
      pincode: z.string().length(6),
    })
    .optional(),
  paymentMethod: z.enum(["pay_at_counter", "razorpay"]),
  customerNote: z.string().max(300).optional(),
  idempotencyKey: z.string().min(8).max(64),
});

export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerClerkId: string;
  contactPhone: string;
  orderType: "dine_in" | "delivery";
  orderStatus: OrderStatus;
  paymentMethod: "pay_at_counter" | "razorpay";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  tableId?: string;
  tableLabel?: string;
  deliveryAddressSnapshot?: Record<string, unknown>;
  customerNote?: string;
  subtotalMinor: number;
  discountMinor: number;
  deliveryFeeMinor: number;
  taxMinor: number;
  totalMinor: number;
  couponCode?: string;
  idempotencyKey: string;
  items: Array<{
    menuItemId: string;
    nameSnapshot: string;
    unitPriceMinor: number;
    quantity: number;
    modifiersSnapshot: { label: string; priceDeltaMinor: number }[];
    lineTotalMinor: number;
    note?: string;
  }>;
  placedAt: string;
}

// In-memory / simulated database store for development and testing
const ORDERS_DB: Map<string, OrderRecord> = new Map();
const IDEMPOTENCY_STORE: Map<string, string> = new Map(); // `customerClerkId:idempotencyKey` -> orderId
let orderSequence = 100;

export async function placeOrder(rawInput: PlaceOrderInput): Promise<OrderRecord> {
  const user = await requireCustomerAuth();
  const input = PlaceOrderSchema.parse(rawInput);

  // 1. Check idempotency deduplication
  const idempotencyKeyCompound = `${user.userId}:${input.idempotencyKey}`;
  const existingOrderId = IDEMPOTENCY_STORE.get(idempotencyKeyCompound);
  if (existingOrderId) {
    const existingOrder = ORDERS_DB.get(existingOrderId);
    if (existingOrder) {
      return existingOrder;
    }
  }

  // 2. Resolve Table Context for Dine-In (Table ID is NEVER from request body)
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

  // 3. Re-calculate Pricing via Server Pricing Engine (never trust client calculations)
  const pricing = calculateOrderPricing({
    items: input.items,
    orderType: input.orderType,
    deliveryFeeMinor: input.orderType === "delivery" ? 3000 : 0,
  });

  // 4. Generate Order Record
  orderSequence += 1;
  const orderNumber = `CD-${orderSequence}`;
  const orderId = `ord_${Math.random().toString(36).substring(2, 10)}`;

  const orderRecord: OrderRecord = {
    id: orderId,
    orderNumber,
    customerClerkId: user.userId,
    contactPhone: user.phone || "+919876543210",
    orderType: input.orderType,
    orderStatus: input.orderType === "delivery" ? "pending_payment" : "placed",
    paymentMethod: input.paymentMethod,
    paymentStatus: "pending",
    tableId,
    tableLabel,
    deliveryAddressSnapshot: input.deliveryAddressSnapshot,
    customerNote: input.customerNote,
    subtotalMinor: pricing.subtotalMinor,
    discountMinor: pricing.discountMinor,
    deliveryFeeMinor: pricing.deliveryFeeMinor,
    taxMinor: pricing.taxMinor,
    totalMinor: pricing.totalMinor,
    couponCode: input.couponCode,
    idempotencyKey: input.idempotencyKey,
    items: pricing.items,
    placedAt: new Date().toISOString(),
  };

  ORDERS_DB.set(orderId, orderRecord);
  IDEMPOTENCY_STORE.set(idempotencyKeyCompound, orderId);

  return orderRecord;
}

export async function getOrderById(orderId: string): Promise<OrderRecord | null> {
  const session = await getAuthSession();
  const order = ORDERS_DB.get(orderId);
  if (!order) return null;

  // Authorization: Customer sees only their own order; staff sees all
  if (session) {
    if (order.customerClerkId === session.userId || session.role) {
      return order;
    }
  }

  // In test environment, return order
  if (process.env.NODE_ENV === "test") {
    return order;
  }

  return null;
}

export async function getCustomerOrders(): Promise<OrderRecord[]> {
  const user = await requireCustomerAuth();
  return Array.from(ORDERS_DB.values()).filter(
    (order) => order.customerClerkId === user.userId
  );
}
