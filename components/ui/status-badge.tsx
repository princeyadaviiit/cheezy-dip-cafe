import * as React from "react";
import { cn } from "@/lib/utils";

export type OrderStatus =
  | "pending_payment"
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "rejected"
  | "cancelled"
  | "expired";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: OrderStatus;
  label?: string;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending_payment: {
    label: "Awaiting Payment",
    bg: "bg-amber-500/15 border-amber-500/30",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  placed: {
    label: "Order Placed",
    bg: "bg-blue-500/15 border-blue-500/30",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400 animate-pulse",
  },
  accepted: {
    label: "Accepted",
    bg: "bg-amber-500/15 border-amber-500/30",
    text: "text-amber-800 dark:text-amber-300",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  preparing: {
    label: "In Kitchen",
    bg: "bg-amber-500/15 border-amber-500/30",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400 animate-ping",
  },
  ready: {
    label: "Ready",
    bg: "bg-emerald-500/15 border-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-600 dark:bg-emerald-400",
  },
  served: {
    label: "Served",
    bg: "bg-emerald-500/15 border-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-600 dark:bg-emerald-400",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    bg: "bg-purple-500/15 border-purple-500/30",
    text: "text-purple-700 dark:text-purple-400",
    dot: "bg-purple-500 dark:bg-purple-400 animate-pulse",
  },
  delivered: {
    label: "Delivered",
    bg: "bg-emerald-500/15 border-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-600 dark:bg-emerald-400",
  },
  completed: {
    label: "Completed",
    bg: "bg-zinc-500/15 border-zinc-500/30",
    text: "text-zinc-700 dark:text-zinc-300",
    dot: "bg-zinc-500 dark:bg-zinc-400",
  },
  rejected: {
    label: "Declined",
    bg: "bg-rose-500/15 border-rose-500/30",
    text: "text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500 dark:bg-rose-400",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-rose-500/15 border-rose-500/30",
    text: "text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500 dark:bg-rose-400",
  },
  expired: {
    label: "Expired",
    bg: "bg-zinc-500/15 border-zinc-500/30",
    text: "text-zinc-600 dark:text-zinc-400",
    dot: "bg-zinc-500 dark:bg-zinc-400",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
  ...props
}) => {
  const config = statusConfig[status] || {
    label: status,
    bg: "bg-zinc-500/15 border-zinc-500/30",
    text: "text-zinc-700 dark:text-zinc-300",
    dot: "bg-zinc-500 dark:bg-zinc-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-[var(--r-pill)] border select-none",
        config.bg,
        config.text,
        className
      )}
      {...props}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} aria-hidden="true" />
      <span>{label || config.label}</span>
    </span>
  );
};
