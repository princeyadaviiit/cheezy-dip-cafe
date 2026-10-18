"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Plus } from "lucide-react";

function StyleTileContent() {
  const { showToast } = useToast();
  const [inputValue, setInputValue] = React.useState("");

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-8 px-4 flex flex-col items-center">
      {/* 360px viewport simulation container */}
      <main className="w-full max-w-[360px] sm:max-w-md flex flex-col gap-8">
        {/* Header / Logo section */}
        <section className="flex flex-col items-center text-center gap-3 pt-4">
          <div className="w-full flex justify-end">
            <ThemeToggle size="sm" />
          </div>
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[var(--brand-primary)] shadow-lg bg-[var(--bg)]">
            <Image
              src="/brand/logo.jpeg"
              alt="Cheezy Dip Cafe Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold font-display tracking-tight text-[var(--text)]">
              Cheezy dip cafe
            </h1>
            <p className="text-xs uppercase tracking-widest text-[var(--brand-primary)] font-semibold mt-0.5">
              Melting In Every Bite
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Design System Style Tile (360px mobile-first)
            </p>
          </div>
        </section>

        {/* Section 1: Brand Color Palette */}
        <section className="bg-[var(--bg-raised)] p-4 rounded-[var(--r-card)] border border-[var(--border)] flex flex-col gap-3">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--brand-primary)]">
            1. Brand Palette Tokens
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2.5 p-2 rounded-[var(--r-input)] bg-[var(--bg)] border border-[var(--border)]">
              <span className="w-6 h-6 rounded-md bg-[var(--brand-primary)] shrink-0 shadow" />
              <div>
                <p className="font-semibold">Primary Gold</p>
                <p className="text-[10px] text-[var(--text-muted)]">#FFB800</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-[var(--r-input)] bg-[var(--bg)] border border-[var(--border)]">
              <span className="w-6 h-6 rounded-md bg-[var(--brand-accent)] shrink-0 shadow" />
              <div>
                <p className="font-semibold">Brand Accent</p>
                <p className="text-[10px] text-[var(--text-muted)]">#D32F2F</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-[var(--r-input)] bg-[var(--bg)] border border-[var(--border)]">
              <span className="w-6 h-6 rounded-md bg-[var(--bg-raised)] border border-[var(--border-strong)] shrink-0" />
              <div>
                <p className="font-semibold">Surface Raised</p>
                <p className="text-[10px] text-[var(--text-muted)]">#1C1C20</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-[var(--r-input)] bg-[var(--bg)] border border-[var(--border)]">
              <span className="w-6 h-6 rounded-md bg-[var(--border)] shrink-0" />
              <div>
                <p className="font-semibold">Border Token</p>
                <p className="text-[10px] text-[var(--text-muted)]">#2E2E34</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Typography Pairing */}
        <section className="bg-[var(--bg-raised)] p-4 rounded-[var(--r-card)] border border-[var(--border)] flex flex-col gap-3">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--brand-primary)]">
            2. Typography (Bricolage + Figtree)
          </h2>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Display Font (Bricolage Grotesque)</p>
              <p className="font-display text-xl font-bold text-[var(--text)]">
                Crispy Dip Special Burger
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Body Font (Figtree with Tabular ₹)</p>
              <p className="font-body text-sm text-[var(--text-muted)]">
                Loaded with double spiced veg patties, cheddar slices, and sizzling molten cheese dip.
              </p>
              <p className="text-lg font-bold text-[var(--brand-primary)] mt-1 font-mono">
                ₹129 <span className="text-xs font-normal text-[var(--text-muted)] line-through">₹149</span>
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Buttons Set */}
        <section className="bg-[var(--bg-raised)] p-4 rounded-[var(--r-card)] border border-[var(--border)] flex flex-col gap-3">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--brand-primary)]">
            3. Interactive Buttons (min 44px)
          </h2>
          <div className="flex flex-col gap-2.5">
            <Button
              variant="primary"
              size="md"
              onClick={() => showToast({ type: "success", title: "Order Action", message: "Item added to cart!" })}
            >
              Order Now (Primary 44px)
            </Button>
            <Button variant="secondary" size="md">
              View Menu (Secondary)
            </Button>
            <Button variant="accent" size="md">
              Pay ₹109 (Accent Action)
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                Customise
              </Button>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </div>
            <Button variant="primary" size="md" isLoading>
              Processing
            </Button>
          </div>
        </section>

        {/* Section 4: Form Input */}
        <section className="bg-[var(--bg-raised)] p-4 rounded-[var(--r-card)] border border-[var(--border)] flex flex-col gap-3">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--brand-primary)]">
            4. Inputs (16px font on mobile)
          </h2>
          <div className="space-y-3">
            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              type="tel"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="We will send a 6-digit OTP to verify"
            />
            <Input
              label="Delivery Pincode"
              placeholder="e.g. 110001"
              defaultValue="12345"
              error="Delivery is not yet available in this pincode"
            />
          </div>
        </section>

        {/* Section 5: Real Menu Item Card */}
        <section className="bg-[var(--bg-raised)] p-4 rounded-[var(--r-card)] border border-[var(--border)] flex flex-col gap-3">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--brand-primary)]">
            5. Authentic Menu Card
          </h2>
          <article className="overflow-hidden rounded-[var(--r-card)] bg-[var(--bg)] border border-[var(--border)] flex flex-col shadow-sm">
            <div className="relative w-full h-44 bg-[var(--bg-inset)]">
              <Image
                src="/brand/dishes/fries_cheese_loaded.jpg"
                alt="Cheese Loaded Fries"
                fill
                className="object-cover"
              />
              <div className="absolute top-2.5 left-2.5 bg-black/80 px-2 py-0.5 rounded-[var(--r-pill)] border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-semibold text-emerald-400 uppercase">100% Veg</span>
              </div>
            </div>
            <div className="p-3.5 flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-display font-bold text-base text-[var(--text)] leading-snug">
                  Cheese Loaded Fries
                </h3>
                <span className="text-base font-extrabold text-[var(--brand-primary)] shrink-0">
                  ₹109
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                Hot crispy French fries smothered in flowing melted yellow cheddar sauce, seasoned with fragrant herbs.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-[var(--border)]">
                <span className="text-[11px] text-[var(--brand-primary)] font-medium">
                  + Add Dip for ₹20
                </span>
                <Button size="sm" variant="primary" className="h-9 px-3 gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            </div>
          </article>
        </section>

        {/* Section 6: Skeleton Loader */}
        <section className="bg-[var(--bg-raised)] p-4 rounded-[var(--r-card)] border border-[var(--border)] flex flex-col gap-3">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--brand-primary)]">
            6. Skeleton Loader (Zero Blank Screen)
          </h2>
          <div className="p-3.5 rounded-[var(--r-card)] bg-[var(--bg)] border border-[var(--border)] space-y-3">
            <Skeleton className="w-full h-36" variant="card" />
            <div className="space-y-1.5">
              <Skeleton className="w-3/4 h-5" />
              <Skeleton className="w-full h-3.5" />
              <Skeleton className="w-1/2 h-3.5" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="w-16 h-6" />
              <Skeleton className="w-20 h-9" variant="rectangular" />
            </div>
          </div>
        </section>

        {/* Section 7: Status Badges */}
        <section className="bg-[var(--bg-raised)] p-4 rounded-[var(--r-card)] border border-[var(--border)] flex flex-col gap-3">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--brand-primary)]">
            7. Order Status Badges
          </h2>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="placed" />
            <StatusBadge status="accepted" />
            <StatusBadge status="preparing" />
            <StatusBadge status="ready" />
            <StatusBadge status="out_for_delivery" />
            <StatusBadge status="delivered" />
            <StatusBadge status="cancelled" />
          </div>
        </section>
      </main>
    </div>
  );
}

export default function StyleTilePage() {
  return (
    <ToastProvider>
      <StyleTileContent />
    </ToastProvider>
  );
}
