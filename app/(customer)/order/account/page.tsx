"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Phone,
  ShoppingBag,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ExternalLink,
  Sparkles,
  KeyRound,
} from "lucide-react";
import { useUser, Show, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { getCurrentStaffStatus } from "@/services/admin-service";

export default function CustomerAccountPage() {
  const { user, isLoaded } = useUser();
  const [staffInfo, setStaffInfo] = useState<{
    role: "owner" | "admin" | "kitchen" | null;
    isAuthenticated: boolean;
  }>({ role: null, isAuthenticated: false });

  useEffect(() => {
    getCurrentStaffStatus().then((res) => {
      setStaffInfo({
        role: res.role,
        isAuthenticated: res.isAuthenticated,
      });
    });
  }, []);

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold font-display text-[var(--text)]">Your Account</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Manage your profile, active sessions, and access staff tools.
        </p>
      </div>

      <Show when="signed-in">
        {/* User Profile Card */}
        <div className="p-4 rounded-[var(--r-card)] bg-[var(--bg-raised)] border border-[var(--border)] shadow-xs space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[var(--brand-primary)] bg-[var(--bg-inset)] shrink-0">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user.fullName || "User Avatar"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                  <User className="w-7 h-7" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-[var(--text)] truncate">
                {user?.fullName || user?.firstName || "Cafe Guest"}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-0.5">
                <Phone className="w-3.5 h-3.5 shrink-0 text-[var(--brand-primary)]" />
                <span className="truncate">
                  {user?.primaryPhoneNumber?.phoneNumber || user?.phoneNumbers?.[0]?.phoneNumber || "Phone verified"}
                </span>
              </div>
              {user?.primaryEmailAddress?.emailAddress && (
                <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                  {user.primaryEmailAddress.emailAddress}
                </p>
              )}
            </div>
          </div>

          {/* Role Status Tag */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Account Role:</span>
            {staffInfo.role ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                Staff: {staffInfo.role}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-[11px] bg-[var(--bg-inset)] text-[var(--text)] border border-[var(--border)]">
                Customer
              </span>
            )}
          </div>
        </div>

        {/* Staff Tools Access (Highlighted if user has staff role or wants to access staff hub) */}
        <div className="p-4 rounded-[var(--r-card)] bg-gradient-to-br from-[var(--brand-primary)]/10 via-[var(--bg-raised)] to-[var(--bg-raised)] border border-[var(--brand-primary)]/30 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Staff Operations Hub
              </div>
              <p className="text-xs text-[var(--text)] mt-1 font-medium">
                Access Kitchen Display System (KDS) & Admin Dashboard
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/kitchen"
              className="p-2.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] hover:border-[var(--brand-primary)] text-center transition-all shadow-2xs group"
            >
              <p className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--brand-primary)]">
                🍳 Kitchen KDS
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Live order queue</p>
            </Link>
            <Link
              href="/admin"
              className="p-2.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] hover:border-[var(--brand-primary)] text-center transition-all shadow-2xs group"
            >
              <p className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--brand-primary)]">
                🛡️ Admin Panel
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Reports & settings</p>
            </Link>
          </div>
          <Link
            href="/staff"
            className="flex items-center justify-between text-xs font-semibold text-[var(--brand-primary)] pt-1 hover:underline"
          >
            <span>Open full Staff Portal & Role Switcher</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Links Menu */}
        <div className="divide-y divide-[var(--border)] rounded-[var(--r-card)] bg-[var(--bg-raised)] border border-[var(--border)] overflow-hidden">
          <Link
            href="/order/orders"
            className="p-3.5 flex items-center justify-between text-xs font-semibold text-[var(--text)] hover:bg-[var(--bg-inset)] transition-colors min-h-[44px]"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>Order History & Active Tracking</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          </Link>

          <Link
            href="/menu"
            className="p-3.5 flex items-center justify-between text-xs font-semibold text-[var(--text)] hover:bg-[var(--bg-inset)] transition-colors min-h-[44px]"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <span>View Full Cafe Menu</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          </Link>

          <Link
            href="/contact"
            className="p-3.5 flex items-center justify-between text-xs font-semibold text-[var(--text)] hover:bg-[var(--bg-inset)] transition-colors min-h-[44px]"
          >
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Help, Support & Contact Cafe</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          </Link>
        </div>

        {/* Logout Section */}
        <div className="pt-2">
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="w-full min-h-[44px] py-2.5 px-4 rounded-[var(--r-button)] bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Cheezy Dip Cafe</span>
            </button>
          </SignOutButton>
        </div>
      </Show>

      <Show when="signed-out">
        <div className="p-8 text-center bg-[var(--bg-raised)] rounded-[var(--r-card)] border border-[var(--border)] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[var(--text)]">Not Logged In</h2>
            <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
              Please sign in with your verified mobile number to view and manage your account, track orders, or access staff tools.
            </p>
          </div>
          <Link href="/sign-in?redirect_url=/order/account">
            <Button variant="primary" className="min-h-[44px]">
              Sign In with Mobile OTP
            </Button>
          </Link>
        </div>
      </Show>
    </div>
  );
}
