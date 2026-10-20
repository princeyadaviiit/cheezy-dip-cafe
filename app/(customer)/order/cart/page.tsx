"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Minus, Utensils, ShoppingBag, Tag, CheckCircle2, AlertTriangle, WifiOff } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { validateCoupon } from "@/lib/coupons/coupon-service";
import {
  FREE_DELIVERY_THRESHOLD_MINOR,
  STANDARD_DELIVERY_FEE_MINOR,
} from "@/lib/orders/pricing";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotalMinor,
    totalCount,
    tableLabel,
    orderType,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountMinor: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Monitor network online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleApplyCoupon = () => {
    setCouponError(null);
    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    const result = validateCoupon(couponInput, subtotalMinor, "current_customer");
    if (!result.isValid) {
      setCouponError(result.error || "Invalid coupon code");
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon({
        code: result.coupon!.code,
        discountMinor: result.discountMinor,
      });
      setCouponInput("");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--bg-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">Your cart is empty</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
            Looks like you haven&apos;t added any delicious cheesy treats yet.
          </p>
        </div>
        <Link href="/order" className="inline-block pt-2">
          <Button variant="primary" size="md">
            Browse Menu
          </Button>
        </Link>
      </div>
    );
  }

  const isFreeDelivery = orderType === "delivery" && subtotalMinor >= FREE_DELIVERY_THRESHOLD_MINOR;
  const deliveryFeeMinor = orderType === "dine_in" || isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE_MINOR;
  const discountMinor = appliedCoupon ? appliedCoupon.discountMinor : 0;
  const grandTotalMinor = Math.max(0, subtotalMinor - discountMinor) + deliveryFeeMinor;

  return (
    <div className="space-y-4 pb-12">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="p-3 bg-red-100 dark:bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-800 dark:text-red-200 flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-red-500 shrink-0" />
          <span>You are offline. Your cart is saved locally on your device.</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/order"
            className="w-10 h-10 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)]"
            aria-label="Back to order menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-bold font-display text-[var(--text)]">Your Cart</h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 min-h-[44px] px-2 flex items-center cursor-pointer"
        >
          Clear all
        </button>
      </div>

      {/* Dine-In / Delivery Context Banner */}
      <div className="p-3 bg-[var(--bg-raised)] rounded-xl border border-[var(--border)] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-6 h-6 rounded-md bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] flex items-center justify-center">
            <Utensils className="w-3.5 h-3.5" />
          </span>
          <div>
            <p className="font-semibold text-[var(--text)]">
              {orderType === "dine_in" && tableLabel
                ? `Dine-in at ${tableLabel}`
                : "Doorstep Home Delivery"}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              {orderType === "dine_in" && tableLabel
                ? "Pay at counter when finished"
                : "Prepaid online via Razorpay"}
            </p>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item) => {
          return (
            <div
              key={item.cartItemId}
              className="p-3.5 bg-[var(--bg-raised)] border border-[var(--border)] rounded-2xl space-y-2.5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {item.menuItem.diet === "veg" && (
                      <span className="w-3 h-3 rounded border border-emerald-500 flex items-center justify-center p-0.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-[var(--text)] truncate">
                      {item.menuItem.name}
                    </h3>
                  </div>

                  {/* Options */}
                  {item.selectedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.selectedOptions.map((opt) => (
                        <span
                          key={opt}
                          className="text-[10px] bg-[var(--bg-inset)] text-[var(--text-muted)] px-1.5 py-0.5 rounded border border-[var(--border)]"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Kitchen note */}
                  {item.note && (
                    <p className="text-[11px] text-[var(--brand-primary)] italic mt-1">
                      Note: &quot;{item.note}&quot;
                    </p>
                  )}
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeItem(item.cartItemId)}
                  className="text-[var(--text-muted)] hover:text-red-500 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 cursor-pointer"
                  aria-label={`Remove ${item.menuItem.name} from cart`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Price and Quantity Stepper */}
              <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]">
                <span className="text-sm font-extrabold text-[var(--brand-primary)]">
                  ₹{Math.round(item.itemTotalMinor / 100)}
                </span>

                <div className="flex items-center border border-[var(--border)] rounded-xl bg-[var(--bg-inset)] overflow-hidden h-9">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, -1)}
                    className="w-8 h-9 flex items-center justify-center text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-[var(--text)]">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, 1)}
                    className="w-8 h-9 flex items-center justify-center text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add More Items Button */}
      <Link
        href="/order"
        className="w-full py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] hover:border-[var(--brand-primary)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
      >
        <Plus className="w-3.5 h-3.5" /> Add more items
      </Link>

      {/* Coupon Code Section */}
      <div className="p-3.5 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] space-y-2 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--text)] flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[var(--brand-primary)]" /> Offers & Coupons
          </span>
          <span className="text-[11px] text-[var(--brand-primary)] font-medium">Try CHEESE20 or DIPFIRST</span>
        </div>

        {appliedCoupon ? (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">{appliedCoupon.code} Applied</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-200">You saved ₹{Math.round(appliedCoupon.discountMinor / 100)} on this order!</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-xs font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 min-h-[44px] px-2 flex items-center cursor-pointer"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-[var(--text)] uppercase placeholder:normal-case placeholder-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--brand-primary)] min-h-[44px]"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleApplyCoupon}
                className="font-bold text-xs min-h-[44px] px-4"
              >
                Apply
              </Button>
            </div>
            {couponError && (
              <p className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1 pl-1">
                <AlertTriangle className="w-3 h-3" /> {couponError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Free Delivery Banner for Delivery Orders */}
      {orderType === "delivery" && !isFreeDelivery && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <span className="text-[var(--text)] font-semibold flex items-center gap-1.5">
            🛵 Add ₹{Math.round((FREE_DELIVERY_THRESHOLD_MINOR - subtotalMinor) / 100)} more for FREE Delivery!
          </span>
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded uppercase">
            Above ₹300
          </span>
        </div>
      )}
      {orderType === "delivery" && isFreeDelivery && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
          <span className="flex items-center gap-1.5">
            🎉 Free Delivery Unlocked!
          </span>
          <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono uppercase">
            Orders Above ₹300
          </span>
        </div>
      )}

      {/* Bill Breakdown */}
      <div className="p-4 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] space-y-2 text-xs shadow-xs">
        <h4 className="font-bold text-[var(--text)] text-sm pb-1 border-b border-[var(--border)]">
          Bill Details
        </h4>
        <div className="flex justify-between text-[var(--text-muted)]">
          <span>Item Total ({totalCount} items)</span>
          <span className="text-[var(--text)] font-semibold">₹{Math.round(subtotalMinor / 100)}</span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Coupon Discount ({appliedCoupon.code})</span>
            <span>- ₹{Math.round(appliedCoupon.discountMinor / 100)}</span>
          </div>
        )}
        <div className="flex justify-between text-[var(--text-muted)]">
          <span>Delivery Partner Fee</span>
          <span className={`font-semibold ${orderType === "dine_in" || isFreeDelivery ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text)]"}`}>
            {orderType === "dine_in"
              ? "FREE (Dine-in)"
              : isFreeDelivery
              ? "FREE (Order above ₹300)"
              : "₹30"}
          </span>
        </div>
        <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center text-sm font-extrabold text-[var(--text)]">
          <span>To Pay</span>
          <span className="text-base text-[var(--brand-primary)]">
            ₹{Math.round(grandTotalMinor / 100)}
          </span>
        </div>
      </div>

      {/* Checkout Action Button */}
      <Link href="/order/checkout" className="block pt-2">
        <Button
          variant="primary"
          size="lg"
          className="w-full h-13 font-bold text-base flex items-center justify-between px-5 shadow-lg"
        >
          <span>Proceed to Checkout</span>
          <span>₹{Math.round(grandTotalMinor / 100)} →</span>
        </Button>
      </Link>
    </div>
  );
}
