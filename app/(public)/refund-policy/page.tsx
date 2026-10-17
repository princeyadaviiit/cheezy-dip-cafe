import React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <article className="max-w-lg mx-auto w-full px-4 py-8 space-y-6 text-neutral-300">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <div className="space-y-2 border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold font-display text-white">Refund & Cancellation Policy</h1>
        <p className="text-xs text-[var(--muted)]">Effective date: October 2026 • Cheezy dip cafe</p>
      </div>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">1. Order Cancellation Policy</h2>
        <div className="space-y-2">
          <p>
            <strong className="text-white">Dine-In Orders:</strong> Because our kitchen begins preparing dishes with hot melting cheese immediately upon order confirmation, dine-in orders may only be cancelled from your tracking screen before the kitchen changes status to &quot;Accepted&quot;. Once preparation begins, the order cannot be cancelled.
          </p>
          <p>
            <strong className="text-white">Delivery Orders:</strong> Delivery orders placed and prepaid via Razorpay cannot be cancelled once accepted by the kitchen staff. If you need to make changes immediately after placing, please call the cafe manager directly.
          </p>
        </div>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">2. Eligibility for Refunds</h2>
        <p>Refunds are granted under the following circumstances:</p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li>The cafe is unable to fulfill an order due to an unexpected ingredient outage or emergency closure.</li>
          <li>Delivery partner was unable to deliver your order due to circumstances within our control.</li>
          <li>A customer was charged more than once due to an online technical payment glitch.</li>
        </ul>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">3. Refund Processing Timelines</h2>
        <p>
          Approved refunds for Razorpay transactions are initiated by our admin staff within 24 hours. The refunded amount will be credited back to your original payment method (Bank Account / UPI / Debit or Credit Card) within <strong className="text-white">5 to 7 business days</strong>, in strict accordance with Reserve Bank of India (RBI) guidelines.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">4. Dispute & Escalation Contact</h2>
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1 text-xs">
          <p className="text-white font-semibold">Customer Support Desk</p>
          <p className="text-neutral-400">Helpline: <span className="text-white font-mono">+91 98765 43210</span> (10 AM - 11 PM)</p>
          <p className="text-neutral-400">Email: <span className="text-amber-400">support@cheezydipcafe.com</span></p>
        </div>
      </section>

      <div className="pt-4 border-t border-neutral-800 flex items-center gap-2 text-xs text-neutral-400">
        <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Instant UPI / Gateway Reversal Support • Cheezy dip cafe</span>
      </div>
    </article>
  );
}
