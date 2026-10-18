"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ChefHat,
  Lock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  LogOut,
  Users,
  KeyRound,
} from "lucide-react";
import { Show, SignOutButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  getCurrentStaffStatus,
  setDevStaffRole,
  getStaffList,
} from "@/services/admin-service";
import { type StaffRole } from "@/lib/auth/staff-store";

export default function StaffPortalPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [status, setStatus] = useState<{
    isAuthenticated: boolean;
    userId: string | null;
    phone: string | null;
    role: StaffRole | null;
  }>({
    isAuthenticated: false,
    userId: null,
    phone: null,
    role: null,
  });

  const [staffDirectory, setStaffDirectory] = useState<
    Array<{ id: string; name: string; phone: string; role: string; isActive: boolean }>
  >([]);

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const res = await getCurrentStaffStatus();
      setStatus(res);
      const staff = await getStaffList().catch(() => []);
      setStaffDirectory(staff);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [res, staff] = await Promise.all([
          getCurrentStaffStatus(),
          getStaffList().catch(() => []),
        ]);
        if (active) {
          setStatus(res);
          setStaffDirectory(staff);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleRoleSwitch = async (role: StaffRole | "none") => {
    setSwitching(true);
    try {
      await setDevStaffRole(role);
      await refreshStatus();
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to switch role");
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center">
      {/* Staff Header */}
      <header className="w-full max-w-md px-4 py-3 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-raised)] sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-black text-sm tracking-tight text-[var(--text)] leading-tight">
              Cheezy Dip Cafe
            </h1>
            <p className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider">
              Staff & Operations Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle size="sm" />
          <Link
            href="/order"
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors min-h-[44px] flex items-center"
          >
            Customer App
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md px-4 py-6 space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black font-display text-[var(--text)]">
            Cafe Operations Access
          </h2>
          <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
            Manage live kitchen orders, sales reports, operational controls, and staff permissions.
          </p>
        </div>

        {/* Current Auth & Role Status Card */}
        <div className="p-4 rounded-[var(--r-card)] bg-[var(--bg-raised)] border border-[var(--border)] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Current Session
            </span>
            <button
              onClick={refreshStatus}
              className="text-[11px] text-[var(--brand-primary)] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[var(--bg-inset)] border border-[var(--border)] flex items-center justify-center text-[var(--brand-primary)] shrink-0">
              {status.role === "kitchen" ? (
                <ChefHat className="w-6 h-6 text-orange-500" />
              ) : status.role === "admin" || status.role === "owner" ? (
                <ShieldCheck className="w-6 h-6 text-[var(--brand-primary)]" />
              ) : (
                <Lock className="w-5 h-5 text-[var(--text-muted)]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--text)] truncate">
                {status.phone || user?.primaryPhoneNumber?.phoneNumber || (status.isAuthenticated ? "Logged In User" : "Signed Out")}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-[var(--text-muted)]">Active Role:</span>
                {status.role ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    {status.role}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                    No Staff Privileges
                  </span>
                )}
              </div>
            </div>
          </div>

          <Show when="signed-out">
            <div className="pt-2">
              <Link href="/sign-in?redirect_url=/staff" className="w-full block">
                <Button variant="primary" className="w-full min-h-[44px]">
                  Sign In with Mobile OTP
                </Button>
              </Link>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="pt-2 flex items-center justify-between border-t border-[var(--border)]">
              <span className="text-[11px] text-[var(--text-muted)]">
                Clerk ID: <code className="text-[10px] bg-[var(--bg-inset)] px-1 py-0.5 rounded">{user?.id ? user.id.slice(0, 14) + "..." : "connected"}</code>
              </span>
              <SignOutButton redirectUrl="/staff">
                <button
                  type="button"
                  className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </Show>
        </div>

        {/* Operational Portals (Kitchen & Admin) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Operational Portals
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {/* Kitchen Display System */}
            <Link
              href="/kitchen"
              className="p-4 rounded-[var(--r-card)] bg-[var(--bg-raised)] border border-[var(--border)] hover:border-orange-500/50 hover:shadow-sm transition-all group flex items-start gap-3.5"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/40 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                <ChefHat className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[var(--text)] group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Kitchen Display System (KDS)
                  </h4>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Live order ticketing queue with audio bell, preparation countdowns, and table payment confirmation.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--bg-inset)] border border-[var(--border)] text-[var(--text-muted)]">
                    Allowed: Kitchen, Admin, Owner
                  </span>
                </div>
              </div>
            </Link>

            {/* Admin Management Dashboard */}
            <Link
              href="/admin"
              className="p-4 rounded-[var(--r-card)] bg-[var(--bg-raised)] border border-[var(--border)] hover:border-[var(--brand-primary)] hover:shadow-sm transition-all group flex items-start gap-3.5"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-[var(--brand-primary)] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--brand-primary)] transition-colors">
                    Admin Management Dashboard
                  </h4>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Daily sales reports, toggle 86&apos;d menu items, generate table QR codes, store settings, and staff control.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--bg-inset)] border border-[var(--border)] text-[var(--text-muted)]">
                    Allowed: Admin, Owner
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Development & Demo Role Switcher */}
        <div className="p-4 rounded-[var(--r-card)] bg-[var(--bg-raised)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text)]">
            <KeyRound className="w-4 h-4 text-[var(--accent)]" />
            Quick Role Switcher (Testing & Demo Mode)
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            In development and testing, you can instantly assign yourself any staff role below to verify the mobile views without needing multiple real phone accounts:
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant={status.role === "owner" ? "primary" : "secondary"}
              size="sm"
              disabled={switching}
              onClick={() => handleRoleSwitch("owner")}
              className="text-xs font-bold justify-center min-h-[44px]"
            >
              👑 Owner (Full Access)
            </Button>

            <Button
              variant={status.role === "admin" ? "primary" : "secondary"}
              size="sm"
              disabled={switching}
              onClick={() => handleRoleSwitch("admin")}
              className="text-xs font-bold justify-center min-h-[44px]"
            >
              🛡️ Admin (Manager)
            </Button>

            <Button
              variant={status.role === "kitchen" ? "primary" : "secondary"}
              size="sm"
              disabled={switching}
              onClick={() => handleRoleSwitch("kitchen")}
              className="text-xs font-bold justify-center min-h-[44px]"
            >
              🍳 Kitchen (Chef)
            </Button>

            <Button
              variant={!status.role ? "primary" : "secondary"}
              size="sm"
              disabled={switching}
              onClick={() => handleRoleSwitch("none")}
              className="text-xs font-medium justify-center text-[var(--text-muted)] min-h-[44px]"
            >
              👤 Customer (Normal)
            </Button>
          </div>
        </div>

        {/* How Staff Login Works (Instructional Guide) */}
        <div className="p-4 rounded-[var(--r-card)] bg-[var(--bg-inset)] border border-[var(--border)] space-y-3 text-xs">
          <h4 className="font-bold text-[var(--text)] flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[var(--brand-primary)]" />
            How Staff Login Works in Production
          </h4>
          <ol className="list-decimal pl-4 space-y-1.5 text-[var(--text-muted)]">
            <li>
              Staff members log in on their phones via Clerk with their verified mobile number.
            </li>
            <li>
              The server validates the phone number against <code className="text-[10px] bg-[var(--bg-raised)] px-1 py-0.5 rounded border border-[var(--border)]">public.staff_members</code>.
            </li>
            <li>
              Only registered phone numbers receive staff access. The owner can add new staff phone numbers in the Admin Dashboard.
            </li>
          </ol>

          <div className="pt-2 border-t border-[var(--border)]">
            <p className="font-semibold text-[var(--text)] mb-1 text-[11px]">Registered Seed Staff:</p>
            <div className="space-y-1 text-[11px] text-[var(--text-muted)]">
              <p>👑 <strong className="text-[var(--text)]">Owner:</strong> +91 98765 43210 (Full System Access)</p>
              <p>🛡️ <strong className="text-[var(--text)]">Admin:</strong> +91 98765 43211 (Orders, QR, 86 Items)</p>
              <p>🍳 <strong className="text-[var(--text)]">Kitchen:</strong> +91 98765 43212 (Live Kitchen Queue)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
