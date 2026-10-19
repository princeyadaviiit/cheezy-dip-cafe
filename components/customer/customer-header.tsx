"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, User, LogOut, ShieldCheck } from "lucide-react";
import { UserButton, Show, SignOutButton } from "@clerk/nextjs";
import { useCart } from "@/lib/cart/cart-context";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function CustomerHeader() {
  const { totalCount } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-raised)]/95 backdrop-blur-xs border-b border-[var(--border)] px-4 py-2.5 flex items-center justify-between max-w-md mx-auto w-full transition-colors">
      <Link
        href="/order"
        className="font-display font-extrabold text-base sm:text-lg text-[var(--text)] tracking-tight hover:opacity-90 transition-opacity"
      >
        Cheezy dip <span className="text-[var(--brand-primary)]">cafe</span>
      </Link>

      <div className="flex items-center gap-1">
        {/* Theme Switcher */}
        <ThemeToggle
          size="sm"
          className="border-transparent bg-transparent hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
        />

        {/* Cart Icon with Counter */}
        <Link
          href="/order/cart"
          className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--r-input)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
          aria-label="View Cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
              {totalCount > 9 ? "9+" : totalCount}
            </span>
          )}
        </Link>

        {/* Signed In: Clerk UserButton with full profile/password management + direct logout */}
        <Show when="signed-in">
          <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full border border-[var(--border)]",
                  userButtonTrigger: "focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] rounded-full",
                  userButtonPopoverCard: "bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text)] shadow-[var(--shadow-float)]",
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label="My Orders"
                  labelIcon={<ShoppingBag className="w-4 h-4 text-[var(--brand-primary)]" />}
                  href="/order/orders"
                />
                <UserButton.Link
                  label="Account & Addresses"
                  labelIcon={<User className="w-4 h-4 text-[var(--text-muted)]" />}
                  href="/order/account"
                />
              </UserButton.MenuItems>
            </UserButton>
          </div>
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--r-input)] text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </SignOutButton>
        </Show>

        {/* Signed Out: Link to Sign In */}
        <Show when="signed-out">
          <Link
            href="/sign-in"
            className="min-h-[44px] px-2.5 flex items-center justify-center rounded-[var(--r-input)] text-xs font-bold text-[var(--brand-primary)] hover:bg-[var(--border)] transition-colors"
            aria-label="Sign In"
          >
            Sign In
          </Link>
        </Show>
      </div>
    </header>
  );
}
