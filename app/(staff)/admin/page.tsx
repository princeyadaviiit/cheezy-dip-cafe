"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShoppingBag,
  Utensils,
  QrCode,
  Settings,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  BarChart3,
  Power,
  RotateCw,
  ExternalLink,
  TrendingUp,
  ChefHat,
  Volume2,
  VolumeX,
  Bell,
  MapPin,
  Flame,
  Lock,
  Unlock,
  PhoneCall,
  Clock,
  RefreshCw,
  Check,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { UserButton, Show, useUser, SignIn, SignOutButton } from "@clerk/nextjs";
import {
  getAllAdminOrders,
  getAdminMenuCatalog,
  toggleMenuItemAvailability,
  getCafeSettings,
  updateCafeSettings,
  getTablesList,
  rotateTableToken,
  getStaffList,
  addStaffMember,
  toggleStaffStatus,
  getCurrentStaffStatus,
  setDevStaffRole,
  claimAdminRoleForCurrentUser,
} from "@/services/admin-service";
import {
  transitionOrderStatus,
  markOrderPaidAtCounter,
} from "@/services/kitchen-service";
import {
  checkAdminGateStatus,
  submitAdminGatePasskey,
  lockAdminGateSession,
} from "@/services/admin-gate-actions";
import { getSalesReport, type SalesReportSummary } from "@/services/report-service";
import { type OrderRecord } from "@/lib/orders/order-store";
import { type OrderStatus, StatusBadge } from "@/components/ui/status-badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { BillModal } from "@/components/billing/bill-modal";

// Web Audio API chime generator for incoming orders
function playOrderAlertChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Pleasant ascending two-tone cafe bell (880Hz -> 1320Hz)
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.55);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  } catch {
    // Audio context may require user interaction
  }
}

export default function AdminPage() {
  // Clerk Auth State
  const { isSignedIn, user, isLoaded: isClerkLoaded } = useUser();
  const [isClaimingAdmin, setIsClaimingAdmin] = useState(false);

  // Gatekeeper state
  const [isGateUnlocked, setIsGateUnlocked] = useState<boolean | null>(null);
  const [gatePasskey, setGatePasskey] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);
  const [gateSubmitting, setGateSubmitting] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    "kitchen" | "orders" | "reports" | "menu" | "tables" | "staff" | "settings"
  >("kitchen");

  // Kitchen sub-filter
  const [kitchenFilter, setKitchenFilter] = useState<"incoming" | "cooking" | "ready" | "all">("incoming");

  // Core Data
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [menuItems, setMenuItems] = useState<
    Array<{ id: string; name: string; priceMinor: number; effectiveAvailable: boolean }>
  >([]);
  const [cafeSettings, setCafeSettings] = useState<{
    isOpen: boolean;
    deliveryEnabled: boolean;
    openingHours: string;
    deliveryFeeMinor: number;
  }>({
    isOpen: true,
    deliveryEnabled: true,
    openingHours: "10:00 AM - 11:00 PM",
    deliveryFeeMinor: 3000,
  });
  const [tables, setTables] = useState<
    Array<{ id: string; label: string; token: string; isActive: boolean }>
  >([]);
  const [staffList, setStaffList] = useState<
    Array<{ id: string; name: string; phone: string; email?: string; role: string; isActive: boolean }>
  >([]);
  const [salesReport, setSalesReport] = useState<SalesReportSummary | null>(null);
  const [reportTimeframe, setReportTimeframe] = useState<"today" | "week" | "month">("today");

  // Search & interaction states
  const [searchQuery, setSearchQuery] = useState("");
  const [rotatingTableId, setRotatingTableId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [currentStaff, setCurrentStaff] = useState<{
    role: string | null;
    phone: string | null;
    email: string | null;
    name: string | null;
  }>({ role: null, phone: null, email: null, name: null });

  // New order pop-up modal state
  const [newOrderAlert, setNewOrderAlert] = useState<OrderRecord | null>(null);
  const [billOrder, setBillOrder] = useState<OrderRecord | null>(null);
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(false);

  // New Staff Form
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<"kitchen" | "admin" | "owner">("kitchen");
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [staffStatusMsg, setStaffStatusMsg] = useState<string | null>(null);

  // Check Gatekeeper Status on mount
  useEffect(() => {
    checkAdminGateStatus().then((unlocked) => {
      setIsGateUnlocked(unlocked);
    });
  }, []);

  const handleUnlockGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatePasskey.trim()) {
      setGateError("Please enter the admin entrance passkey.");
      return;
    }
    setGateSubmitting(true);
    setGateError(null);

    try {
      const res = await submitAdminGatePasskey(gatePasskey);
      if (res.success) {
        setIsGateUnlocked(true);
      } else {
        setGateError(res.error || "Incorrect passkey. Please try again.");
      }
    } catch {
      setGateError("Verification failed. Please try again.");
    } finally {
      setGateSubmitting(false);
    }
  };

  const handleLockGate = async () => {
    await lockAdminGateSession();
    setIsGateUnlocked(false);
    setGatePasskey("");
  };

  const handleClaimAdmin = async () => {
    setIsClaimingAdmin(true);
    try {
      await claimAdminRoleForCurrentUser();
      await fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to activate admin status");
    } finally {
      setIsClaimingAdmin(false);
    }
  };

  // Data fetching function
  const fetchData = async () => {
    try {
      const [ords, menu, sett, tbls, staff, report, currentStatus] = await Promise.all([
        getAllAdminOrders(),
        getAdminMenuCatalog(),
        getCafeSettings(),
        getTablesList(),
        getStaffList(),
        getSalesReport(reportTimeframe),
        getCurrentStaffStatus(),
      ]);

      setOrders(ords);
      setMenuItems(menu);
      setCafeSettings(sett);
      setTables(tbls);
      setStaffList(staff);
      setSalesReport(report);
      setCurrentStaff({
        role: currentStatus.role,
        phone: currentStatus.phone,
        email: currentStatus.email,
        name: currentStatus.name,
      });
      setAuthError(null);

      // Check for newly arrived "placed" orders to trigger popup modal & chime
      if (initialLoadRef.current) {
        const brandNewPlaced = ords.find(
          (o) => o.orderStatus === "placed" && !seenOrderIdsRef.current.has(o.id)
        );
        if (brandNewPlaced) {
          if (soundEnabled) {
            playOrderAlertChime();
          }
          setNewOrderAlert(brandNewPlaced);
        }
      } else {
        initialLoadRef.current = true;
      }

      // Track all current order IDs
      ords.forEach((o) => seenOrderIdsRef.current.add(o.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Access restricted";
      if (msg.includes("FORBIDDEN") || msg.includes("UNAUTHORIZED")) {
        setAuthError(msg);
      }
    }
  };

  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  });

  // Initial and recurring poll every 4 seconds
  useEffect(() => {
    if (!isGateUnlocked || !isSignedIn) return;
    let active = true;

    const timer = setTimeout(() => {
      if (active) {
        fetchDataRef.current();
      }
    }, 0);

    const interval = setInterval(() => {
      if (active) {
        setCurrentTime(Date.now());
        fetchDataRef.current();
      }
    }, 4000);

    return () => {
      active = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isGateUnlocked, isSignedIn]);

  // Handle Order Status Transition (Approve, Cook, Ready, Deliver)
  const handleTransition = async (orderId: string, toStatus: OrderStatus) => {
    try {
      const updated = await transitionOrderStatus(orderId, toStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (newOrderAlert?.id === orderId) {
        setNewOrderAlert(null);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to transition order");
    }
  };

  // Handle Table Token Rotation
  const handleRotateToken = async (tableId: string) => {
    setRotatingTableId(tableId);
    try {
      const newToken = await rotateTableToken(tableId);
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, token: newToken } : t))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to rotate token");
    } finally {
      setRotatingTableId(null);
    }
  };

  // Handle Mark Paid at Counter
  const handleMarkPaid = async (orderId: string) => {
    try {
      const updated = await markOrderPaidAtCounter(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to mark paid");
    }
  };

  // Handle Add Staff Member
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffPhone.trim()) {
      setStaffStatusMsg("Please enter both staff name and phone number.");
      return;
    }

    setIsAddingStaff(true);
    setStaffStatusMsg(null);
    try {
      const added = await addStaffMember({
        name: newStaffName.trim(),
        phone: newStaffPhone.trim(),
        email: newStaffEmail.trim() || undefined,
        role: newStaffRole,
      });
      setStaffList((prev) => [...prev, added]);
      setNewStaffName("");
      setNewStaffPhone("");
      setNewStaffEmail("");
      setStaffStatusMsg(`Staff member ${added.name} successfully registered as ${added.role}!`);
    } catch (err: unknown) {
      setStaffStatusMsg(err instanceof Error ? err.message : "Failed to add staff member.");
    } finally {
      setIsAddingStaff(false);
    }
  };

  // Handle Staff Active Toggle
  const handleToggleStaff = async (staffId: string) => {
    try {
      const isNowActive = await toggleStaffStatus(staffId);
      setStaffList((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, isActive: isNowActive } : s))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update staff status");
    }
  };

  // 1. If Gatekeeper or Clerk status is still loading
  if (isGateUnlocked === null || !isClerkLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
        <div className="w-9 h-9 border-3 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 2. STAGE 1: GATEKEEPER SCREEN (Master Passkey Required)
  if (!isGateUnlocked) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm bg-[var(--bg-raised)] border border-[var(--border)] rounded-2xl p-6 shadow-xl space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg font-extrabold font-display text-[var(--text)]">
              Admin & Operations Gate
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Enter the master cafe passkey to unlock the admin subdomain and operations portal.
            </p>
          </div>

          {gateError && (
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/40 border border-red-500/40 text-xs text-red-700 dark:text-red-300 text-left flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{gateError}</span>
            </div>
          )}

          <form onSubmit={handleUnlockGate} className="space-y-3">
            <input
              type="password"
              placeholder="Enter Admin Master Passkey"
              value={gatePasskey}
              onChange={(e) => setGatePasskey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--brand-primary)] text-center tracking-wider min-h-[44px]"
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              disabled={gateSubmitting}
              className="w-full min-h-[44px] font-bold text-sm cursor-pointer"
            >
              {gateSubmitting ? "Verifying..." : "Unlock Admin Portal"}
            </Button>
          </form>

          <p className="text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
            One-time master gate authorization persists for 30 days on this browser.
          </p>
        </div>
      </div>
    );
  }

  // 3. STAGE 2: CLERK AUTHENTICATION (Gate is Unlocked, but User is NOT Signed in to Clerk)
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm bg-[var(--bg-raised)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Unlock className="w-6 h-6" />
            </div>
            <span className="inline-block text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Gate Passkey Verified
            </span>
            <h1 className="text-lg font-extrabold font-display text-[var(--text)]">
              Staff & Admin Login
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Log in to your admin account or sign up to manage cafe operations, orders, and kitchen.
            </p>
          </div>

          <div className="w-full flex justify-center">
            <SignIn
              routing="hash"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none border-0 p-0 text-[var(--text)] w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary:
                    "bg-[var(--brand-primary)] hover:opacity-90 text-white font-bold text-xs py-2.5 rounded-xl min-h-[44px] w-full",
                  formFieldInput:
                    "rounded-xl bg-[var(--bg-inset)] border border-[var(--border)] text-[var(--text)] min-h-[44px]",
                  footerActionLink: "text-[var(--brand-primary)] hover:underline font-semibold text-xs",
                },
              }}
            />
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <button
              type="button"
              onClick={handleLockGate}
              className="text-xs font-semibold text-[var(--text-muted)] hover:text-red-500 flex items-center gap-1 cursor-pointer min-h-[44px] px-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Gate</span>
            </button>
            <span className="text-[11px] text-[var(--text-muted)]">
              Admin Subdomain
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 4. STAGE 3: STAFF ROLE ACTIVATION (Signed in with Clerk, Passkey Verified, but Account Not Linked to Staff)
  if (!currentStaff.role && !authError) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm bg-[var(--bg-raised)] border border-[var(--border)] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-extrabold font-display text-[var(--text)]">
              Activate Admin Account
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Signed in as <strong className="text-[var(--text)]">{user?.primaryEmailAddress?.emailAddress || user?.fullName || "Staff Member"}</strong>.
            </p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Your Master Gate passkey is verified. Activate this Clerk account to access live orders, kitchen display, and cafe management.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleClaimAdmin}
            disabled={isClaimingAdmin}
            className="w-full min-h-[44px] font-bold text-sm cursor-pointer"
          >
            {isClaimingAdmin ? "Activating Admin..." : "👑 Activate as Cafe Admin"}
          </Button>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
            <SignOutButton>
              <button
                type="button"
                className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] min-h-[44px] px-2 cursor-pointer"
              >
                Sign Out / Switch
              </button>
            </SignOutButton>
            <button
              type="button"
              onClick={handleLockGate}
              className="text-xs font-semibold text-red-500 hover:underline min-h-[44px] px-2 cursor-pointer"
            >
              Lock Gate
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered orders for Kitchen KDS
  const kitchenOrders = orders.filter((o) => {
    if (kitchenFilter === "incoming") return o.orderStatus === "placed";
    if (kitchenFilter === "cooking") return o.orderStatus === "accepted" || o.orderStatus === "preparing";
    if (kitchenFilter === "ready") return o.orderStatus === "ready";
    return o.orderStatus !== "cancelled" && o.orderStatus !== "rejected";
  });

  // Filtered menu items for Menu 86s
  const filteredMenu = menuItems.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Staff summary counters
  const totalAdmins = staffList.filter((s) => s.role === "admin" || s.role === "owner").length;
  const totalKitchen = staffList.filter((s) => s.role === "kitchen").length;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] px-3 py-3 max-w-md mx-auto w-full pb-28 space-y-3 font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] text-[var(--text-on-brand)] flex items-center justify-center font-bold shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-[var(--text)] font-display">
                Cheezy Dip Cafe
              </h1>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30">
                Admin & KDS
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              {currentStaff.name || "Master Dashboard"} • {currentStaff.role || "Staff"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Audio Chime Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playOrderAlertChime();
            }}
            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
              soundEnabled
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-[var(--bg-raised)] border-[var(--border)] text-[var(--text-muted)]"
            }`}
            title={soundEnabled ? "Order sound alerts active" : "Order sound alerts muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ThemeToggle size="sm" />
          </div>

          {/* Clerk Profile */}
          <Show when="signed-in">
            <div className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full border border-[var(--border)]",
                  },
                }}
              />
            </div>
          </Show>

          {/* Lock Gate */}
          <button
            type="button"
            onClick={handleLockGate}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text-muted)] hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
            title="Lock Admin Portal"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Access Error Banner / Dev Role Switcher */}
      {authError && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-500/50 rounded-2xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100">
                Staff Authentication Notice
              </h3>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                Your current Clerk session is not yet mapped to an active Admin role. You can switch to Admin testing mode below or verify staff credentials in the Staff tab.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                await setDevStaffRole("admin");
                fetchData();
              }}
            >
              Enable Admin Mode
            </Button>
            <Link href="/sign-in?redirect_url=/admin">
              <Button variant="outline" size="sm">
                Sign In With Staff Account
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <nav className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--border)]">
        {[
          { key: "kitchen", label: "🍳 Kitchen KDS", count: orders.filter((o) => o.orderStatus === "placed").length },
          { key: "orders", label: "🛍️ All Orders", count: orders.length },
          { key: "staff", label: `👥 Staff (${totalAdmins + totalKitchen})` },
          { key: "menu", label: "🍽️ Menu 86s" },
          { key: "tables", label: "🏷️ Table QRs" },
          { key: "reports", label: "📊 Sales" },
          { key: "settings", label: "⚙️ Settings" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px] ${
                isActive
                  ? "bg-[var(--brand-primary)] text-[var(--text-on-brand)] shadow-sm"
                  : "bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive
                      ? "bg-white text-[var(--brand-primary)]"
                      : "bg-[var(--accent)] text-white"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ======================================================== */}
      {/* 1. KITCHEN KDS TAB (Integrated Kitchen Display System)   */}
      {/* ======================================================== */}
      {activeTab === "kitchen" && (
        <section className="space-y-3">
          {/* Sub-status filters */}
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1 bg-[var(--bg-inset)] p-1 rounded-xl border border-[var(--border)]">
              {[
                { key: "incoming", label: "Incoming", count: orders.filter((o) => o.orderStatus === "placed").length },
                { key: "cooking", label: "In Prep", count: orders.filter((o) => o.orderStatus === "accepted" || o.orderStatus === "preparing").length },
                { key: "ready", label: "Ready", count: orders.filter((o) => o.orderStatus === "ready").length },
                { key: "all", label: "All Active" },
              ].map((sub) => (
                <button
                  key={sub.key}
                  type="button"
                  onClick={() => setKitchenFilter(sub.key as typeof kitchenFilter)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 min-h-[44px] cursor-pointer ${
                    kitchenFilter === sub.key
                      ? "bg-[var(--bg-raised)] text-[var(--text)] shadow-xs border border-[var(--border)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  <span>{sub.label}</span>
                  {sub.count !== undefined && sub.count > 0 && (
                    <span className="text-[10px] px-1 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full font-bold">
                      {sub.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="text-xs h-11 min-h-[44px] px-3 flex items-center gap-1 text-[var(--text-muted)] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Kitchen Orders Cards Queue */}
          {kitchenOrders.length === 0 ? (
            <div className="p-12 text-center bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] space-y-2">
              <ChefHat className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-60" />
              <p className="text-sm font-bold text-[var(--text)]">No orders in this queue</p>
              <p className="text-xs text-[var(--text-muted)]">
                Incoming orders will appear here automatically with realtime sound alert.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {kitchenOrders.map((order) => {
                const elapsedMin = Math.floor(
                  (currentTime - new Date(order.placedAt).getTime()) / 60000
                );
                const deliverySnap = order.deliveryAddressSnapshot as
                  | {
                      recipientName?: string;
                      phone?: string;
                      line1?: string;
                      area?: string;
                      pincode?: string;
                      googleMapsUrl?: string;
                      latitude?: number;
                      longitude?: number;
                    }
                  | undefined;

                const mapsUrl =
                  deliverySnap?.googleMapsUrl ||
                  (deliverySnap?.latitude && deliverySnap?.longitude
                    ? `https://www.google.com/maps?q=${deliverySnap.latitude},${deliverySnap.longitude}`
                    : deliverySnap?.line1
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${deliverySnap.line1}, ${deliverySnap.area || ""} ${deliverySnap.pincode || ""}`
                      )}`
                    : null);

                return (
                  <div
                    key={order.id}
                    className={`p-4 bg-[var(--bg-raised)] rounded-2xl border transition-all space-y-3 shadow-xs ${
                      order.orderStatus === "placed"
                        ? "border-amber-500/60 ring-2 ring-amber-500/20 bg-amber-50/10 dark:bg-amber-950/10"
                        : "border-[var(--border)]"
                    }`}
                  >
                    {/* Header: Number, Elapsed Time, Type Badge */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-[var(--text)]">
                            {order.orderNumber}
                          </h3>
                          <StatusBadge status={order.orderStatus} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{elapsedMin}m ago</span>
                          <span>•</span>
                          <span className="font-semibold text-[var(--text)]">
                            {order.orderType === "dine_in"
                              ? `Dine-In (${order.tableLabel || "Table"})`
                              : "Delivery"}
                          </span>
                        </div>
                      </div>

                      {/* Payment State */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {order.paymentStatus === "paid"
                          ? "✓ Paid"
                          : order.orderType === "dine_in"
                          ? "Pay at Counter"
                          : "Prepaid Pending"}
                      </span>
                    </div>

                    {/* Customer & Location Info (With Mobile & Google Maps GPS Button) */}
                    <div className="p-3 bg-[var(--bg-inset)] rounded-xl border border-[var(--border)] text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${order.contactPhone || deliverySnap?.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold hover:bg-[var(--brand-primary)]/20 transition-colors min-h-[44px]"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>{order.contactPhone || deliverySnap?.phone || "Customer Call"}</span>
                          </a>
                          {deliverySnap?.recipientName && (
                            <span className="text-[var(--text)] font-medium">
                              ({deliverySnap.recipientName})
                            </span>
                          )}
                        </div>

                        {order.orderType === "delivery" && mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-2xs min-h-[44px]"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>🗺️ Open in Google Maps</span>
                          </a>
                        )}
                      </div>

                      {order.orderType === "delivery" && deliverySnap && (
                        <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                          📍 {deliverySnap.line1}, {deliverySnap.area} - {deliverySnap.pincode}
                        </p>
                      )}
                    </div>

                    {/* Order Items Breakdown */}
                    <div className="divide-y divide-[var(--border)]/60 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-1.5 flex justify-between items-start">
                          <div>
                            <span className="font-bold text-sm text-[var(--text)] mr-2">
                              {item.quantity}x
                            </span>
                            <span className="font-semibold text-[var(--text)]">
                              {item.nameSnapshot}
                            </span>
                            {item.modifiersSnapshot && item.modifiersSnapshot.length > 0 && (
                              <p className="text-[11px] text-[var(--text-muted)] ml-6">
                                {item.modifiersSnapshot.map((m) => m.label).join(", ")}
                              </p>
                            )}
                            {item.note && (
                              <p className="text-[11px] text-[var(--brand-primary)] italic ml-6">
                                Note: &quot;{item.note}&quot;
                              </p>
                            )}
                          </div>
                          <span className="text-[var(--text-muted)] shrink-0 font-medium">
                            ₹{Math.round(item.lineTotalMinor / 100)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.customerNote && (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
                        <strong>Kitchen Special:</strong> {order.customerNote}
                      </div>
                    )}

                    {/* Transition Actions */}
                    <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-bold text-[var(--text)]">
                        Total: ₹{Math.round(order.totalMinor / 100)}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {order.orderStatus === "placed" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleTransition(order.id, "preparing")}
                            className="font-bold text-xs min-h-[44px] px-3.5"
                          >
                            <Flame className="w-3.5 h-3.5 mr-1" />
                            Approve & Cook
                          </Button>
                        )}

                        {order.orderStatus === "preparing" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleTransition(order.id, "ready")}
                            className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 min-h-[44px] px-3.5"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Mark Ready
                          </Button>
                        )}

                        {order.orderStatus === "ready" && order.orderType === "dine_in" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleTransition(order.id, "served")}
                            className="font-bold text-xs min-h-[44px] px-3.5"
                          >
                            Serve to Table
                          </Button>
                        )}

                        {order.orderStatus === "ready" && order.orderType === "delivery" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleTransition(order.id, "out_for_delivery")}
                            className="font-bold text-xs min-h-[44px] px-3.5"
                          >
                            Out for Delivery
                          </Button>
                        )}

                        {order.orderStatus === "out_for_delivery" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleTransition(order.id, "delivered")}
                            className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 min-h-[44px] px-3.5"
                          >
                            Mark Delivered
                          </Button>
                        )}

                        {order.orderType === "dine_in" && order.paymentStatus !== "paid" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkPaid(order.id)}
                            className="text-xs font-bold text-emerald-600 border-emerald-500/30 min-h-[44px] px-3"
                          >
                            Mark Paid at Counter
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBillOrder(order)}
                          className="text-xs font-bold min-h-[44px] px-3 flex items-center gap-1 cursor-pointer text-[var(--text-muted)] hover:text-[var(--text)] border-[var(--border)]"
                          title="Print / View Bill & Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Bill</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ======================================================== */}
      {/* 2. ALL ORDERS TAB (Full History, Search, Filters)       */}
      {/* ======================================================== */}
      {activeTab === "orders" && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search by order #, phone, table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg-raised)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-[var(--brand-primary)] min-h-[44px]"
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} className="min-h-[44px] px-3">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2.5">
            {orders
              .filter(
                (o) =>
                  o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  o.contactPhone?.includes(searchQuery) ||
                  o.tableLabel?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[var(--text)]">
                          {order.orderNumber}
                        </span>
                        <StatusBadge status={order.orderStatus} />
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {order.orderType === "dine_in"
                          ? `Dine-in • ${order.tableLabel || "Table"}`
                          : "Delivery"}{" "}
                        • {new Date(order.placedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <span className="font-extrabold text-sm text-[var(--brand-primary)]">
                      ₹{Math.round(order.totalMinor / 100)}
                    </span>
                  </div>

                  <div className="text-[11px] text-[var(--text-muted)]">
                    {order.items.map((i) => `${i.quantity}x ${i.nameSnapshot}`).join(", ")}
                  </div>

                  <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} items • {order.paymentStatus === "paid" ? "✓ Paid" : "Payment Pending"}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBillOrder(order)}
                      className="text-xs font-bold min-h-[44px] px-3 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                      <span>Print Bill</span>
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 3. STAFF & ADMINS TAB                                    */}
      {/* ======================================================== */}
      {activeTab === "staff" && (
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)]">
              <p className="text-[11px] text-[var(--text-muted)] font-medium">Registered Admins</p>
              <p className="text-xl font-extrabold text-[var(--text)] mt-0.5">{totalAdmins}</p>
            </div>
            <div className="p-3.5 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)]">
              <p className="text-[11px] text-[var(--text-muted)] font-medium">Kitchen Staff</p>
              <p className="text-xl font-extrabold text-[var(--text)] mt-0.5">{totalKitchen}</p>
            </div>
          </div>

          {/* Add Staff Form */}
          <div className="p-4 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] space-y-3">
            <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[var(--brand-primary)]" />
              Add New Staff / Admin Member
            </h3>

            {staffStatusMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300">
                {staffStatusMsg}
              </div>
            )}

            <form onSubmit={handleAddStaff} className="space-y-2.5 text-xs">
              <input
                type="text"
                placeholder="Full Name (e.g. Rahul Sharma)"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--text-muted)]/60 min-h-[44px]"
                required
              />
              <input
                type="tel"
                placeholder="Mobile Number (+919876543210)"
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--text-muted)]/60 min-h-[44px]"
                required
              />
              <input
                type="email"
                placeholder="Email for Clerk Login (e.g. admin@cheezydipcafe.com)"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--text-muted)]/60 min-h-[44px]"
              />
              <div className="flex gap-2">
                <select
                  value={newStaffRole}
                  onChange={(e) =>
                    setNewStaffRole(e.target.value as "kitchen" | "admin" | "owner")
                  }
                  className="flex-1 px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-[var(--text)] min-h-[44px]"
                >
                  <option value="kitchen">🍳 Kitchen Staff</option>
                  <option value="admin">🛡️ Admin Manager</option>
                  <option value="owner">👑 Owner / Proprietor</option>
                </select>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isAddingStaff}
                  className="min-h-[44px] px-4 font-bold"
                >
                  {isAddingStaff ? "Adding..." : "+ Add Staff"}
                </Button>
              </div>
            </form>
          </div>

          {/* Current Staff List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[var(--text)]">All Registered Staff</h3>
            <div className="divide-y divide-[var(--border)] bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] overflow-hidden">
              {staffList.map((member) => (
                <div key={member.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text)]">{member.name}</span>
                      <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-[var(--bg-inset)] border border-[var(--border)] text-[var(--text-muted)]">
                        {member.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5 space-y-0.5">
                      <p>Phone: {member.phone}</p>
                      {member.email && <p>Email: {member.email}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStaff(member.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[44px] ${
                        member.isActive
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                          : "bg-stone-500/10 text-stone-500 border border-stone-500/30"
                      }`}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 4. MENU 86s TAB                                          */}
      {/* ======================================================== */}
      {activeTab === "menu" && (
        <section className="space-y-3">
          <input
            type="text"
            placeholder="Search menu item to toggle availability..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[var(--bg-raised)] border border-[var(--border)] rounded-xl text-[var(--text)] min-h-[44px]"
          />

          <div className="divide-y divide-[var(--border)] bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] overflow-hidden">
            {filteredMenu.map((item) => (
              <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[var(--text)]">{item.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">₹{Math.round(item.priceMinor / 100)}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await toggleMenuItemAvailability(item.id, !item.effectiveAvailable);
                    setMenuItems((prev) =>
                      prev.map((i) => (i.id === item.id ? { ...i, effectiveAvailable: res.isAvailable } : i))
                    );
                  }}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer min-h-[44px] ${
                    item.effectiveAvailable
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30"
                  }`}
                >
                  {item.effectiveAvailable ? "In Stock" : "86'd (Sold Out)"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 5. TABLE QRS TAB                                         */}
      {/* ======================================================== */}
      {activeTab === "tables" && (
        <section className="space-y-3">
          <div className="p-3 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] text-xs text-[var(--text-muted)]">
            Permanent QR table tokens are signed cryptographically. Rotate token if table stickers are compromised.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {tables.map((table) => (
              <div key={table.id} className="p-3.5 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[var(--text)]">{table.label}</h4>
                  <QrCode className="w-4 h-4 text-[var(--brand-primary)]" />
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-mono truncate">
                  {table.token}
                </p>
                <div className="pt-1 flex gap-2">
                  <Link
                    href={`/t/${table.token}`}
                    target="_blank"
                    className="flex-1 text-center py-2.5 rounded-xl bg-[var(--bg-inset)] border border-[var(--border)] text-xs font-bold text-[var(--brand-primary)] hover:underline min-h-[44px] flex items-center justify-center cursor-pointer"
                  >
                    Open Link →
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRotateToken(table.id)}
                    disabled={rotatingTableId === table.id}
                    className="px-3 min-w-[44px] min-h-[44px] rounded-xl cursor-pointer"
                    title="Rotate QR Token"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${rotatingTableId === table.id ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 6. REPORTS TAB                                           */}
      {/* ======================================================== */}
      {activeTab === "reports" && salesReport && (
        <section className="space-y-3">
          <div className="flex gap-2">
            {(["today", "week", "month"] as const).map((tf) => (
              <Button
                key={tf}
                variant={reportTimeframe === tf ? "primary" : "outline"}
                size="sm"
                onClick={() => setReportTimeframe(tf)}
                className="flex-1 capitalize text-xs min-h-[44px] font-bold cursor-pointer"
              >
                {tf}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] text-center">
              <p className="text-[10px] text-[var(--text-muted)] font-medium">Net Sales</p>
              <p className="text-base font-extrabold text-[var(--brand-primary)] mt-0.5">
                ₹{Math.round(salesReport.grossSalesMinor / 100)}
              </p>
            </div>
            <div className="p-3 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] text-center">
              <p className="text-[10px] text-[var(--text-muted)] font-medium">Orders</p>
              <p className="text-base font-extrabold text-[var(--text)] mt-0.5">
                {salesReport.totalOrdersCount}
              </p>
            </div>
            <div className="p-3 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] text-center">
              <p className="text-[10px] text-[var(--text-muted)] font-medium">Avg Order</p>
              <p className="text-base font-extrabold text-[var(--text)] mt-0.5">
                ₹{Math.round(salesReport.averageOrderValueMinor / 100)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 7. SETTINGS TAB                                          */}
      {/* ======================================================== */}
      {activeTab === "settings" && (
        <section className="space-y-3">
          <div className="p-4 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[var(--text)]">Cafe Store Status</p>
                <p className="text-[11px] text-[var(--text-muted)]">Accept dine-in & online orders</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const updated = await updateCafeSettings({ isOpen: !cafeSettings.isOpen });
                  setCafeSettings((prev) => ({ ...prev, isOpen: updated.isOpen }));
                }}
                className={`px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer min-h-[44px] ${
                  cafeSettings.isOpen
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30"
                }`}
              >
                {cafeSettings.isOpen ? "Open" : "Closed"}
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <div>
                <p className="font-bold text-[var(--text)]">Delivery Orders</p>
                <p className="text-[11px] text-[var(--text-muted)]">Enable / disable delivery checkout</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const updated = await updateCafeSettings({ deliveryEnabled: !cafeSettings.deliveryEnabled });
                  setCafeSettings((prev) => ({ ...prev, deliveryEnabled: updated.deliveryEnabled }));
                }}
                className={`px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer min-h-[44px] ${
                  cafeSettings.deliveryEnabled
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30"
                }`}
              >
                {cafeSettings.deliveryEnabled ? "Active" : "Paused"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* REAL-TIME NEW ORDER MODAL ALERT (Screen Pop-up)          */}
      {/* ======================================================== */}
      {newOrderAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm sm:max-w-md bg-[var(--bg-raised)] border-2 border-[var(--brand-primary)] rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 duration-200">
            {/* Pop-up Header */}
            <div className="flex items-start justify-between pb-2.5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black animate-pulse">
                  <Bell className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-[var(--text)] font-display">
                    🚨 NEW ORDER RECEIVED!
                  </h2>
                  <p className="text-xs text-[var(--brand-primary)] font-bold">
                    Order #{newOrderAlert.orderNumber}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNewOrderAlert(null)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[var(--bg-inset)] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Type & Table / Location Breakdown */}
            <div className="p-3 bg-[var(--bg-inset)] rounded-2xl border border-[var(--border)] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text)]">
                  {newOrderAlert.orderType === "dine_in"
                    ? `🍽️ Dine-In • ${newOrderAlert.tableLabel || "Table"}`
                    : "🛵 Home Delivery"}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  ₹{Math.round(newOrderAlert.totalMinor / 100)}
                </span>
              </div>

              {/* Customer Phone & Google Maps GPS */}
              <div className="pt-2 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={`tel:${newOrderAlert.contactPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold hover:bg-[var(--brand-primary)]/25 min-h-[44px]"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{newOrderAlert.contactPhone}</span>
                </a>

                {newOrderAlert.orderType === "delivery" &&
                  (newOrderAlert.deliveryAddressSnapshot as { googleMapsUrl?: string })?.googleMapsUrl && (
                    <a
                      href={(newOrderAlert.deliveryAddressSnapshot as { googleMapsUrl?: string }).googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 min-h-[44px]"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>🗺️ Open in Google Maps</span>
                    </a>
                  )}
              </div>
            </div>

            {/* Items List */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs pr-1">
              <p className="font-bold text-[var(--text)] text-xs">Order Items:</p>
              {newOrderAlert.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-[var(--text)]">
                  <div>
                    <span className="font-bold mr-1.5 text-[var(--brand-primary)]">
                      {item.quantity}x
                    </span>
                    <span className="font-semibold">{item.nameSnapshot}</span>
                    {item.modifiersSnapshot && item.modifiersSnapshot.length > 0 && (
                      <p className="text-[11px] text-[var(--text-muted)] ml-5">
                        {item.modifiersSnapshot.map((m) => m.label).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="font-medium shrink-0">
                    ₹{Math.round(item.lineTotalMinor / 100)}
                  </span>
                </div>
              ))}
            </div>

            {/* Approval Action */}
            <div className="pt-2 flex gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setNewOrderAlert(null)}
                className="flex-1 text-xs font-bold min-h-[44px] cursor-pointer"
              >
                Review in KDS
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleTransition(newOrderAlert.id, "preparing")}
                className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 min-h-[48px] cursor-pointer"
              >
                <Check className="w-4 h-4 mr-1" />
                Approve & Cook
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bill & Receipt Modal */}
      {billOrder && (
        <BillModal
          order={billOrder}
          isOpen={Boolean(billOrder)}
          onClose={() => setBillOrder(null)}
        />
      )}
    </div>
  );
}
