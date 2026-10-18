"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  getAllAdminOrders,
  getAdminMenuCatalog,
  toggleMenuItemAvailability,
  getCafeSettings,
  updateCafeSettings,
  getTablesList,
  rotateTableToken,
  getStaffList,
} from "@/services/admin-service";
import { markOrderPaidAtCounter } from "@/services/kitchen-service";
import { getSalesReport, type SalesReportSummary } from "@/services/report-service";
import { type OrderRecord } from "@/lib/orders/order-store";
import { StatusBadge } from "@/components/ui/status-badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "reports" | "menu" | "tables" | "settings" | "staff">("orders");
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
    Array<{ id: string; name: string; phone: string; role: string; isActive: boolean }>
  >([]);
  const [salesReport, setSalesReport] = useState<SalesReportSummary | null>(null);
  const [reportTimeframe, setReportTimeframe] = useState<"today" | "week" | "month">("today");

  const [searchQuery, setSearchQuery] = useState("");
  const [rotatingTableId, setRotatingTableId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const [ords, menu, sett, tbls, staff, report] = await Promise.all([
          getAllAdminOrders(),
          getAdminMenuCatalog(),
          getCafeSettings(),
          getTablesList(),
          getStaffList(),
          getSalesReport(reportTimeframe),
        ]);
        if (active) {
          setOrders(ords);
          setMenuItems(menu);
          setCafeSettings(sett);
          setTables(tbls);
          setStaffList(staff);
          setSalesReport(report);
        }
      } catch {
        // Ignored
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 6000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [reportTimeframe]);

  // Handle menu toggle
  const handleToggleMenu = async (itemId: string, current: boolean) => {
    try {
      await toggleMenuItemAvailability(itemId, !current);
      setMenuItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, effectiveAvailable: !current } : i))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to toggle");
    }
  };

  // Handle cafe open/close toggle
  const handleToggleCafeOpen = async () => {
    try {
      const next = !cafeSettings.isOpen;
      await updateCafeSettings({ isOpen: next });
      setCafeSettings((prev) => ({ ...prev, isOpen: next }));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update settings");
    }
  };

  // Handle delivery toggle
  const handleToggleDelivery = async () => {
    try {
      const next = !cafeSettings.deliveryEnabled;
      await updateCafeSettings({ deliveryEnabled: next });
      setCafeSettings((prev) => ({ ...prev, deliveryEnabled: next }));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update settings");
    }
  };

  // Handle table token rotation
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

  // Handle mark paid
  const handleMarkPaid = async (orderId: string) => {
    try {
      const updated = await markOrderPaidAtCounter(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to mark paid");
    }
  };

  // Filtered menu items
  const filteredMenu = menuItems.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-3 max-w-lg mx-auto w-full pb-20 space-y-3 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] text-[var(--text-on-brand)] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-[var(--text)]">Cafe Admin</h1>
            <p className="text-[11px] text-[var(--text-muted)]">Operations & Controls</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <Link
            href="/kitchen"
            className="text-xs font-bold text-[var(--brand-primary)] hover:underline px-3 py-1.5 rounded-lg bg-[var(--bg-raised)] border border-[var(--border)] shadow-xs"
          >
            Kitchen View →
          </Link>
        </div>
      </header>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1 text-xs font-bold">
        {[
          { id: "orders", label: "Orders", icon: ShoppingBag, count: orders.length },
          { id: "reports", label: "Sales & Reports", icon: BarChart3 },
          { id: "menu", label: "Menu", icon: Utensils, count: menuItems.length },
          { id: "tables", label: "Tables & QR", icon: QrCode, count: tables.length },
          { id: "settings", label: "Settings", icon: Settings },
          { id: "staff", label: "Staff", icon: Users, count: staffList.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`shrink-0 px-3 py-2 rounded-xl border min-h-[44px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSelected
                  ? "bg-[var(--brand-primary)] text-[var(--text-on-brand)] border-[var(--brand-primary)] shadow-xs"
                  : "bg-[var(--bg-raised)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] font-black opacity-80">({tab.count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-3 pt-1">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-3.5 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border)] space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--text)]">
                    {ord.orderNumber}
                  </span>
                  <span className="text-xs text-[var(--brand-primary)] font-semibold">
                    {ord.tableLabel || "Delivery"}
                  </span>
                </div>
                <StatusBadge status={ord.orderStatus} />
              </div>

              <div className="text-xs text-[var(--text-muted)] space-y-1">
                <p className="line-clamp-1 text-[var(--text)] font-medium">
                  {ord.items.map((i) => `${i.quantity}x ${i.nameSnapshot}`).join(", ")}
                </p>
                <div className="flex justify-between items-center pt-1 text-[11px] text-[var(--text-muted)]">
                  <span>Customer: {ord.contactPhone}</span>
                  <span className="font-bold text-[var(--text)] text-xs">
                    ₹{Math.round(ord.totalMinor / 100)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <div>
                  {ord.paymentStatus === "paid" ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkPaid(ord.id)}
                      className="px-2.5 py-1 rounded bg-[var(--bg-inset)] hover:bg-[var(--border)] text-[var(--brand-primary)] font-semibold text-[11px] border border-[var(--border)] cursor-pointer"
                    >
                      Mark Paid at Counter
                    </button>
                  )}
                </div>

                <Link
                  href={`/order/orders/${ord.id}`}
                  className="text-[var(--brand-primary)] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                >
                  Details <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: REPORTS */}
      {salesReport && activeTab === "reports" && (
        <div className="space-y-3 pt-1">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-raised)] rounded-xl border border-[var(--border)] text-xs font-bold shadow-xs">
            {(["today", "week", "month"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setReportTimeframe(t)}
                className={`flex-1 py-1.5 rounded-lg capitalize transition-colors min-h-[38px] cursor-pointer ${
                  reportTimeframe === t
                    ? "bg-[var(--brand-primary)] text-[var(--text-on-brand)] font-extrabold shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {t === "today" ? "Today" : t === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3.5 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border)] space-y-1 shadow-xs">
              <span className="text-[11px] text-[var(--text-muted)] font-semibold">Gross Revenue</span>
              <p className="text-xl font-black text-[var(--brand-primary)]">
                ₹{Math.round(salesReport.grossSalesMinor / 100)}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border)] space-y-1 shadow-xs">
              <span className="text-[11px] text-[var(--text-muted)] font-semibold">Total Orders</span>
              <p className="text-xl font-black text-[var(--text)]">
                {salesReport.totalOrdersCount}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border)] flex justify-between items-center text-xs shadow-xs">
            <span className="text-[var(--text-muted)]">Average Order Value (AOV)</span>
            <span className="font-extrabold text-[var(--text)] text-sm">
              ₹{Math.round(salesReport.averageOrderValueMinor / 100)}
            </span>
          </div>

          {/* Channel Split (Dine-in vs Delivery) */}
          <div className="p-4 bg-[var(--bg-raised)] border border-[var(--border)] rounded-2xl space-y-2 text-xs shadow-xs">
            <h4 className="font-bold text-[var(--text)] text-xs pb-1 border-b border-[var(--border)] flex items-center justify-between">
              <span>Channel Split</span>
              <TrendingUp className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            </h4>
            <div className="flex justify-between items-center text-[var(--text-muted)]">
              <span>🍽️ Dine-In ({salesReport.dineIn.ordersCount} orders)</span>
              <span className="font-bold text-[var(--text)]">₹{Math.round(salesReport.dineIn.revenueMinor / 100)}</span>
            </div>
            <div className="flex justify-between items-center text-[var(--text-muted)]">
              <span>🛵 Delivery ({salesReport.delivery.ordersCount} orders)</span>
              <span className="font-bold text-[var(--text)]">₹{Math.round(salesReport.delivery.revenueMinor / 100)}</span>
            </div>
          </div>

          {/* Top Selling Dishes */}
          <div className="p-4 bg-[var(--bg-raised)] border border-[var(--border)] rounded-2xl space-y-2.5 text-xs shadow-xs">
            <h4 className="font-bold text-[var(--text)] text-xs pb-1 border-b border-[var(--border)]">
              Top Selling Dishes
            </h4>
            {salesReport.topDishes.length > 0 ? (
              salesReport.topDishes.map((dish, idx) => (
                <div key={idx} className="flex justify-between items-center text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[var(--bg-inset)] text-[10px] font-bold text-[var(--brand-primary)] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-[var(--text)] truncate">{dish.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[var(--text-muted)]">{dish.quantity} sold</span>
                    <span className="font-bold text-[var(--brand-primary)]">₹{Math.round(dish.revenueMinor / 100)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[var(--text-muted)] text-center py-2">No completed orders yet in this timeframe.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MENU MANAGEMENT */}
      {activeTab === "menu" && (
        <div className="space-y-3 pt-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="search"
              placeholder="Filter menu items to toggle sold out..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[var(--bg-raised)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--brand-primary)] min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-[var(--bg-raised)] border border-[var(--border)] rounded-xl flex items-center justify-between shadow-xs"
              >
                <div>
                  <h4 className="text-xs font-bold text-[var(--text)]">{item.name}</h4>
                  <p className="text-[11px] text-[var(--brand-primary)] font-semibold">
                    ₹{Math.round(item.priceMinor / 100)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleMenu(item.id, item.effectiveAvailable)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[44px] flex items-center gap-1.5 border cursor-pointer ${
                    item.effectiveAvailable
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"
                  }`}
                >
                  {item.effectiveAvailable ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Available
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" /> Sold Out
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TABLES & QR */}
      {activeTab === "tables" && (
        <div className="space-y-3 pt-1">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-900 dark:text-amber-200">
            <p className="font-bold text-amber-800 dark:text-amber-300">Permanent Table QR Sessions</p>
            <p className="text-[11px] mt-0.5">
              Customers scan these QR codes to dine in. Rotating a token immediately invalidates old printed stickers.
            </p>
          </div>

          <div className="space-y-2">
            {tables.map((tbl) => (
              <div
                key={tbl.id}
                className="p-3.5 bg-[var(--bg-raised)] border border-[var(--border)] rounded-xl space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[var(--text)]">{tbl.label}</span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg-inset)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                      {tbl.token}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRotateToken(tbl.id)}
                    disabled={rotatingTableId === tbl.id}
                    className="text-xs text-[var(--brand-primary)] hover:underline flex items-center gap-1 min-h-[44px] px-2 font-semibold cursor-pointer"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${rotatingTableId === tbl.id ? "animate-spin" : ""}`} />
                    Rotate Token
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border)]">
                  <span className="text-[var(--text-muted)] text-[11px]">QR Scan URL: /t/{tbl.token}</span>
                  <Link
                    href={`/t/${tbl.token}`}
                    target="_blank"
                    className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                  >
                    Test Scan <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-3 pt-1">
          <div className="p-4 bg-[var(--bg-raised)] border border-[var(--border)] rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[var(--text)] border-b border-[var(--border)] pb-2">
              Cafe Operational Status
            </h3>

            {/* Open / Closed Switch */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[var(--text)]">Cafe Kitchen Open</p>
                <p className="text-[11px] text-[var(--text-muted)]">Accepting dine-in and online orders</p>
              </div>
              <button
                type="button"
                onClick={handleToggleCafeOpen}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border min-h-[44px] flex items-center gap-1.5 cursor-pointer ${
                  cafeSettings.isOpen
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black border-emerald-400 font-black"
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-500/40"
                }`}
              >
                <Power className="w-4 h-4" />
                {cafeSettings.isOpen ? "OPEN" : "CLOSED"}
              </button>
            </div>

            {/* Delivery Switch */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <div>
                <p className="text-xs font-bold text-[var(--text)]">Home Delivery</p>
                <p className="text-[11px] text-[var(--text-muted)]">Doorstep delivery via Razorpay</p>
              </div>
              <button
                type="button"
                onClick={handleToggleDelivery}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border min-h-[44px] flex items-center gap-1.5 cursor-pointer ${
                  cafeSettings.deliveryEnabled
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black border-emerald-400 font-black"
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-500/40"
                }`}
              >
                {cafeSettings.deliveryEnabled ? "ENABLED" : "DISABLED"}
              </button>
            </div>

            <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
              <p>Operating Hours: <span className="text-[var(--text)] font-semibold">{cafeSettings.openingHours}</span></p>
              <p>Standard Delivery Fee: <span className="text-[var(--text)] font-semibold">₹30</span></p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: STAFF */}
      {activeTab === "staff" && (
        <div className="space-y-3 pt-1">
          <div className="p-3 bg-[var(--bg-raised)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-muted)] shadow-xs">
            <p className="font-semibold text-[var(--text)]">Role-Based Access Control (RBAC)</p>
            <p className="text-[11px] mt-0.5">
              Staff roles are validated server-side from `staff_members`. Kitchen cannot access admin controls or delete staff.
            </p>
          </div>

          <div className="space-y-2">
            {staffList.map((st) => (
              <div
                key={st.id}
                className="p-3 bg-[var(--bg-raised)] border border-[var(--border)] rounded-xl flex items-center justify-between text-xs shadow-xs"
              >
                <div>
                  <h4 className="font-bold text-[var(--text)]">{st.name}</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">{st.phone}</p>
                </div>
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--brand-primary)] text-[var(--text-on-brand)]">
                  {st.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
