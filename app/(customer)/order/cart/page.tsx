"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Trash2, Plus, Minus, Utensils, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
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

  if (items.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-neutral-900 border border-[var(--border)] flex items-center justify-center text-neutral-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Your cart is empty</h2>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-xs mx-auto">
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

  const deliveryFeeMinor = orderType === "dine_in" ? 0 : 3000;
  const grandTotalMinor = subtotalMinor + deliveryFeeMinor;

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/order"
            className="w-10 h-10 rounded-xl bg-neutral-900 border border-[var(--border)] flex items-center justify-center text-neutral-300 hover:text-white"
            aria-label="Back to order menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-bold font-display text-white">Your Cart</h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-red-400 hover:text-red-300 min-h-[44px] px-2 flex items-center"
        >
          Clear all
        </button>
      </div>

      {/* Dine-In / Delivery Context Banner */}
      <div className="p-3 bg-neutral-900/80 rounded-xl border border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-6 h-6 rounded-md bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center">
            <Utensils className="w-3.5 h-3.5" />
          </span>
          <div>
            <p className="font-semibold text-white">
              {orderType === "dine_in"
                ? tableLabel
                  ? `Dine-in at ${tableLabel}`
                  : "Dine-in (Scan table QR to seat)"
                : "Home Delivery"}
            </p>
            <p className="text-[11px] text-[var(--muted)]">
              {orderType === "dine_in"
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
              className="p-3.5 bg-neutral-900/60 border border-[var(--border)] rounded-2xl space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {item.menuItem.diet === "veg" && (
                      <span className="w-3 h-3 rounded border border-emerald-500 flex items-center justify-center p-0.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-white truncate">
                      {item.menuItem.name}
                    </h3>
                  </div>

                  {/* Options */}
                  {item.selectedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.selectedOptions.map((opt) => (
                        <span
                          key={opt}
                          className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded border border-[var(--border)]"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Kitchen note */}
                  {item.note && (
                    <p className="text-[11px] text-amber-300/80 italic mt-1">
                      Note: &quot;{item.note}&quot;
                    </p>
                  )}
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeItem(item.cartItemId)}
                  className="text-neutral-500 hover:text-red-400 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                  aria-label={`Remove ${item.menuItem.name} from cart`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Price and Quantity Stepper */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                <span className="text-sm font-extrabold text-[var(--accent)]">
                  ₹{Math.round(item.itemTotalMinor / 100)}
                </span>

                <div className="flex items-center border border-[var(--border)] rounded-xl bg-neutral-900 overflow-hidden h-9">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, -1)}
                    className="w-8 h-9 flex items-center justify-center text-sm font-bold text-neutral-300 hover:text-white"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-white">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, 1)}
                    className="w-8 h-9 flex items-center justify-center text-sm font-bold text-neutral-300 hover:text-white"
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
        className="w-full py-2.5 rounded-xl border border-dashed border-neutral-700 hover:border-[var(--accent)] text-xs font-bold text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
      >
        <Plus className="w-3.5 h-3.5" /> Add more items
      </Link>

      {/* Bill Breakdown */}
      <div className="p-4 bg-neutral-900/80 rounded-2xl border border-[var(--border)] space-y-2 text-xs">
        <h4 className="font-bold text-white text-sm pb-1 border-b border-neutral-800">
          Bill Details
        </h4>
        <div className="flex justify-between text-neutral-300">
          <span>Item Total ({totalCount} items)</span>
          <span>₹{Math.round(subtotalMinor / 100)}</span>
        </div>
        <div className="flex justify-between text-neutral-300">
          <span>Delivery Partner Fee</span>
          <span>{orderType === "dine_in" ? "FREE (Dine-in)" : "₹30"}</span>
        </div>
        <div className="flex justify-between text-neutral-400 text-[11px]">
          <span>Taxes (GST)</span>
          <span>Included in prices</span>
        </div>
        <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-sm font-extrabold text-white">
          <span>To Pay</span>
          <span className="text-base text-[var(--accent)]">
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
