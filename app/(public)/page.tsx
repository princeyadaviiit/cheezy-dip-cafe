import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { formatPrice } from "@/lib/utils";
import { MENU_ITEMS } from "@/lib/menu-data";
import { QrCode, Bike, Clock, MapPin, Phone, ChevronRight } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";

export default function LandingPage() {
  const signatureDishes = MENU_ITEMS.filter((item) => item.featured).slice(0, 4);

  return (
    <div className="flex-1 flex flex-col items-center w-full bg-[var(--bg)] text-[var(--text)] overflow-x-hidden">
      {/* Top Header with Theme Switcher & Clerk Auth */}
      <header className="w-full max-w-md px-4 py-2.5 flex items-center justify-between border-b border-[var(--border)]">
        <Link href="/" className="font-display font-extrabold text-base tracking-tight text-[var(--text)]">
          Cheezy dip <span className="text-[var(--brand-primary)]">cafe</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <Link
            href="/menu"
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] px-2 py-1.5 rounded-lg transition-colors"
          >
            Menu
          </Link>
          <ThemeToggle size="sm" />
          <Show when="signed-in">
            <div className="flex items-center pl-1">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-7 h-7 rounded-full border border-[var(--border)]",
                  },
                }}
              />
            </div>
          </Show>
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[var(--brand-primary)] text-white hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
          </Show>
        </div>
      </header>

      {/* 1. HERO SECTION (Designed for 360px mobile viewport first) */}
      <section className="w-full max-w-md px-4 pt-6 pb-8 flex flex-col items-center text-center">
        {/* Brand Badge */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[var(--brand-primary)] shadow-[var(--shadow-float)] bg-[var(--bg-raised)] mb-3 shrink-0">
          <Image
            src="/brand/logo.jpeg"
            alt="Cheezy Dip Cafe Logo"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Cafe Headline */}
        <div className="space-y-1">
          <span className="inline-block px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 rounded-full border border-[var(--brand-primary)]/30">
            Freshly Melted Everyday
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[var(--text)]">
            Cheezy dip <span className="text-[var(--brand-primary)]">cafe</span>
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto leading-relaxed">
            Loaded cheese burgers, crispy peri-peri fries, fresh pizzas, and Himalayan momos.
          </p>
        </div>

        {/* Hero Food Visual (The Dip Moment) */}
        <div className="w-full my-5 relative group">
          <div className="relative w-full aspect-[4/3] rounded-[var(--r-card)] overflow-hidden border border-[var(--border)] shadow-[var(--shadow-float)] bg-[var(--bg-inset)]">
            <Image
              src="/brand/cheesy_dip_hero.jpg"
              alt="Crispy French fries dipping into molten cheese sauce"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
              sizes="(max-width: 640px) 100vw, 448px"
            />
            {/* Live Status Chip */}
            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-[var(--r-pill)] border border-emerald-500/40 flex items-center gap-1.5 shadow">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">Open Now • Kitchen Active</span>
            </div>
          </div>
        </div>

        {/* Two Primary Actions - Always visible without scrolling on 360px */}
        <div className="w-full flex flex-col gap-2.5 pt-1">
          <Link href="/order" className="w-full">
            <Button
              variant="primary"
              size="lg"
              className="w-full text-base font-extrabold shadow-md tracking-wide"
            >
              Order Now
            </Button>
          </Link>
          <Link href="/menu" className="w-full">
            <Button
              variant="secondary"
              size="lg"
              className="w-full text-base font-semibold border-[var(--border-strong)]"
            >
              View Full Menu
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. SIGNATURE DISHES SECTION */}
      <section className="w-full max-w-md px-4 py-8 border-t border-[var(--border)]">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
              Customer Favorites
            </span>
            <h2 className="text-xl font-bold font-display text-[var(--text)]">
              Signature Dishes
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {signatureDishes.map((dish) => (
            <article
              key={dish.id}
              className="rounded-[var(--r-card)] bg-[var(--bg-raised)] border border-[var(--border)] overflow-hidden flex flex-col shadow-sm"
            >
              <div className="relative w-full aspect-[16/10] bg-[var(--bg-inset)]">
                <Image
                  src={dish.imagePath}
                  alt={dish.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 220px"
                />
                <span className="absolute bottom-2 left-2 bg-[var(--bg-raised)]/95 text-[10px] px-2 py-0.5 rounded font-mono font-bold text-[var(--brand-primary)] border border-[var(--border)] shadow-xs">
                  {formatPrice(dish.priceMinor)}
                </span>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-sm text-[var(--text)] line-clamp-1">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                    {dish.description}
                  </p>
                </div>
                <Link href="/order" className="w-full pt-1">
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                    Order this
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. HOW ORDERING WORKS */}
      <section className="w-full max-w-md px-4 py-8 border-t border-[var(--border)] bg-[var(--bg-raised)]/40">
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
            Simple & Fast
          </span>
          <h2 className="text-xl font-bold font-display text-[var(--text)]">
            How Ordering Works
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {/* Step 1: Dine-In */}
          <div className="p-4 rounded-[var(--r-card)] bg-[var(--bg)] border border-[var(--border)] flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/40 flex items-center justify-center shrink-0 text-[var(--brand-primary)]">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold font-display text-[var(--text)]">
                1. Dine-In at Table
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Scan the permanent QR code on your table. Browse the menu, place your order, and pay at the counter when served.
              </p>
            </div>
          </div>

          {/* Step 2: Delivery */}
          <div className="p-4 rounded-[var(--r-card)] bg-[var(--bg)] border border-[var(--border)] flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[var(--brand-accent)]/15 border border-[var(--brand-accent)]/40 flex items-center justify-center shrink-0 text-[var(--brand-accent)]">
              <Bike className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold font-display text-[var(--text)]">
                2. Home Delivery
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Pick your items, verify your phone via OTP, enter your local address, and pay securely via UPI/Cards (Razorpay).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CAFE DETAILS & TIMINGS */}
      <section className="w-full max-w-md px-4 py-8 border-t border-[var(--border)]">
        <h2 className="text-lg font-bold font-display text-[var(--text)] mb-3">
          Visit & Contact
        </h2>
        <div className="p-4 rounded-[var(--r-card)] bg-[var(--bg-raised)] border border-[var(--border)] space-y-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[var(--text)]">Opening Hours</p>
              <p className="text-[var(--text-muted)]">Monday – Sunday: 11:00 AM – 11:00 PM</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Dine-in & Delivery active</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 pt-2 border-t border-[var(--border)]">
            <MapPin className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[var(--text)]">Location</p>
              <p className="text-[var(--text-muted)]">Shop 4, Main Market Road, City Center</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 pt-2 border-t border-[var(--border)]">
            <Phone className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[var(--text)]">Call Us</p>
              <a href="tel:+919876543210" className="text-[var(--brand-primary)] hover:underline">
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="w-full max-w-md px-4 py-8 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)] space-y-4">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
          <Link href="/menu" className="hover:text-[var(--text)]">Menu</Link>
          <Link href="/terms" className="hover:text-[var(--text)]">Terms</Link>
          <Link href="/privacy" className="hover:text-[var(--text)]">Privacy</Link>
          <Link href="/refund-policy" className="hover:text-[var(--text)]">Refunds</Link>
          <Link href="/delivery-policy" className="hover:text-[var(--text)]">Delivery</Link>
          <Link href="/contact" className="hover:text-[var(--text)]">Contact</Link>
        </div>
        <p className="text-[11px] text-[var(--text-muted)]/80">
          100% Pure Vegetarian Cafe • Raja Park, Jaipur
        </p>
        <p className="text-[10px] text-[var(--text-muted)]/60">
          © {new Date().getFullYear()} Cheezy dip cafe. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
