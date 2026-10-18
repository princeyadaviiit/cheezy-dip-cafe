import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function TermsPage() {
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
        <h1 className="text-2xl font-bold font-display text-[var(--text)]">Terms of Service</h1>
        <p className="text-xs text-[var(--text-muted)]">Last updated: October 2026 • Cheezy dip cafe</p>
      </div>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">1. Introduction & Acceptance</h2>
        <p className="text-[var(--text-muted)]">
          Welcome to Cheezy dip cafe (&quot;we,&quot; &quot;our,&quot; or &quot;the Cafe&quot;). By accessing our web application, scanning physical table QR codes, or placing dine-in or delivery orders, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">2. Ordering & Dine-In Table QR Sessions</h2>
        <p className="text-[var(--text-muted)]">
          Our dine-in ordering uses cryptographically signed session cookies initialized exclusively by scanning the permanent QR code assigned to your specific table. You agree not to manipulate or forge table tokens. All dine-in food items ordered to your table are prepared fresh on demand and must be settled at the front counter prior to departure.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">3. Pricing & Payment</h2>
        <p className="text-[var(--text-muted)]">
          All menu prices are displayed in Indian Rupees (₹) and are inclusive of Goods & Services Tax (GST). Delivery orders require advance payment via our authorized payment partner, Razorpay. Dine-in orders are payable in Cash or UPI at the cafe counter. Prices are calculated strictly on our secure servers and cannot be altered by client input.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">4. Food Hygiene & 100% Pure Veg Commitment</h2>
        <p className="text-[var(--text-muted)]">
          Cheezy dip cafe operates as a 100% Pure Vegetarian kitchen certified under the Food Safety and Standards Authority of India (FSSAI). All ingredients, cheeses, oils, and garnishes comply strictly with vegetarian food preparation standards.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">5. Food Safety & Regulatory Information</h2>
        <div className="p-3.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] space-y-1 shadow-xs">
          <p className="font-semibold text-[var(--text)]">Cheezy dip cafe</p>
          <p className="text-[var(--text-muted)]">FSSAI Registration No: <span className="text-[var(--text)] font-mono font-bold">22224074000123</span></p>
          <p className="text-[var(--text-muted)]">GSTIN: <span className="text-[var(--text)] font-mono font-bold">08AABCC1234D1Z5</span></p>
          <p className="text-[var(--text-muted)]">Location: Main Market, Raja Park, Jaipur, Rajasthan 302004</p>
        </div>
      </section>

      <div className="pt-4 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>FSSAI Certified Pure Veg Kitchen • Cheezy dip cafe</span>
      </div>
    </article>
  );
}
