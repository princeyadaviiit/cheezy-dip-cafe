"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChefHat,
  Utensils,
  ArrowLeft,
  RefreshCw,
  Receipt,
  CreditCard,
} from "lucide-react";
import { getOrderById, type OrderRecord } from "@/services/order-service";
import { simulateTestModePayment } from "@/services/payment-service";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { BillModal } from "@/components/billing/bill-modal";

const DINE_IN_STEPS = [
  { status: "placed", label: "Placed", desc: "Received by kitchen" },
  { status: "accepted", label: "Accepted", desc: "Order confirmed" },
  { status: "preparing", label: "Cooking", desc: "Melting in the kitchen" },
  { status: "ready", label: "Ready", desc: "Plated for service" },
  { status: "served", label: "Served", desc: "Enjoy your meal!" },
];

const DELIVERY_STEPS = [
  { status: "placed", label: "Placed", desc: "Received by cafe" },
  { status: "accepted", label: "Accepted", desc: "Order confirmed" },
  { status: "preparing", label: "Cooking", desc: "Prepared fresh" },
  { status: "out_for_delivery", label: "On Way", desc: "Rider dispatched" },
  { status: "delivered", label: "Delivered", desc: "Delivered to you" },
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
  const [showBill, setShowBill] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

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

  const handlePayNow = async () => {
    if (!order) return;
    setIsPaying(true);
    setPaymentError("");
    try {
      const res = await simulateTestModePayment(order.id);
      if (res.success) {
        await fetchOrder(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment processing failed. Please try again.";
      setPaymentError(msg);
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-12 h-12 border-3 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[var(--text-muted)]">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-base font-bold text-[var(--text)]">Order not found</h2>
        <p className="text-xs text-[var(--text-muted)]">
          We couldn&apos;t locate the order details for this ID.
        </p>
        <Link href="/order">
          <Button variant="primary">Back to Menu</Button>
        </Link>
      </div>
    );
  }

  // Calculate current step index for visual stepper
  const activeSteps = order.orderType === "delivery" ? DELIVERY_STEPS : DINE_IN_STEPS;
  const currentStepIdx = activeSteps.findIndex((s) => s.status === order.orderStatus);

  const deliverySnap = order.deliveryAddressSnapshot as
    | {
        recipientName?: string;
        phone?: string;
        line1?: string;
        area?: string;
        pincode?: string;
        googleMapsUrl?: string;
        latitude?: number;
        longitude?: number;
      }
    | undefined;

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/order"
            className="w-10 h-10 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)]"
            aria-label="Back to menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold font-display text-[var(--text)]">
              Order {order.orderNumber}
            </h1>
            <p className="text-[11px] text-[var(--text-muted)]">
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
          className="p-2 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Refresh status"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[var(--brand-primary)]" : ""}`} />
        </button>
      </div>

      {/* Main Status Hero Card */}
      <div className="p-4 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Current Status</p>
              <h2 className="text-sm font-bold text-[var(--text)] capitalize">
                {order.orderStatus.replace("_", " ")}
              </h2>
            </div>
          </div>
          <StatusBadge status={order.orderStatus} />
        </div>

        {/* Dine-In Table Banner */}
        {order.tableLabel && (
          <div className="p-3 bg-[var(--bg-inset)] rounded-xl border border-[var(--brand-primary)]/30 flex items-center justify-between text-xs">
            <span className="text-[var(--text)] font-semibold flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-[var(--brand-primary)]" /> Seated at {order.tableLabel}
            </span>
            <span className="text-[11px] text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 px-2 py-0.5 rounded border border-[var(--brand-primary)]/20 font-medium">
              Pay at counter
            </span>
          </div>
        )}

        {/* Delivery Address Banner */}
        {order.orderType === "delivery" && deliverySnap && (
          <div className="p-3 bg-[var(--bg-inset)] rounded-xl border border-[var(--border)] space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--text)]">Delivery Destination</span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Prepaid
              </span>
            </div>
            <p className="text-[var(--text)] text-xs">
              {deliverySnap.recipientName} • {deliverySnap.phone}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              {deliverySnap.line1}, {deliverySnap.area} - {deliverySnap.pincode}
            </p>
            {deliverySnap.googleMapsUrl && (
              <a
                href={deliverySnap.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-[var(--brand-primary)] font-semibold hover:underline pt-0.5"
              >
                📍 View Pinned GPS Location on Google Maps →
              </a>
            )}
          </div>
        )}

        {/* Razorpay Delivery Payment Action Box */}
        {order.orderType === "delivery" && order.paymentStatus !== "paid" && (
          <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
              <CreditCard className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>Payment Required to Start Cooking</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              This delivery order is pending prepaid payment. Our kitchen begins preparation immediately once your payment is confirmed.
            </p>
            <div className="flex items-center justify-between font-extrabold text-sm text-[var(--text)] pt-1">
              <span>Payable Amount:</span>
              <span className="text-lg text-[var(--brand-primary)]">
                ₹{Math.round(order.totalMinor / 100)}
              </span>
            </div>
            <Button
              variant="primary"
              size="lg"
              disabled={isPaying}
              onClick={handlePayNow}
              className="w-full font-extrabold min-h-[48px] flex items-center justify-center gap-2 cursor-pointer shadow-lg text-sm"
            >
              <CreditCard className="w-5 h-5" />
              <span>{isPaying ? "Verifying Payment..." : `💳 Pay ₹${Math.round(order.totalMinor / 100)} via Razorpay`}</span>
            </Button>
            {paymentError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">{paymentError}</p>
            )}
          </div>
        )}

        {/* Razorpay Paid Confirmation Banner */}
        {order.orderType === "delivery" && order.paymentStatus === "paid" && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Paid via Razorpay (Prepaid Verified)
            </span>
            <span className="font-mono text-xs">
              ₹{Math.round(order.totalMinor / 100)}
            </span>
          </div>
        )}

        {/* Live Stepper */}
        <div className="pt-2">
          <div className="relative flex justify-between">
            {activeSteps.map((step, idx) => {
              const isDone = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;

              return (
                <div key={step.status} className="flex flex-col items-center flex-1 text-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors z-10 ${
                      isCurrent
                        ? "bg-[var(--brand-primary)] text-[var(--text-on-brand)] ring-4 ring-[var(--brand-primary)]/20"
                        : isDone
                        ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black"
                        : "bg-[var(--bg-inset)] text-[var(--text-muted)] border border-[var(--border)]"
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
                        ? "text-[var(--brand-primary)]"
                        : isDone
                        ? "text-[var(--text)]"
                        : "text-[var(--text-muted)]"
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
      <div className="p-4 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] space-y-3 text-xs shadow-xs">
        <h3 className="font-bold text-[var(--text)] text-sm pb-1 border-b border-[var(--border)]">
          Items Ordered
        </h3>
        <div className="space-y-2.5">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-[var(--text)]">
                  {item.quantity}x {item.nameSnapshot}
                </p>
                {item.modifiersSnapshot && item.modifiersSnapshot.length > 0 && (
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {item.modifiersSnapshot.map((m) => m.label).join(", ")}
                  </p>
                )}
                {item.note && (
                  <p className="text-[10px] text-[var(--brand-primary)] italic mt-0.5">
                    &quot;{item.note}&quot;
                  </p>
                )}
              </div>
              <span className="font-bold text-[var(--text)] shrink-0">
                ₹{Math.round(item.lineTotalMinor / 100)}
              </span>
            </div>
          ))}
        </div>

        {/* Financial Details */}
        <div className="pt-2 border-t border-[var(--border)] space-y-1.5 text-[var(--text-muted)]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-[var(--text)] font-semibold">₹{Math.round(order.subtotalMinor / 100)}</span>
          </div>
          {order.deliveryFeeMinor > 0 && (
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-[var(--text)] font-semibold">₹{Math.round(order.deliveryFeeMinor / 100)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm font-extrabold text-[var(--text)] pt-1 border-t border-[var(--border)]">
            <span>Total Amount</span>
            <span className="text-base text-[var(--brand-primary)]">
              ₹{Math.round(order.totalMinor / 100)}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Note */}
      {order.customerNote && (
        <div className="p-3 bg-[var(--bg-raised)] rounded-xl border border-[var(--border)] text-xs shadow-xs">
          <p className="text-[11px] text-[var(--text-muted)]">Note to kitchen:</p>
          <p className="text-[var(--text)] mt-0.5">{order.customerNote}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        <Button
          variant="outline"
          size="md"
          onClick={() => setShowBill(true)}
          className="w-full font-bold min-h-[44px] flex items-center justify-center gap-2 border-[var(--brand-primary)]/40 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 cursor-pointer"
        >
          <Receipt className="w-4 h-4" />
          <span>🧾 View Bill & Receipt</span>
        </Button>
        <Link href="/order" className="block">
          <Button variant="outline" size="md" className="w-full font-bold min-h-[44px]">
            + Order More Items
          </Button>
        </Link>
        <Link href="/order/orders" className="block">
          <Button variant="ghost" size="sm" className="w-full text-xs text-[var(--text-muted)] min-h-[44px]">
            View All Past Orders
          </Button>
        </Link>
      </div>

      {showBill && (
        <BillModal
          order={order}
          isOpen={showBill}
          onClose={() => setShowBill(false)}
        />
      )}
    </div>
  );
}
