import { type OrderStatus } from "@/components/ui/status-badge";
import { type ActorRole } from "@/lib/orders/state-machine";

export interface OrderItemSnapshot {
  menuItemId: string;
  nameSnapshot: string;
  unitPriceMinor: number;
  quantity: number;
  modifiersSnapshot: { label: string; priceDeltaMinor: number }[];
  lineTotalMinor: number;
  note?: string;
}

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
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  idempotencyKey: string;
  items: OrderItemSnapshot[];
  placedAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  actorRole: ActorRole;
  actorUserId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Global state stores (in-memory for active dev/test)
export const ORDERS_STORE: Map<string, OrderRecord> = new Map();
export const IDEMPOTENCY_STORE: Map<string, string> = new Map();
export const AUDIT_LOGS_STORE: AuditLogEntry[] = [];

let orderCounter = 100;

export function getNextOrderNumber(): string {
  orderCounter += 1;
  return `CD-${orderCounter}`;
}

// Seed initial demo orders so kitchen and admin have realistic orders upon opening
if (ORDERS_STORE.size === 0) {
  const initialOrder1: OrderRecord = {
    id: "ord_demo_001",
    orderNumber: "CD-101",
    customerClerkId: "user_customer_rahul",
    contactPhone: "+919876543210",
    orderType: "dine_in",
    orderStatus: "placed",
    paymentMethod: "pay_at_counter",
    paymentStatus: "pending",
    tableId: "d0000000-0000-0000-0000-000000000001",
    tableLabel: "Table 1",
    customerNote: "Extra napkins please",
    subtotalMinor: 23800,
    discountMinor: 0,
    deliveryFeeMinor: 0,
    taxMinor: 0,
    totalMinor: 23800,
    idempotencyKey: "seed_idem_001",
    items: [
      {
        menuItemId: "fries-cheese-loaded",
        nameSnapshot: "Cheese Loaded Fries",
        unitPriceMinor: 10900,
        quantity: 1,
        modifiersSnapshot: [{ label: "Extra Cheddar Dip (+₹40)", priceDeltaMinor: 4000 }],
        lineTotalMinor: 14900,
      },
      {
        menuItemId: "burger-crispy",
        nameSnapshot: "Crispy Veg Burger",
        unitPriceMinor: 4000,
        quantity: 2,
        modifiersSnapshot: [],
        lineTotalMinor: 8000,
      },
    ],
    placedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 mins ago
    updatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  };

  const initialOrder2: OrderRecord = {
    id: "ord_demo_002",
    orderNumber: "CD-102",
    customerClerkId: "user_customer_priya",
    contactPhone: "+919876543211",
    orderType: "dine_in",
    orderStatus: "preparing",
    paymentMethod: "pay_at_counter",
    paymentStatus: "pending",
    tableId: "d0000000-0000-0000-0000-000000000002",
    tableLabel: "Table 2",
    subtotalMinor: 12900,
    discountMinor: 0,
    deliveryFeeMinor: 0,
    taxMinor: 0,
    totalMinor: 12900,
    idempotencyKey: "seed_idem_002",
    items: [
      {
        menuItemId: "burger-crispy-dip",
        nameSnapshot: "Crispy Dip Special Burger",
        unitPriceMinor: 12900,
        quantity: 1,
        modifiersSnapshot: [],
        lineTotalMinor: 12900,
        note: "Less spicy",
      },
    ],
    placedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 mins ago
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  };

  const initialOrder3: OrderRecord = {
    id: "ord_demo_delivery",
    orderNumber: "CD-103",
    customerClerkId: "user_customer_delivery_demo",
    contactPhone: "+919876543212",
    orderType: "delivery",
    orderStatus: "pending_payment",
    paymentMethod: "razorpay",
    paymentStatus: "pending",
    deliveryAddressSnapshot: {
      recipientName: "Aarav Sharma",
      phone: "+919876543212",
      line1: "Flat 402, Sunshine Apts",
      area: "Raja Park",
      pincode: "302004",
      googleMapsUrl: "https://www.google.com/maps?q=26.892,75.826",
    },
    subtotalMinor: 25000,
    discountMinor: 0,
    deliveryFeeMinor: 3000,
    taxMinor: 0,
    totalMinor: 28000,
    idempotencyKey: "seed_idem_003",
    items: [
      {
        menuItemId: "burger-paneer-tikka",
        nameSnapshot: "Paneer Tikka Burger",
        unitPriceMinor: 25000,
        quantity: 1,
        modifiersSnapshot: [],
        lineTotalMinor: 25000,
      },
    ],
    placedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  };

  ORDERS_STORE.set(initialOrder1.id, initialOrder1);
  ORDERS_STORE.set(initialOrder2.id, initialOrder2);
  ORDERS_STORE.set(initialOrder3.id, initialOrder3);
}
