"use server";

import { requireStaffAuth } from "@/lib/auth/server";
import { assertValidTransition } from "@/lib/orders/state-machine";
import { type OrderStatus } from "@/components/ui/status-badge";
import {
  ORDERS_STORE,
  AUDIT_LOGS_STORE,
  type OrderRecord,
  type AuditLogEntry,
} from "@/lib/orders/order-store";
import {
  findOrderRecordById,
  updateOrderRecord,
  loadAllOrderRecords,
} from "@/lib/orders/order-persistence";

/**
 * Get active orders for the Kitchen Display System (FIFO order)
 */
export async function getKitchenOrders(): Promise<OrderRecord[]> {
  await requireStaffAuth();

  const activeStatuses: OrderStatus[] = ["placed", "accepted", "preparing", "ready"];
  const allOrders = await loadAllOrderRecords();

  return allOrders
    .filter((order) => activeStatuses.includes(order.orderStatus))
    .sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime());
}

/**
 * Transition order status following strict state machine rules and logging audit trail
 */
export async function transitionOrderStatus(
  orderId: string,
  toStatus: OrderStatus
): Promise<OrderRecord> {
  const staff = await requireStaffAuth();
  const order = await findOrderRecordById(orderId);

  if (!order) {
    throw new Error(`ORDER_NOT_FOUND: Order with ID '${orderId}' does not exist.`);
  }

  const fromStatus = order.orderStatus;

  // Enforce state transition rules based on staff role
  assertValidTransition(fromStatus, toStatus, staff.role);

  // Update order record
  order.orderStatus = toStatus;
  order.updatedAt = new Date().toISOString();
  await updateOrderRecord(order);

  // Record immutable audit log entry
  const auditEntry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    entity: "order",
    entityId: orderId,
    action: "order_status_transition",
    actorRole: staff.role,
    actorUserId: staff.userId,
    metadata: {
      fromStatus,
      toStatus,
      orderNumber: order.orderNumber,
      tableLabel: order.tableLabel,
    },
    createdAt: new Date().toISOString(),
  };

  AUDIT_LOGS_STORE.push(auditEntry);

  return order;
}

/**
 * Mark a dine-in order as paid at the counter (cash or UPI)
 */
export async function markOrderPaidAtCounter(orderId: string): Promise<OrderRecord> {
  const staff = await requireStaffAuth();
  const order = await findOrderRecordById(orderId);

  if (!order) {
    throw new Error(`ORDER_NOT_FOUND: Order with ID '${orderId}' does not exist.`);
  }

  order.paymentStatus = "paid";
  order.updatedAt = new Date().toISOString();
  await updateOrderRecord(order);

  // Record audit log entry
  const auditEntry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    entity: "order",
    entityId: orderId,
    action: "mark_paid_counter",
    actorRole: staff.role,
    actorUserId: staff.userId,
    metadata: {
      orderNumber: order.orderNumber,
      amountMinor: order.totalMinor,
      tableLabel: order.tableLabel,
    },
    createdAt: new Date().toISOString(),
  };

  AUDIT_LOGS_STORE.push(auditEntry);

  return order;
}

/**
 * Retrieve audit log entries for an order or entire system
 */
export async function getAuditLogs(entityId?: string): Promise<AuditLogEntry[]> {
  await requireStaffAuth();

  if (entityId) {
    return AUDIT_LOGS_STORE.filter((entry) => entry.entityId === entityId);
  }
  return [...AUDIT_LOGS_STORE].reverse();
}
