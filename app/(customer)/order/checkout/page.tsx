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
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser/device.");
      return;
    }
    setIsLocating(true);
    setErrorMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });
        setLocationSuccess(`Location pinned (±${Math.round(position.coords.accuracy)}m accuracy)`);
        setIsLocating(false);
        if (!addressLine) {
          setAddressLine(`GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      },
      (error) => {
        setIsLocating(false);
        setErrorMessage(
          error.code === 1
            ? "Location permission was denied. Please allow location access or type your address manually."
            : "Could not fetch GPS location. Please type your address manually."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-base font-bold text-[var(--text)]">Your cart is empty</h2>
        <Link href="/order">
          <Button variant="primary">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  const isDineIn = orderType === "dine_in" && Boolean(tableLabel);
  const deliveryFeeMinor = isDineIn ? 0 : 3000;
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

      const googleMapsUrl = coords
        ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
        : undefined;

      const effectiveOrderType: "dine_in" | "delivery" = isDineIn ? "dine_in" : "delivery";

      const payload = {
        orderType: effectiveOrderType,
        items: orderItems,
        customerNote: customerNote.trim() || undefined,
        paymentMethod: (effectiveOrderType === "dine_in" ? "pay_at_counter" : "razorpay") as
          | "pay_at_counter"
          | "razorpay",
        deliveryAddressSnapshot:
          effectiveOrderType === "delivery"
            ? {
                recipientName: recipientName.trim() || "Customer",
                phone: phone.trim() || "+919876543210",
                line1: addressLine.trim() || "Main Street",
                area: area.trim() || "Cafe Vicinity",
                pincode: pincode.trim() || "302001",
                latitude: coords?.lat,
                longitude: coords?.lng,
                googleMapsUrl,
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
          className="w-10 h-10 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)]"
          aria-label="Back to cart"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-lg font-bold font-display text-[var(--text)]">Checkout</h1>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-100 dark:bg-red-950/40 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-200">
          <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 dark:text-white">Could not place order</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Dining Mode & Location Information */}
      {isDineIn ? (
        <div className="p-4 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Order Type</p>
              <h3 className="text-sm font-bold text-[var(--text)]">
                Dine-In • {tableLabel ? tableLabel : "Table QR Session"}
              </h3>
            </div>
          </div>

          {!tableLabel && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-300">Table QR Required</p>
                <p className="mt-0.5 text-[11px] text-amber-800/90 dark:text-amber-200/90 leading-relaxed">
                  To place a dine-in order, make sure you scanned the physical QR code on your table. Your table number is secured cryptographically.
                </p>
              </div>
            </div>
          )}

          <div className="p-3 bg-[var(--bg-inset)] rounded-xl border border-[var(--border)] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text)]">Payment Method</span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Pay at counter
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Enjoy your food first. Pay with Cash or UPI at the front counter after your meal.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text)]">Delivery Details</h3>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Prepaid Only (No COD)
            </span>
          </div>

          {/* GPS Location Button */}
          <div className="p-3 bg-[var(--bg-inset)] rounded-xl border border-[var(--border)] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-[var(--text)]">Live GPS Location</p>
                <p className="text-[11px] text-[var(--text-muted)]">Pin your exact live address for faster delivery</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="text-xs font-medium shrink-0 h-9 px-3 border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
              >
                {isLocating ? "Detecting..." : "📍 Use My Location"}
              </Button>
            </div>
            {locationSuccess && (
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{locationSuccess}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Recipient Full Name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--brand-primary)] min-h-[44px]"
            />
            <input
              type="tel"
              placeholder="Delivery Contact Mobile Number (+91)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--brand-primary)] min-h-[44px]"
            />
            <input
              type="text"
              placeholder="House/Flat No., Building, Street Name"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--brand-primary)] min-h-[44px]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Area / Locality"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--brand-primary)] min-h-[44px]"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--brand-primary)] min-h-[44px]"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-200">
            <strong>Payment Notice:</strong> Cash on Delivery (COD) is not accepted. All deliveries are 100% prepaid via Razorpay.
          </div>
        </div>
      )}

      {/* Customer Note Input */}
      <div className="p-4 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] space-y-2 shadow-xs">
        <label
          htmlFor="customer-note"
          className="block text-xs font-bold text-[var(--text)]"
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
          className="w-full px-3 py-2 text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--brand-primary)] min-h-[44px]"
        />
      </div>

      {/* Order Summary Snapshot */}
      <div className="p-4 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] space-y-2.5 text-xs shadow-xs">
        <h4 className="font-bold text-[var(--text)] text-sm pb-1 border-b border-[var(--border)]">
          Order Summary ({totalCount} items)
        </h4>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {items.map((i) => (
            <div key={i.cartItemId} className="flex justify-between items-center text-[var(--text-muted)]">
              <span className="truncate pr-2">
                {i.quantity}x {i.menuItem.name}
              </span>
              <span className="shrink-0 font-semibold text-[var(--text)]">
                ₹{Math.round(i.itemTotalMinor / 100)}
              </span>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center font-extrabold text-sm text-[var(--text)]">
          <span>Total to Pay</span>
          <span className="text-base text-[var(--brand-primary)]">
            ₹{Math.round(grandTotalMinor / 100)}
          </span>
        </div>
      </div>

      {/* Strict No-Cancellation Policy Banner */}
      <div className="p-3 bg-stone-100 dark:bg-stone-900/60 border border-[var(--border)] rounded-xl text-center space-y-1">
        <p className="text-[11px] font-bold text-[var(--text)]">
          🛡️ Strict No-Cancellation Policy
        </p>
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
          All food items are prepared fresh immediately upon approval. Once an order is confirmed, it cannot be cancelled or refunded.
        </p>
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
