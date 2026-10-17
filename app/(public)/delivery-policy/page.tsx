import React from "react";
import Link from "next/link";
import { ArrowLeft, Truck, MapPin } from "lucide-react";
import { AUTHORIZED_DELIVERY_AREAS } from "@/lib/delivery/delivery-areas";

export default function DeliveryPolicyPage() {
  return (
    <article className="max-w-lg mx-auto w-full px-4 py-8 space-y-6 text-neutral-300">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <div className="space-y-2 border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold font-display text-white">Delivery Policy</h1>
        <p className="text-xs text-[var(--muted)]">Effective date: October 2026 • Cheezy dip cafe</p>
      </div>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">1. Authorized Delivery Pincodes</h2>
        <p>
          To ensure all burgers, loaded fries, and pizzas arrive fresh, hot, and with molten cheese at peak quality, we deliver exclusively within our verified cafe radius covering the following Jaipur postal zones:
        </p>

        <div className="space-y-2 pt-1">
          {AUTHORIZED_DELIVERY_AREAS.map((area) => (
            <div
              key={area.pincode}
              className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-white">{area.areaName}</span>
                  <p className="text-[11px] text-neutral-400">Pincode: {area.pincode}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Min. ₹{Math.round(area.minOrderMinor / 100)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">2. Delivery Charges & Minimum Order</h2>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li><strong className="text-white">Minimum Order:</strong> ₹150 subtotal for delivery.</li>
          <li><strong className="text-white">Standard Delivery Fee:</strong> Flat ₹30 per delivery order.</li>
          <li><strong className="text-white">Dine-In Delivery Fee:</strong> ₹0 (Free service for table dine-in).</li>
        </ul>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">3. Estimated Delivery Times</h2>
        <p>
          Standard delivery turnaround is typically <strong className="text-white">30 to 45 minutes</strong> from payment confirmation. During heavy rain, festive peaks, or peak dinner rushes (8 PM - 10 PM), delivery times may extend by 10 to 15 minutes.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">4. Packaging & Hot Food Guarantee</h2>
        <p>
          All cheesy burgers, kurkure momos, and loaded fries are packed in food-grade, ventilated thermal kraft cartons to preserve crispness and prevent sogginess during transit.
        </p>
      </section>

      <div className="pt-4 border-t border-neutral-800 flex items-center gap-2 text-xs text-neutral-400">
        <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Thermal Insulated Delivery Bags • Contactless Delivery Available</span>
      </div>
    </article>
  );
}
