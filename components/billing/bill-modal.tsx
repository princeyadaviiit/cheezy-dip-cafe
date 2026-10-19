"use client";

import React, { useRef } from "react";
import { Receipt, Printer, X, CheckCircle2, Clock } from "lucide-react";
import { type OrderRecord } from "@/lib/orders/order-store";
import { Button } from "@/components/ui/button";

interface BillModalProps {
  order: OrderRecord;
  isOpen: boolean;
  onClose: () => void;
}

export function BillModal({ order, isOpen, onClose }: BillModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const deliverySnap = order.deliveryAddressSnapshot as
    | {
        recipientName?: string;
        phone?: string;
        line1?: string;
        area?: string;
        pincode?: string;
      }
    | undefined;

  const subtotalRs = Math.round(order.subtotalMinor / 100);
  const deliveryFeeRs = Math.round((order.deliveryFeeMinor || 0) / 100);
  const discountRs = Math.round((order.discountMinor || 0) / 100);
  const totalRs = Math.round(order.totalMinor / 100);

  const formattedDate = new Date(order.placedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Container */}
      <div className="w-full max-w-sm sm:max-w-md bg-[var(--bg-raised)] border border-[var(--border)] rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modal Top Controls */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)] shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-sm font-extrabold text-[var(--text)] font-display">
              Order Bill & Receipt
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[var(--bg-inset)] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer text-base font-bold"
            aria-label="Close invoice"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div
          ref={receiptRef}
          id="printable-cafe-bill"
          className="flex-1 overflow-y-auto space-y-3.5 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 font-sans text-xs print:p-0 print:border-none print:shadow-none"
        >
          {/* Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-stone-300 dark:border-stone-700">
            <h1 className="text-base font-black tracking-tight uppercase font-display">
              Cheezy Dip Cafe
            </h1>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              Shop 4, Lane 2, Near Raja Park Market, Jaipur, RJ 302004
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              Phone: +91 86963 21018
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
              100% Pure Vegetarian Cafe
            </p>
            <div className="mt-1 inline-block px-2.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-black text-[10px] uppercase tracking-wider">
              Order Bill & Receipt
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-stone-300 dark:border-stone-700">
            <div className="flex justify-between">
              <span className="font-semibold text-stone-600 dark:text-stone-400">Invoice No:</span>
              <span className="font-mono font-bold">INV-{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-stone-600 dark:text-stone-400">Date & Time:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-stone-600 dark:text-stone-400">Order Channel:</span>
              <span className="font-bold">
                {order.orderType === "dine_in"
                  ? `Dine-In (${order.tableLabel || "Table"})`
                  : "Home Delivery"}
              </span>
            </div>
            {order.contactPhone && (
              <div className="flex justify-between">
                <span className="font-semibold text-stone-600 dark:text-stone-400">Customer Phone:</span>
                <span className="font-mono">{order.contactPhone}</span>
              </div>
            )}
            {order.orderType === "delivery" && deliverySnap && (
              <div className="pt-1 text-[10px] text-stone-600 dark:text-stone-400">
                <p className="font-semibold">Delivery Address:</p>
                <p>
                  {deliverySnap.recipientName && `${deliverySnap.recipientName}, `}
                  {deliverySnap.line1}, {deliverySnap.area} - {deliverySnap.pincode}
                </p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="space-y-2 pb-2 border-b border-dashed border-stone-300 dark:border-stone-700">
            <div className="flex justify-between text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 pb-1 border-b border-stone-200 dark:border-stone-800">
              <span className="flex-1">Item</span>
              <span className="w-10 text-center">Qty</span>
              <span className="w-12 text-right">Rate</span>
              <span className="w-14 text-right">Amount</span>
            </div>
            {order.items.map((item, idx) => {
              const rate = Math.round(item.unitPriceMinor / 100);
              const lineTotal = Math.round(item.lineTotalMinor / 100);
              return (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <div className="flex-1 pr-1">
                    <p className="font-bold">{item.nameSnapshot}</p>
                    {item.modifiersSnapshot && item.modifiersSnapshot.length > 0 && (
                      <p className="text-[10px] text-stone-500">
                        {item.modifiersSnapshot.map((m) => m.label).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="w-10 text-center font-semibold">{item.quantity}</span>
                  <span className="w-12 text-right text-stone-600 dark:text-stone-400">₹{rate}</span>
                  <span className="w-14 text-right font-bold">₹{lineTotal}</span>
                </div>
              );
            })}
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-stone-300 dark:border-stone-700">
            <div className="flex justify-between">
              <span className="text-stone-600 dark:text-stone-400">Item Total (Subtotal)</span>
              <span className="font-semibold">₹{subtotalRs}</span>
            </div>
            {discountRs > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Coupon Discount ({order.couponCode || "PROMO"})</span>
                <span>-₹{discountRs}</span>
              </div>
            )}
            {deliveryFeeRs > 0 && (
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">Delivery Charges</span>
                <span className="font-semibold">₹{deliveryFeeRs}</span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-center text-sm font-black pt-1">
            <span className="uppercase">Grand Total:</span>
            <span className="text-base text-[var(--brand-primary)]">₹{totalRs}</span>
          </div>

          {/* Payment Status Stamp */}
          <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
              {order.paymentStatus === "paid" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400 uppercase">
                    Paid In Full ({order.orderType === "delivery" ? "Razorpay Prepaid" : "Cash / Counter"})
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700 dark:text-amber-400 uppercase">
                    Payment Due: Pay at Counter
                  </span>
                </>
              )}
            </div>
            {order.razorpayPaymentId && (
              <p className="text-[10px] font-mono text-stone-500">
                Txn Ref: {order.razorpayPaymentId}
              </p>
            )}
          </div>

          {/* Thank you */}
          <div className="text-center pt-2 text-[10px] text-stone-500 dark:text-stone-400 italic">
            Thank you for choosing Cheezy Dip Cafe!
            <br />
            Have a cheesy & delightful day.
          </div>
        </div>

        {/* Action Buttons (Hidden when printed) */}
        <div className="pt-2 flex gap-2 shrink-0 print:hidden">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            className="flex-1 min-h-[44px] text-xs font-bold cursor-pointer"
          >
            Close
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handlePrint}
            className="flex-1 min-h-[44px] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Bill</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
