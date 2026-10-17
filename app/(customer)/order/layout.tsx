import * as React from "react";
import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";

export default function CustomerOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* Customer Top Bar */}
      <header className="sticky top-0 z-40 bg-[var(--bg-raised)]/95 backdrop-blur-xs border-b border-[var(--border)] px-4 py-3 flex items-center justify-between max-w-md mx-auto w-full">
        <Link href="/order" className="font-display font-extrabold text-lg text-[var(--text)] tracking-tight">
          Cheezy dip <span className="text-[var(--brand-primary)]">cafe</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/order/cart"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--r-input)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
          </Link>
          <Link
            href="/order/account"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--r-input)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]"
            aria-label="Account and Orders"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Main Customer Body */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-4">{children}</main>
    </div>
  );
}
