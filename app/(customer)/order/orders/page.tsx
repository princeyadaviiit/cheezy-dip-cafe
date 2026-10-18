"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, ShoppingBag, ChevronRight } from "lucide-react";
import { getCustomerOrders, type OrderRecord } from "@/services/order-service";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await getCustomerOrders();
        setOrders(list.reverse());
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center gap-2">
        <Link
          href="/order"
          className="w-10 h-10 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)]"
          aria-label="Back to menu"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-lg font-bold font-display text-[var(--text)]">Your Orders</h1>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[var(--text-muted)]">Loading order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-8 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-inset)] text-[var(--text-muted)] mx-auto flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-[var(--text)]">No orders yet</h2>
          <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
            When you place dine-in or delivery orders, they will appear here with live preparation tracking.
          </p>
          <Link href="/order" className="inline-block pt-1">
            <Button variant="primary" size="sm">
              Start an Order
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((ord) => (
            <Link
              key={ord.id}
              href={`/order/orders/${ord.id}`}
              className="block p-4 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors shadow-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--text)]">
                    {ord.orderNumber}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    • {ord.orderType === "dine_in" ? ord.tableLabel || "Dine-in" : "Delivery"}
                  </span>
                </div>
                <StatusBadge status={ord.orderStatus} />
              </div>

              <div className="py-2.5 space-y-1">
                <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                  {ord.items.map((i) => `${i.quantity}x ${i.nameSnapshot}`).join(", ")}
                </p>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ord.placedAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-bold text-[var(--brand-primary)]">
                    ₹{Math.round(ord.totalMinor / 100)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--brand-primary)] font-semibold">
                <span>View Order Details & Status</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
