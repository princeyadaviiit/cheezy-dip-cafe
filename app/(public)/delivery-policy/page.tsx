import React from "react";
import Link from "next/link";
import { ArrowLeft, Truck, MapPin } from "lucide-react";
import { AUTHORIZED_DELIVERY_AREAS } from "@/lib/delivery/delivery-areas";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function DeliveryPolicyPage() {
  return (
    <article className="max-w-lg mx-auto w-full px-4 py-8 space-y-6 text-[var(--text)]">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <ThemeToggle size="sm" />
      </div>

      <div className="space-y-2 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold font-display text-[var(--text)]">Delivery Policy</h1>
        <p className="text-xs text-[var(--text-muted)]">Effective date: October 2026 • Cheezy dip cafe</p>
      </div>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">1. Authorized Delivery Pincodes</h2>
        <p className="text-[var(--text-muted)]">
          To ensure all burgers, loaded fries, and pizzas arrive fresh, hot, and with molten cheese at peak quality, we deliver exclusively within our verified cafe radius covering the following Jaipur postal zones:
        </p>

        <div className="space-y-2 pt-1">
          {AUTHORIZED_DELIVERY_AREAS.map((area) => (
            <div
              key={area.pincode}
              className="p-3 bg-[var(--bg-raised)] border border-[var(--border)] rounded-xl flex items-center justify-between text-xs shadow-xs"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                <div>
                  <span className="font-bold text-[var(--text)]">{area.areaName}</span>
                  <p className="text-[11px] text-[var(--text-muted)]">Pincode: {area.pincode}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Min. ₹{Math.round(area.minOrderMinor / 100)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">2. Delivery Charges & Free Delivery</h2>
        <ul className="list-disc pl-5 space-y-1 text-[var(--text-muted)]">
          <li><strong className="text-[var(--text)]">Minimum Order:</strong> ₹150 subtotal for delivery.</li>
          <li><strong className="text-[var(--text)]">Standard Delivery Fee:</strong> Flat ₹30 for delivery orders under ₹300.</li>
          <li><strong className="text-emerald-600 dark:text-emerald-400 font-bold">FREE Delivery:</strong> ₹0 delivery fee on all orders of ₹300 and above!</li>
          <li><strong className="text-[var(--text)]">Dine-In Delivery Fee:</strong> ₹0 (Free service for table dine-in).</li>
        </ul>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">3. Estimated Delivery Times</h2>
        <p className="text-[var(--text-muted)]">
          Standard delivery turnaround is typically <strong className="text-[var(--text)]">30 to 45 minutes</strong> from payment confirmation. During heavy rain, festive peaks, or peak dinner rushes (8 PM - 10 PM), delivery times may extend by 10 to 15 minutes.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">4. Packaging & Hot Food Guarantee</h2>
        <p className="text-[var(--text-muted)]">
          All cheesy burgers, kurkure momos, and loaded fries are packed in food-grade, ventilated thermal kraft cartons to preserve crispness and prevent sogginess during transit.
        </p>
      </section>

      <div className="pt-4 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Thermal Insulated Delivery Bags • Contactless Delivery Available</span>
      </div>
    </article>
  );
}
