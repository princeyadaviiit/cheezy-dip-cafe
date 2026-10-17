import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <article className="max-w-lg mx-auto w-full px-4 py-8 space-y-6 text-neutral-300">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <div className="space-y-2 border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold font-display text-white">Terms of Service</h1>
        <p className="text-xs text-[var(--muted)]">Last updated: October 2026 • Cheezy dip cafe</p>
      </div>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">1. Introduction & Acceptance</h2>
        <p>
          Welcome to Cheezy dip cafe (&quot;we,&quot; &quot;our,&quot; or &quot;the Cafe&quot;). By accessing our web application, scanning physical table QR codes, or placing dine-in or delivery orders, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">2. Ordering & Dine-In Table QR Sessions</h2>
        <p>
          Our dine-in ordering uses cryptographically signed session cookies initialized exclusively by scanning the permanent QR code assigned to your specific table. You agree not to manipulate or forge table tokens. All dine-in food items ordered to your table are prepared fresh on demand and must be settled at the front counter prior to departure.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">3. Pricing & Payment</h2>
        <p>
          All menu prices are displayed in Indian Rupees (₹) and are inclusive of Goods & Services Tax (GST). Delivery orders require advance payment via our authorized payment partner, Razorpay. Dine-in orders are payable in Cash or UPI at the cafe counter. Prices are calculated strictly on our secure servers and cannot be altered by client input.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">4. Food Hygiene & 100% Pure Veg Commitment</h2>
        <p>
          Cheezy dip cafe operates as a 100% Pure Vegetarian kitchen certified under the Food Safety and Standards Authority of India (FSSAI). All ingredients, cheeses, oils, and garnishes comply strictly with vegetarian food preparation standards.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">5. Food Safety & Regulatory Information</h2>
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <p className="font-semibold text-white">Cheezy dip cafe</p>
          <p className="text-neutral-400">FSSAI Registration No: <span className="text-white font-mono">22224074000123</span></p>
          <p className="text-neutral-400">GSTIN: <span className="text-white font-mono">08AABCC1234D1Z5</span></p>
          <p className="text-neutral-400">Location: Main Market, Raja Park, Jaipur, Rajasthan 302004</p>
        </div>
      </section>

      <div className="pt-4 border-t border-neutral-800 flex items-center gap-2 text-xs text-neutral-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>FSSAI Certified Pure Veg Kitchen • Cheezy dip cafe</span>
      </div>
    </article>
  );
}
