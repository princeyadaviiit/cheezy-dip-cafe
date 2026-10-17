"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Utensils,
  ArrowLeft,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { getOrderById, type OrderRecord } from "@/services/order-service";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

const DINE_IN_STEPS = [
  { status: "placed", label: "Order Placed", desc: "Received by kitchen" },
  { status: "accepted", label: "Accepted", desc: "Order confirmed" },
  { status: "preparing", label: "Cooking", desc: "Melting in the kitchen" },
  { status: "ready", label: "Ready", desc: "Plated for service" },
  { status: "served", label: "Served", desc: "Enjoy your meal!" },
];

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = React.useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await getOrderById(orderId);
      if (data) {
        setOrder(data);
      }
    } catch {
      // Ignore polling errors
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    let active = true;
    getOrderById(orderId).then((data) => {
      if (active) {
        if (data) setOrder(data);
        setLoading(false);
      }
    });

    const interval = setInterval(() => {
      getOrderById(orderId).then((data) => {
        if (active && data) {
          setOrder(data);
        }
      });
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-12 h-12 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[var(--muted)]">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-base font-bold text-white">Order not found</h2>
        <p className="text-xs text-[var(--muted)]">
          We couldn&apos;t locate the order details for this ID.
        </p>
        <Link href="/order">
          <Button variant="primary">Back to Menu</Button>
        </Link>
      </div>
    );
  }

  // Calculate current step index for visual stepper
  const currentStepIdx = DINE_IN_STEPS.findIndex((s) => s.status === order.orderStatus);

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/order"
            className="w-10 h-10 rounded-xl bg-neutral-900 border border-[var(--border)] flex items-center justify-center text-neutral-300 hover:text-white"
            aria-label="Back to menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold font-display text-white">
              Order {order.orderNumber}
            </h1>
            <p className="text-[11px] text-[var(--muted)]">
              {new Date(order.placedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchOrder(true)}
          disabled={refreshing}
          className="p-2 rounded-xl bg-neutral-900 border border-[var(--border)] text-neutral-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Refresh status"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[var(--accent)]" : ""}`} />
        </button>
      </div>

      {/* Main Status Hero Card */}
      <div className="p-4 bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl border border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs text-[var(--muted)]">Current Status</p>
              <h2 className="text-sm font-bold text-white capitalize">
                {order.orderStatus.replace("_", " ")}
              </h2>
            </div>
          </div>
          <StatusBadge status={order.orderStatus} />
        </div>

        {/* Dine-In Table Banner */}
        {order.tableLabel && (
          <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs">
            <span className="text-amber-200 font-semibold flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-400" /> Seated at {order.tableLabel}
            </span>
            <span className="text-[11px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-medium">
              Pay at counter
            </span>
          </div>
        )}

        {/* Live Stepper */}
        <div className="pt-2">
          <div className="relative flex justify-between">
            {DINE_IN_STEPS.map((step, idx) => {
              const isDone = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;

              return (
                <div key={step.status} className="flex flex-col items-center flex-1 text-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors z-10 ${
                      isCurrent
                        ? "bg-[var(--accent)] text-black ring-4 ring-amber-500/20"
                        : isDone
                        ? "bg-emerald-500 text-black"
                        : "bg-neutral-800 text-neutral-500 border border-neutral-700"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-[10px] font-semibold leading-tight ${
                      isCurrent
                        ? "text-[var(--accent)]"
                        : isDone
                        ? "text-white"
                        : "text-neutral-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Items Breakdown Card */}
      <div className="p-4 bg-neutral-900/80 rounded-2xl border border-[var(--border)] space-y-3 text-xs">
        <h3 className="font-bold text-white text-sm pb-1 border-b border-neutral-800">
          Items Ordered
        </h3>
        <div className="space-y-2.5">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-white">
                  {item.quantity}x {item.nameSnapshot}
                </p>
                {item.modifiersSnapshot && item.modifiersSnapshot.length > 0 && (
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {item.modifiersSnapshot.map((m) => m.label).join(", ")}
                  </p>
                )}
                {item.note && (
                  <p className="text-[10px] text-amber-300/80 italic mt-0.5">
                    &quot;{item.note}&quot;
                  </p>
                )}
              </div>
              <span className="font-bold text-white shrink-0">
                ₹{Math.round(item.lineTotalMinor / 100)}
              </span>
            </div>
          ))}
        </div>

        {/* Financial Details */}
        <div className="pt-2 border-t border-neutral-800 space-y-1.5 text-neutral-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{Math.round(order.subtotalMinor / 100)}</span>
          </div>
          {order.deliveryFeeMinor > 0 && (
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹{Math.round(order.deliveryFeeMinor / 100)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm font-extrabold text-white pt-1 border-t border-neutral-850">
            <span>Total Amount</span>
            <span className="text-base text-[var(--accent)]">
              ₹{Math.round(order.totalMinor / 100)}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Note */}
      {order.customerNote && (
        <div className="p-3 bg-neutral-900/60 rounded-xl border border-[var(--border)] text-xs">
          <p className="text-[11px] text-[var(--muted)]">Note to kitchen:</p>
          <p className="text-neutral-200 mt-0.5">{order.customerNote}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        <Link href="/order" className="block">
          <Button variant="outline" size="md" className="w-full font-bold">
            + Order More Items
          </Button>
        </Link>
        <Link href="/order/orders" className="block">
          <Button variant="ghost" size="sm" className="w-full text-xs text-neutral-400">
            View All Past Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}
