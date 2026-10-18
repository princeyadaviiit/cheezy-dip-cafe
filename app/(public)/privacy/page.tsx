import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-bold font-display text-[var(--text)]">Privacy Policy</h1>
        <p className="text-xs text-[var(--text-muted)]">Effective date: October 2026 • Cheezy dip cafe</p>
      </div>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">1. Information We Collect</h2>
        <p className="text-[var(--text-muted)]">
          Cheezy dip cafe collects minimal information necessary to process your food orders:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-[var(--text-muted)]">
          <li><strong className="text-[var(--text)]">Phone Number:</strong> Verified via one-time SMS password (OTP) through our authentication provider (Clerk) for account identification and order updates.</li>
          <li><strong className="text-[var(--text)]">Delivery Address:</strong> Required only for home delivery orders to coordinate delivery partner fulfillment.</li>
          <li><strong className="text-[var(--text)]">Order History:</strong> Stored to allow live preparation tracking and customer re-ordering.</li>
        </ul>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">2. Payments & Financial Data Security</h2>
        <p className="text-[var(--text-muted)]">
          We do NOT store or process complete credit card numbers, debit card details, CVVs, or net banking passwords on our servers. All digital payments for online delivery are securely handled by Razorpay, a PCI-DSS compliant payment aggregator.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">3. Cookies & Session Storage</h2>
        <p className="text-[var(--text-muted)]">
          We use secure, HTTP-only cookies exclusively for maintaining authentication tokens and cryptographically signed table session tokens (`table_ctx`) during your dine-in visit. Cart data is stored locally in your browser storage.
        </p>
      </section>

      <section className="space-y-2.5 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text)]">4. Contacting Us About Your Privacy</h2>
        <p className="text-[var(--text-muted)]">
          For questions, account deletion requests, or data privacy inquiries, contact us at:
        </p>
        <div className="p-3.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] text-xs space-y-1 shadow-xs">
          <p className="text-[var(--text)] font-semibold">Privacy Officer, Cheezy dip cafe</p>
          <p className="text-[var(--text-muted)]">Email: <span className="text-[var(--brand-primary)]">privacy@cheezydipcafe.com</span></p>
          <p className="text-[var(--text-muted)]">Support Phone: +91 98765 43210</p>
        </div>
      </section>

      <div className="pt-4 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>End-to-End Cryptographically Secured • Zero Third-Party Advertising Trackers</span>
      </div>
    </article>
  );
}
