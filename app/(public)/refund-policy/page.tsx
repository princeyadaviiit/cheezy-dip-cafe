import React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function RefundPolicyPage() {
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
        <h1 className="text-2xl font-bold font-display text-[var(--text)]">Refund & Cancellation Policy</h1>
        <p className="text-xs text-[var(--text-muted)]">Effective date: October 2026 • Cheezy dip cafe</p>
      </div>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">1. Order Cancellation Policy</h2>
        <div className="space-y-2">
          <p className="text-[var(--text-muted)]">
            <strong className="text-[var(--text)]">Dine-In Orders:</strong> Because our kitchen begins preparing dishes with hot melting cheese immediately upon order confirmation, dine-in orders may only be cancelled from your tracking screen before the kitchen changes status to &quot;Accepted&quot;. Once preparation begins, the order cannot be cancelled.
          </p>
          <p className="text-[var(--text-muted)]">
            <strong className="text-[var(--text)]">Delivery Orders:</strong> Delivery orders placed and prepaid via Razorpay cannot be cancelled once accepted by the kitchen staff. If you need to make changes immediately after placing, please call the cafe manager directly.
          </p>
        </div>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">2. Eligibility for Refunds</h2>
        <p className="text-[var(--text-muted)]">Refunds are granted under the following circumstances:</p>
        <ul className="list-disc pl-5 space-y-1 text-[var(--text-muted)]">
          <li>The cafe is unable to fulfill an order due to an unexpected ingredient outage or emergency closure.</li>
          <li>Delivery partner was unable to deliver your order due to circumstances within our control.</li>
          <li>A customer was charged more than once due to an online technical payment glitch.</li>
        </ul>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">3. Refund Processing Timelines</h2>
        <p className="text-[var(--text-muted)]">
          Approved refunds for Razorpay transactions are initiated by our admin staff within 24 hours. The refunded amount will be credited back to your original payment method (Bank Account / UPI / Debit or Credit Card) within <strong className="text-[var(--text)]">5 to 7 business days</strong>, in strict accordance with Reserve Bank of India (RBI) guidelines.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">4. Dispute & Escalation Contact</h2>
        <div className="p-3.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] space-y-1 text-xs shadow-xs">
          <p className="text-[var(--text)] font-semibold">Customer Support Desk</p>
          <p className="text-[var(--text-muted)]">Helpline: <span className="text-[var(--text)] font-mono font-bold">+91 86963 21018</span> (10 AM - 11 PM)</p>
          <p className="text-[var(--text-muted)]">Email: <span className="text-[var(--brand-primary)]">support@cheezydipcafe.com</span></p>
        </div>
      </section>

      <div className="pt-4 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <RefreshCw className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
        <span>Instant UPI / Gateway Reversal Support • Cheezy dip cafe</span>
      </div>
    </article>
  );
}
