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

// Global state stores attached to globalThis to ensure singletons across
// all Next.js Server Action chunks and SSR modules in the Node.js process.
declare global {
  var __cheezy_orders_store__: Map<string, OrderRecord> | undefined;
  var __cheezy_idempotency_store__: Map<string, string> | undefined;
  var __cheezy_audit_logs_store__: AuditLogEntry[] | undefined;
  var __cheezy_order_razorpay_map__: Map<string, string> | undefined;
  var __cheezy_order_counter__: number | undefined;
}

export const ORDERS_STORE: Map<string, OrderRecord> =
  globalThis.__cheezy_orders_store__ ?? (globalThis.__cheezy_orders_store__ = new Map());

export const IDEMPOTENCY_STORE: Map<string, string> =
  globalThis.__cheezy_idempotency_store__ ?? (globalThis.__cheezy_idempotency_store__ = new Map());

export const AUDIT_LOGS_STORE: AuditLogEntry[] =
  globalThis.__cheezy_audit_logs_store__ ?? (globalThis.__cheezy_audit_logs_store__ = []);

export const ORDER_RAZORPAY_MAP: Map<string, string> =
  globalThis.__cheezy_order_razorpay_map__ ?? (globalThis.__cheezy_order_razorpay_map__ = new Map());

export function getNextOrderNumber(): string {
  if (globalThis.__cheezy_order_counter__ === undefined) {
    globalThis.__cheezy_order_counter__ = 100;
  }
  globalThis.__cheezy_order_counter__ += 1;
  return `CD-${globalThis.__cheezy_order_counter__}`;
}
