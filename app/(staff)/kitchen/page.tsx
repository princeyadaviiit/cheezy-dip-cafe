"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ChefHat,
  Volume2,
  VolumeX,
  Sun,
  RefreshCw,
  Clock,
  Utensils,
  CheckCircle2,
  Flame,
  BellRing,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  getKitchenOrders,
  transitionOrderStatus,
  markOrderPaidAtCounter,
} from "@/services/kitchen-service";
import { type OrderRecord } from "@/lib/orders/order-store";
import { type OrderStatus } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

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
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());

  // Screen Wake Lock API
  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        const lock = await (navigator as unknown as {
          wakeLock: { request: (type: string) => Promise<unknown> };
        }).wakeLock.request("screen");
        if (lock) {
          setWakeLockActive(true);
        }
      }
    } catch {
      // Wake lock request failed or denied
    }
  };

  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      try {
        const data = await getKitchenOrders();
        if (active) {
          setOrders(data);
          setCurrentTime(Date.now());
          const hasNewIncoming = data.some(
            (o) => o.orderStatus === "placed" && !previousOrderIdsRef.current.has(o.id)
          );
          if (hasNewIncoming && previousOrderIdsRef.current.size > 0 && soundEnabled) {
            playKitchenChime();
          }
          previousOrderIdsRef.current = new Set(data.map((o) => o.id));
        }
      } catch {
        // Ignored
      }
    };

    const init = async () => {
      await fetchOrders();
      await requestWakeLock();
    };

    init();

    const interval = setInterval(fetchOrders, 4000);

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
    <div className="min-h-screen bg-black text-white p-3 max-w-lg mx-auto w-full pb-16 space-y-3 font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-[var(--accent)] text-black flex items-center justify-center font-bold">
            <ChefHat className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">Kitchen Display</h1>
            <p className="text-[11px] text-neutral-400">Cheezy Dip Order Station</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              if (!soundEnabled) playKitchenChime();
              setSoundEnabled(!soundEnabled);
            }}
            className={`p-2 rounded-xl border min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${
              soundEnabled
                ? "bg-neutral-800 text-amber-400 border-amber-500/40"
                : "bg-neutral-900 text-neutral-500 border-neutral-800"
            }`}
            aria-label="Toggle sound alerts"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Refresh orders"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("incoming")}
          className={`py-2 px-1 rounded-lg text-center transition-colors min-h-[44px] flex flex-col items-center justify-center ${
            activeTab === "incoming"
              ? "bg-amber-500 text-black shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <span>Incoming</span>
          <span className="text-[10px] font-black opacity-90">({incomingOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cooking")}
          className={`py-2 px-1 rounded-lg text-center transition-colors min-h-[44px] flex flex-col items-center justify-center ${
            activeTab === "cooking"
              ? "bg-amber-500 text-black shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <span>Cooking</span>
          <span className="text-[10px] font-black opacity-90">({cookingOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ready")}
          className={`py-2 px-1 rounded-lg text-center transition-colors min-h-[44px] flex flex-col items-center justify-center ${
            activeTab === "ready"
              ? "bg-amber-500 text-black shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <span>Ready</span>
          <span className="text-[10px] font-black opacity-90">({readyOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`py-2 px-1 rounded-lg text-center transition-colors min-h-[44px] flex flex-col items-center justify-center ${
            activeTab === "all"
              ? "bg-amber-500 text-black shadow-sm"
              : "text-neutral-400 hover:text-white"
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
              className={`p-4 rounded-2xl border transition-all ${
                ord.orderStatus === "placed"
                  ? "bg-neutral-900 border-amber-500/80 ring-1 ring-amber-500/30"
                  : ord.orderStatus === "ready"
                  ? "bg-neutral-900 border-emerald-500/60"
                  : "bg-neutral-900/80 border-neutral-800"
              }`}
            >
              {/* Order Card Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black px-2.5 py-0.5 rounded-lg bg-[var(--accent)] text-black">
                    {ord.tableLabel ? ord.tableLabel.toUpperCase() : "DELIVERY"}
                  </span>
                  <span className="text-sm font-bold text-neutral-300">
                    {ord.orderNumber}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isLate
                        ? "bg-red-950 text-red-400 border border-red-500/40"
                        : "bg-neutral-800 text-neutral-300"
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
                      <span className="font-black text-amber-400 text-base leading-none">
                        {item.quantity}×
                      </span>
                      <span className="font-bold text-white flex-1 leading-snug">
                        {item.nameSnapshot}
                      </span>
                    </div>

                    {/* Modifiers & Dips highlighted */}
                    {item.modifiersSnapshot && item.modifiersSnapshot.length > 0 && (
                      <div className="pl-6 flex flex-wrap gap-1">
                        {item.modifiersSnapshot.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="text-[11px] font-semibold text-amber-300 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20"
                          >
                            + {m.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Item kitchen note */}
                    {item.note && (
                      <p className="pl-6 text-xs text-yellow-300 italic font-medium">
                        ⚠️ &quot;{item.note}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Order Level Special Note */}
              {ord.customerNote && (
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 mb-3">
                  <span className="font-bold text-amber-400 block text-[11px]">KITCHEN INSTRUCTION:</span>
                  {ord.customerNote}
                </div>
              )}

              {/* Payment & Action Controls */}
              <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Total: ₹{Math.round(ord.totalMinor / 100)}</span>
                  {ord.paymentStatus === "paid" ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkPaid(ord.id)}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold text-[11px] border border-neutral-700"
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
                        className="flex-1 font-bold h-12 bg-emerald-500 hover:bg-emerald-400 text-black"
                      >
                        Accept Order
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => handleStatusTransition(ord.id, "rejected")}
                        className="px-4 text-xs font-bold text-red-400 border-red-500/30 hover:bg-red-950/40 h-12"
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
                      className="w-full font-bold h-12 bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-2"
                    >
                      <Flame className="w-4 h-4" /> Start Cooking
                    </Button>
                  )}

                  {ord.orderStatus === "preparing" && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleStatusTransition(ord.id, "ready")}
                      className="w-full font-bold h-12 bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Order Ready
                    </Button>
                  )}

                  {ord.orderStatus === "ready" && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleStatusTransition(ord.id, "served")}
                      className="w-full font-bold h-12 bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center gap-2"
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
          <div className="py-16 text-center space-y-3 bg-neutral-900/50 rounded-2xl border border-neutral-800">
            <div className="w-12 h-12 rounded-full bg-neutral-800 text-neutral-500 mx-auto flex items-center justify-center">
              <ChefHat className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No active orders in this tab</h3>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              Incoming orders will chime and appear here in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
