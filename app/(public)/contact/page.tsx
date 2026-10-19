import React from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Clock, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function ContactPage() {
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
        <h1 className="text-2xl font-bold font-display text-[var(--text)]">Contact Us</h1>
        <p className="text-xs text-[var(--text-muted)]">Cheezy dip cafe • Jaipur, Rajasthan</p>
      </div>

      <div className="grid gap-3 pt-1">
        {/* Address */}
        <div className="p-4 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border)] flex items-start gap-3 shadow-xs">
          <MapPin className="w-5 h-5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-[var(--text)] text-sm">Cafe Address</h3>
            <p className="text-[var(--text-muted)]">Plot 42, Main Market, Near Central Park Road</p>
            <p className="text-[var(--text-muted)]">Raja Park, Jaipur, Rajasthan 302004, India</p>
          </div>
        </div>

        {/* Phone */}
        <div className="p-4 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border)] flex items-start gap-3 shadow-xs">
          <Phone className="w-5 h-5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-[var(--text)] text-sm">Phone Helpline</h3>
            <a
              href="tel:+918696321018"
              className="inline-block text-[var(--brand-primary)] font-mono font-bold hover:underline"
            >
              +91 86963 21018
            </a>
            <p className="text-[11px] text-[var(--text-muted)]">Available daily from 10:00 AM to 11:00 PM</p>
          </div>
        </div>

        {/* Email */}
        <div className="p-4 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border)] flex items-start gap-3 shadow-xs">
          <Mail className="w-5 h-5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-[var(--text)] text-sm">Email Support</h3>
            <p className="text-[var(--brand-primary)] font-mono font-bold">hello@cheezydipcafe.com</p>
            <p className="text-[11px] text-[var(--text-muted)]">We respond to inquiries within 24 hours</p>
          </div>
        </div>

        {/* Timings */}
        <div className="p-4 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border)] flex items-start gap-3 shadow-xs">
          <Clock className="w-5 h-5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-[var(--text)] text-sm">Kitchen Timings</h3>
            <p className="text-[var(--text-muted)]">Monday - Sunday: <strong className="text-[var(--text)]">10:00 AM – 11:00 PM</strong></p>
            <p className="text-[11px] text-[var(--text-muted)]">Open 7 days a week for dine-in & delivery</p>
          </div>
        </div>
      </div>

      {/* Cafe Information */}
      <section className="p-4 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border)] space-y-2 text-xs shadow-xs">
        <h3 className="font-bold text-[var(--text)] text-sm border-b border-[var(--border)] pb-1.5 flex items-center justify-between">
          <span>Cafe Details</span>
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </h3>
        <div className="space-y-1.5 text-[var(--text-muted)]">
          <p>Cafe Entity: <span className="text-[var(--text)] font-semibold">Cheezy Dip Cafe</span></p>
          <p>Food Category: <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Pure Vegetarian Cafe</span></p>
          <p>Location: <span className="text-[var(--text)] font-semibold">Raja Park, Jaipur, Rajasthan</span></p>
        </div>
      </section>
    </article>
  );
}
