import { type OrderStatus } from "@/components/ui/status-badge";
import { type StaffRole } from "@/lib/auth/server";

export type ActorRole = "customer" | StaffRole;

interface TransitionRule {
  from: OrderStatus;
  to: OrderStatus;
  allowedActors: ActorRole[];
}

const TRANSITIONS: TransitionRule[] = [
  // Dine-in & Delivery Placed to Accepted
  { from: "placed", to: "accepted", allowedActors: ["kitchen", "admin", "owner"] },
  { from: "placed", to: "rejected", allowedActors: ["kitchen", "admin", "owner"] },
  { from: "placed", to: "cancelled", allowedActors: ["customer", "admin", "owner"] }, // OD-06 customer can cancel before acceptance

  // Preparation & Kitchen
  { from: "accepted", to: "preparing", allowedActors: ["kitchen", "admin", "owner"] },
  { from: "accepted", to: "cancelled", allowedActors: ["admin", "owner"] },
  { from: "preparing", to: "ready", allowedActors: ["kitchen", "admin", "owner"] },

  // Dine-in Serving
  { from: "ready", to: "served", allowedActors: ["kitchen", "admin", "owner"] },
  { from: "served", to: "completed", allowedActors: ["admin", "owner", "kitchen"] },

  // Delivery Transitions
  { from: "pending_payment", to: "placed", allowedActors: ["admin", "owner"] }, // Via payment verification / webhook
  { from: "pending_payment", to: "expired", allowedActors: ["admin", "owner"] }, // Cron expiry
  { from: "ready", to: "out_for_delivery", allowedActors: ["kitchen", "admin", "owner"] },
  { from: "out_for_delivery", to: "delivered", allowedActors: ["kitchen", "admin", "owner"] },
  { from: "delivered", to: "completed", allowedActors: ["admin", "owner"] },
];

/**
 * Validates whether a state transition is legal for the given actor role
 */
export function isValidTransition(
  from: OrderStatus,
  to: OrderStatus,
  actor: ActorRole
): boolean {
  return TRANSITIONS.some(
    (rule) =>
      rule.from === from &&
      rule.to === to &&
      rule.allowedActors.includes(actor)
  );
}

/**
 * Asserts valid transition or throws clear error
 */
export function assertValidTransition(
  from: OrderStatus,
  to: OrderStatus,
  actor: ActorRole
): void {
  if (!isValidTransition(from, to, actor)) {
    throw new Error(
      `INVALID_TRANSITION: Cannot transition order from '${from}' to '${to}' as actor '${actor}'.`
    );
  }
}
