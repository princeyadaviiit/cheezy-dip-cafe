"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChefHat,
  Volume2,
  VolumeX,
  RefreshCw,
  Clock,
  Utensils,
  CheckCircle2,
  Flame,
  ShieldCheck,
} from "lucide-react";
import {
  getKitchenOrders,
  transitionOrderStatus,
  markOrderPaidAtCounter,
} from "@/services/kitchen-service";
import { setDevStaffRole } from "@/services/admin-service";
import { type OrderRecord } from "@/lib/orders/order-store";
import { type OrderStatus } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

// Web Audio API chime generator (no external asset required)
function playKitchenChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Cheerful ascending two-tone cafe bell (880Hz -> 1320Hz)
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);

    // Vibration on mobile
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  } catch {
    // Audio context not allowed before user interaction
  }
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"incoming" | "cooking" | "ready" | "all">("incoming");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());

  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const data = await getKitchenOrders();
        if (active) {
          // Detect brand new incoming orders to chime
          const currentIds = new Set(data.map((o) => o.id));
          if (previousOrderIdsRef.current.size > 0 && soundEnabled) {
            const hasNew = data.some(
              (o) => o.orderStatus === "placed" && !previousOrderIdsRef.current.has(o.id)
            );
            if (hasNew) {
              playKitchenChime();
            }
          }
          previousOrderIdsRef.current = currentIds;
          setOrders(data);
          setCurrentTime(Date.now());
          setAuthError(null);
        }
      } catch (err: unknown) {
        if (active) {
          const msg = err instanceof Error ? err.message : "Access restricted";
          if (msg.includes("FORBIDDEN") || msg.includes("UNAUTHORIZED")) {
            setAuthError(msg);
          }
        }
      }
    };

    poll();
    const interval = setInterval(poll, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [soundEnabled]);

  const handleStatusTransition = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const updated = await transitionOrderStatus(orderId, nextStatus);
      setOrders((prev) =>
        prev
          .map((o) => (o.id === orderId ? updated : o))
          .filter((o) => ["placed", "accepted", "preparing", "ready"].includes(o.orderStatus))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    try {
      const updated = await markOrderPaidAtCounter(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to mark paid");
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getKitchenOrders();
      setOrders(data);
      setCurrentTime(Date.now());
    } finally {
      setRefreshing(false);
    }
  };

  // Filter orders by tab
  const incomingOrders = orders.filter((o) => o.orderStatus === "placed");
  const cookingOrders = orders.filter((o) => o.orderStatus === "accepted" || o.orderStatus === "preparing");
  const readyOrders = orders.filter((o) => o.orderStatus === "ready");

  const displayedOrders =
    activeTab === "incoming"
      ? incomingOrders
      : activeTab === "cooking"
      ? cookingOrders
      : activeTab === "ready"
      ? readyOrders
      : orders;

  const getElapsedMinutes = (dateStr: string) => {
    const elapsed = Math.floor((currentTime - new Date(dateStr).getTime()) / 60000);
    return Math.max(0, elapsed);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-3 max-w-lg mx-auto w-full pb-16 space-y-3 font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] text-[var(--text-on-brand)] flex items-center justify-center font-bold">
            <ChefHat className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-[var(--text)]">Kitchen Display</h1>
            <p className="text-[11px] text-[var(--text-muted)]">Cheezy Dip Order Station</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle size="sm" />

          <button
            type="button"
            onClick={() => {
              if (!soundEnabled) playKitchenChime();
              setSoundEnabled(!soundEnabled);
            }}
            className={`p-2 rounded-xl border min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer ${
              soundEnabled
                ? "bg-[var(--bg-raised)] text-[var(--brand-primary)] border-[var(--brand-primary)]/40"
                : "bg-[var(--bg-inset)] text-[var(--text-muted)] border-[var(--border)]"
            }`}
            aria-label="Toggle sound alerts"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Refresh orders"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[var(--brand-primary)]" : ""}`} />
          </button>

          <Link
            href="/staff"
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors min-h-[44px] flex items-center"
          >
            Staff Portal
          </Link>
        </div>
      </header>

      {/* Access Error Banner / Dev Role Switcher */}
      {authError && (
        <div className="p-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-500/50 rounded-2xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-700 dark:text-orange-300 flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-orange-900 dark:text-orange-100">
                Kitchen Staff Authentication Required
              </h3>
              <p className="text-xs text-orange-800/90 dark:text-orange-300/90 mt-0.5 leading-relaxed">
                Your account does not have Kitchen privileges. You can activate Kitchen mode for testing below, or open the Staff Portal.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={async () => {
                await setDevStaffRole("kitchen");
                setAuthError(null);
                window.location.reload();
              }}
              className="px-3.5 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs min-h-[44px]"
            >
              🍳 Activate Kitchen Mode
            </button>
            <Link
              href="/staff"
              className="px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--border)] transition-colors inline-flex items-center justify-center min-h-[44px]"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-raised)] rounded-xl border border-[var(--border)] text-xs font-bold shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("incoming")}
          className={`py-2 px-1 rounded-lg text-center transition-colors min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            activeTab === "incoming"
              ? "bg-[var(--brand-primary)] text-[var(--text-on-brand)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          <span>Incoming</span>
          <span className="text-[10px] font-black opacity-90">({incomingOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cooking")}
          className={`py-2 px-1 rounded-lg text-center transition-colors min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            activeTab === "cooking"
              ? "bg-[var(--brand-primary)] text-[var(--text-on-brand)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          <span>Cooking</span>
          <span className="text-[10px] font-black opacity-90">({cookingOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ready")}
          className={`py-2 px-1 rounded-lg text-center transition-colors min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            activeTab === "ready"
              ? "bg-[var(--brand-primary)] text-[var(--text-on-brand)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          <span>Ready</span>
          <span className="text-[10px] font-black opacity-90">({readyOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`py-2 px-1 rounded-lg text-center transition-colors min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            activeTab === "all"
              ? "bg-[var(--brand-primary)] text-[var(--text-on-brand)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          <span>All Active</span>
          <span className="text-[10px] font-black opacity-90">({orders.length})</span>
        </button>
      </div>

      {/* Orders Queue */}
      <div className="space-y-3 pt-1">
        {displayedOrders.map((ord) => {
          const elapsed = getElapsedMinutes(ord.placedAt);
          const isLate = elapsed >= 15;

          return (
            <div
              key={ord.id}
              className={`p-4 rounded-2xl border transition-all shadow-xs ${
                ord.orderStatus === "placed"
                  ? "bg-[var(--bg-raised)] border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/30"
                  : ord.orderStatus === "ready"
                  ? "bg-[var(--bg-raised)] border-emerald-500/60"
                  : "bg-[var(--bg-raised)] border-[var(--border)]"
              }`}
            >
              {/* Order Card Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black px-2.5 py-0.5 rounded-lg bg-[var(--brand-primary)] text-[var(--text-on-brand)]">
                    {ord.tableLabel ? ord.tableLabel.toUpperCase() : "DELIVERY"}
                  </span>
                  <span className="text-sm font-bold text-[var(--text)]">
                    {ord.orderNumber}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isLate
                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border border-red-500/40"
                        : "bg-[var(--bg-inset)] text-[var(--text-muted)]"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {elapsed}m ago
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-3 space-y-2.5">
                {ord.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="font-black text-[var(--brand-primary)] text-base leading-none">
                        {item.quantity}×
                      </span>
                      <span className="font-bold text-[var(--text)] flex-1 leading-snug">
                        {item.nameSnapshot}
                      </span>
                    </div>

                    {/* Modifiers & Dips highlighted */}
                    {item.modifiersSnapshot && item.modifiersSnapshot.length > 0 && (
                      <div className="pl-6 flex flex-wrap gap-1">
                        {item.modifiersSnapshot.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="text-[11px] font-semibold text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 px-1.5 py-0.2 rounded border border-[var(--brand-primary)]/20"
                          >
                            + {m.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Item kitchen note */}
                    {item.note && (
                      <p className="pl-6 text-xs text-[var(--brand-primary)] italic font-medium">
                        ⚠️ &quot;{item.note}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Order Level Special Note */}
              {ord.customerNote && (
                <div className="p-2.5 rounded-xl bg-[var(--bg-inset)] border border-[var(--brand-primary)]/30 text-xs text-[var(--text)] mb-3">
                  <span className="font-bold text-[var(--brand-primary)] block text-[11px]">KITCHEN INSTRUCTION:</span>
                  {ord.customerNote}
                </div>
              )}

              {/* Payment & Action Controls */}
              <div className="pt-2 border-t border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Total: ₹{Math.round(ord.totalMinor / 100)}</span>
                  {ord.paymentStatus === "paid" ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkPaid(ord.id)}
                      className="px-2.5 py-1 rounded bg-[var(--bg-inset)] hover:bg-[var(--border)] text-[var(--brand-primary)] font-semibold text-[11px] border border-[var(--border)] cursor-pointer"
                    >
                      Collect ₹{Math.round(ord.totalMinor / 100)} (Mark Paid)
                    </button>
                  )}
                </div>

                {/* State Transition Actions */}
                <div className="flex gap-2 pt-1">
                  {ord.orderStatus === "placed" && (
                    <>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleStatusTransition(ord.id, "accepted")}
                        className="flex-1 font-bold h-12 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-black cursor-pointer"
                      >
                        Accept Order
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => handleStatusTransition(ord.id, "rejected")}
                        className="px-4 text-xs font-bold text-red-500 border-red-500/30 hover:bg-red-500/10 h-12 cursor-pointer"
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {ord.orderStatus === "accepted" && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleStatusTransition(ord.id, "preparing")}
                      className="w-full font-bold h-12 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)] text-[var(--text-on-brand)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Flame className="w-4 h-4" /> Start Cooking
                    </Button>
                  )}

                  {ord.orderStatus === "preparing" && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleStatusTransition(ord.id, "ready")}
                      className="w-full font-bold h-12 bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 text-white flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Order Ready
                    </Button>
                  )}

                  {ord.orderStatus === "ready" && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleStatusTransition(ord.id, "served")}
                      className="w-full font-bold h-12 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-black flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Utensils className="w-4 h-4" /> Complete & Served to Table
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {displayedOrders.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)]">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-inset)] text-[var(--text-muted)] mx-auto flex items-center justify-center">
              <ChefHat className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text)]">No active orders in this tab</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
              Incoming orders will chime and appear here in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
