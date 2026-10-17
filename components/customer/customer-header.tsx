"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";

export function CustomerHeader() {
  const { totalCount } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-raised)]/95 backdrop-blur-xs border-b border-[var(--border)] px-4 py-3 flex items-center justify-between max-w-md mx-auto w-full">
      <Link href="/order" className="font-display font-extrabold text-lg text-[var(--text)] tracking-tight">
        Cheezy dip <span className="text-[var(--brand-primary)]">cafe</span>
      </Link>
      <div className="flex items-center gap-1">
        <Link
          href="/order/cart"
          className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--r-input)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
          aria-label="View Cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[var(--accent)] text-black text-[10px] font-black flex items-center justify-center shadow-xs">
              {totalCount > 9 ? "9+" : totalCount}
            </span>
          )}
        </Link>
        <Link
          href="/order/orders"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--r-input)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
          aria-label="Account and Orders"
        >
          <User className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}
