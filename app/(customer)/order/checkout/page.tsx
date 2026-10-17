"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Utensils, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { placeOrder } from "@/services/order-service";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    clearCart,
    subtotalMinor,
    orderType,
    tableLabel,
    totalCount,
  } = useCart();

  const [customerNote, setCustomerNote] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("302001");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-base font-bold text-white">Your cart is empty</h2>
        <Link href="/order">
          <Button variant="primary">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  const deliveryFeeMinor = orderType === "dine_in" ? 0 : 3000;
  const grandTotalMinor = subtotalMinor + deliveryFeeMinor;

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Generate client idempotency key
      const idempotencyKey = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const orderItems = items.map((i) => ({
        menuItemId: i.menuItem.id,
        quantity: i.quantity,
        optionChoiceLabels: i.selectedOptions.length > 0 ? i.selectedOptions : undefined,
        note: i.note,
      }));

      const payload = {
        orderType,
        items: orderItems,
        customerNote: customerNote.trim() || undefined,
        paymentMethod: (orderType === "dine_in" ? "pay_at_counter" : "razorpay") as
          | "pay_at_counter"
          | "razorpay",
        deliveryAddressSnapshot:
          orderType === "delivery"
            ? {
                recipientName: recipientName.trim() || "Customer",
                phone: phone.trim() || "+919876543210",
                line1: addressLine.trim() || "Main Street",
                area: area.trim() || "Cafe Vicinity",
                pincode: pincode.trim() || "302001",
              }
            : undefined,
        idempotencyKey,
      };

      const result = await placeOrder(payload);

      // Clear local cart
      clearCart();

      // Navigate to order confirmation / tracking page
      router.push(`/order/orders/${result.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order. Please try again.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center gap-2">
        <Link
          href="/order/cart"
          className="w-10 h-10 rounded-xl bg-neutral-900 border border-[var(--border)] flex items-center justify-center text-neutral-300 hover:text-white"
          aria-label="Back to cart"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-lg font-bold font-display text-white">Checkout</h1>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Could not place order</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Dining Mode & Location Information */}
      {orderType === "dine_in" ? (
        <div className="p-4 bg-neutral-900/80 rounded-2xl border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs text-[var(--muted)]">Order Type</p>
              <h3 className="text-sm font-bold text-white">
                Dine-In • {tableLabel ? tableLabel : "Table QR Session"}
              </h3>
            </div>
          </div>

          {!tableLabel && (
            <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Table QR Required</p>
                <p className="mt-0.5 text-[11px] text-amber-200/90 leading-relaxed">
                  To place a dine-in order, make sure you scanned the physical QR code on your table. Your table number is secured cryptographically.
                </p>
              </div>
            </div>
          )}

          <div className="p-3 bg-neutral-800/60 rounded-xl border border-[var(--border)] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Payment Method</span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Pay at counter
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              Enjoy your food first. Pay with Cash or UPI at the front counter after your meal.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-neutral-900/80 rounded-2xl border border-[var(--border)] space-y-3">
          <h3 className="text-sm font-bold text-white">Delivery Address</h3>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Full Name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-800 border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] min-h-[44px]"
            />
            <input
              type="tel"
              placeholder="Phone Number (+91)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-800 border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] min-h-[44px]"
            />
            <input
              type="text"
              placeholder="House/Flat No., Street Name"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-800 border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] min-h-[44px]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Area / Locality"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-800 border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] min-h-[44px]"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-800 border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] min-h-[44px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Customer Note Input */}
      <div className="p-4 bg-neutral-900/80 rounded-2xl border border-[var(--border)] space-y-2">
        <label
          htmlFor="customer-note"
          className="block text-xs font-bold text-neutral-300"
        >
          Special Instructions for Kitchen (optional)
        </label>
        <input
          id="customer-note"
          type="text"
          value={customerNote}
          onChange={(e) => setCustomerNote(e.target.value)}
          placeholder="e.g. Please serve all items together, extra spicy dip"
          maxLength={200}
          className="w-full px-3 py-2 text-xs bg-neutral-800 border border-[var(--border)] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--accent)] min-h-[44px]"
        />
      </div>

      {/* Order Summary Snapshot */}
      <div className="p-4 bg-neutral-900/80 rounded-2xl border border-[var(--border)] space-y-2.5 text-xs">
        <h4 className="font-bold text-white text-sm pb-1 border-b border-neutral-800">
          Order Summary ({totalCount} items)
        </h4>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {items.map((i) => (
            <div key={i.cartItemId} className="flex justify-between items-center text-neutral-300">
              <span className="truncate pr-2">
                {i.quantity}x {i.menuItem.name}
              </span>
              <span className="shrink-0 font-semibold text-white">
                ₹{Math.round(i.itemTotalMinor / 100)}
              </span>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-neutral-800 flex justify-between items-center font-extrabold text-sm text-white">
          <span>Total to Pay</span>
          <span className="text-base text-[var(--accent)]">
            ₹{Math.round(grandTotalMinor / 100)}
          </span>
        </div>
      </div>

      {/* Trust & Guarantee badge */}
      <div className="flex items-center gap-2 text-[11px] text-neutral-400 justify-center py-1">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Freshly prepared on order • 100% Pure Vegetarian</span>
      </div>

      {/* Place Order Action */}
      <Button
        variant="primary"
        size="lg"
        onClick={handlePlaceOrder}
        disabled={isSubmitting}
        className="w-full h-13 font-bold text-base flex items-center justify-center gap-2 shadow-xl"
      >
        {isSubmitting ? (
          <span>Sending order to kitchen...</span>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Place {orderType === "dine_in" ? "Dine-In" : "Delivery"} Order • ₹{Math.round(grandTotalMinor / 100)}</span>
          </>
        )}
      </Button>
    </div>
  );
}
