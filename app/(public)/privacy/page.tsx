import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <article className="max-w-lg mx-auto w-full px-4 py-8 space-y-6 text-neutral-300">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <div className="space-y-2 border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold font-display text-white">Privacy Policy</h1>
        <p className="text-xs text-[var(--muted)]">Effective date: October 2026 • Cheezy dip cafe</p>
      </div>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">1. Information We Collect</h2>
        <p>
          Cheezy dip cafe collects minimal information necessary to process your food orders:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li><strong className="text-white">Phone Number:</strong> Verified via one-time SMS password (OTP) through our authentication provider (Clerk) for account identification and order updates.</li>
          <li><strong className="text-white">Delivery Address:</strong> Required only for home delivery orders to coordinate delivery partner fulfillment.</li>
          <li><strong className="text-white">Order History:</strong> Stored to allow live preparation tracking and customer re-ordering.</li>
        </ul>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">2. Payments & Financial Data Security</h2>
        <p>
          We do NOT store or process complete credit card numbers, debit card details, CVVs, or net banking passwords on our servers. All digital payments for online delivery are securely handled by Razorpay, a PCI-DSS compliant payment aggregator.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">3. Cookies & Session Storage</h2>
        <p>
          We use secure, HTTP-only cookies exclusively for maintaining authentication tokens and cryptographically signed table session tokens (`table_ctx`) during your dine-in visit. Cart data is stored locally in your browser storage.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-white">4. Contacting Us About Your Privacy</h2>
        <p>
          For questions, account deletion requests, or data privacy inquiries, contact us at:
        </p>
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs space-y-1">
          <p className="text-white font-semibold">Privacy Officer, Cheezy dip cafe</p>
          <p className="text-neutral-400">Email: <span className="text-amber-400">privacy@cheezydipcafe.com</span></p>
          <p className="text-neutral-400">Support Phone: +91 98765 43210</p>
        </div>
      </section>

      <div className="pt-4 border-t border-neutral-800 flex items-center gap-2 text-xs text-neutral-400">
        <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>End-to-End Cryptographically Secured • Zero Third-Party Advertising Trackers</span>
      </div>
    </article>
  );
}
