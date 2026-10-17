import React from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Clock, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  return (
    <article className="max-w-lg mx-auto w-full px-4 py-8 space-y-6 text-neutral-300">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <div className="space-y-2 border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold font-display text-white">Contact Us</h1>
        <p className="text-xs text-[var(--muted)]">Cheezy dip cafe • Jaipur, Rajasthan</p>
      </div>

      <div className="grid gap-3 pt-1">
        {/* Address */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-white text-sm">Cafe Address</h3>
            <p className="text-neutral-300">Plot 42, Main Market, Near Central Park Road</p>
            <p className="text-neutral-400">Raja Park, Jaipur, Rajasthan 302004, India</p>
          </div>
        </div>

        {/* Phone */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
          <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-white text-sm">Phone Helpline</h3>
            <p className="text-neutral-300 font-mono">+91 98765 43210</p>
            <p className="text-[11px] text-neutral-400">Available daily from 10:00 AM to 11:00 PM</p>
          </div>
        </div>

        {/* Email */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
          <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-white text-sm">Email Support</h3>
            <p className="text-amber-400 font-mono">hello@cheezydipcafe.com</p>
            <p className="text-[11px] text-neutral-400">We respond to inquiries within 24 hours</p>
          </div>
        </div>

        {/* Timings */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-white text-sm">Kitchen Timings</h3>
            <p className="text-neutral-300">Monday - Sunday: <strong className="text-white">10:00 AM – 11:00 PM</strong></p>
            <p className="text-[11px] text-neutral-400">Open 7 days a week for dine-in & delivery</p>
          </div>
        </div>
      </div>

      {/* Official Business Registration */}
      <section className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2 text-xs">
        <h3 className="font-bold text-white text-sm border-b border-neutral-800 pb-1.5 flex items-center justify-between">
          <span>Regulatory Compliance</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </h3>
        <div className="space-y-1.5 text-neutral-400">
          <p>Legal Entity: <span className="text-white font-semibold">Cheezy Dip Cafe & Foodworks</span></p>
          <p>FSSAI Registration No: <span className="text-white font-mono">22224074000123</span></p>
          <p>GSTIN: <span className="text-white font-mono">08AABCC1234D1Z5</span></p>
          <p>Food Category: <span className="text-emerald-400 font-bold">100% Pure Vegetarian Cafe</span></p>
        </div>
      </section>
    </article>
  );
}
