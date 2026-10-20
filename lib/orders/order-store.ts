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

// Global state stores (starts completely clean in production)
export const ORDERS_STORE: Map<string, OrderRecord> = new Map();
export const IDEMPOTENCY_STORE: Map<string, string> = new Map();
export const AUDIT_LOGS_STORE: AuditLogEntry[] = [];

let orderCounter = 100;

export function getNextOrderNumber(): string {
  orderCounter += 1;
  return `CD-${orderCounter}`;
}
