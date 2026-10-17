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
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-black text-white p-3 max-w-lg mx-auto w-full pb-20 space-y-3 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-[var(--accent)] text-black flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">Cafe Admin</h1>
            <p className="text-[11px] text-neutral-400">Operations & Controls</p>
          </div>
        </div>

        <Link href="/kitchen" className="text-xs font-bold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800">
          Kitchen View →
        </Link>
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
              className={`shrink-0 px-3 py-2 rounded-xl border min-h-[44px] flex items-center gap-1.5 transition-colors ${
                isSelected
                  ? "bg-[var(--accent)] text-black border-[var(--accent)]"
                  : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
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
              className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2"
            >
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {ord.orderNumber}
                  </span>
                  <span className="text-xs text-amber-400 font-semibold">
                    {ord.tableLabel || "Delivery"}
                  </span>
                </div>
                <StatusBadge status={ord.orderStatus} />
              </div>

              <div className="text-xs text-neutral-300 space-y-1">
                <p className="line-clamp-1">
                  {ord.items.map((i) => `${i.quantity}x ${i.nameSnapshot}`).join(", ")}
                </p>
                <div className="flex justify-between items-center pt-1 text-[11px] text-neutral-400">
                  <span>Customer: {ord.contactPhone}</span>
                  <span className="font-bold text-white text-xs">
                    ₹{Math.round(ord.totalMinor / 100)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                <div>
                  {ord.paymentStatus === "paid" ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkPaid(ord.id)}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold text-[11px] border border-neutral-700"
                    >
                      Mark Paid at Counter
                    </button>
                  )}
                </div>

                <Link
                  href={`/order/orders/${ord.id}`}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold text-[11px]"
                >
                  Details <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: REPORTS */}
      {activeTab === "reports" && salesReport && (
        <div className="space-y-3 pt-1">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs font-bold">
            {(["today", "week", "month"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setReportTimeframe(t)}
                className={`flex-1 py-1.5 rounded-lg capitalize transition-colors min-h-[38px] ${
                  reportTimeframe === t
                    ? "bg-[var(--accent)] text-black font-extrabold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {t === "today" ? "Today" : t === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[11px] text-neutral-400 font-semibold">Gross Revenue</span>
              <p className="text-xl font-black text-amber-400">
                ₹{Math.round(salesReport.grossSalesMinor / 100)}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[11px] text-neutral-400 font-semibold">Total Orders</span>
              <p className="text-xl font-black text-white">
                {salesReport.totalOrdersCount}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex justify-between items-center text-xs">
            <span className="text-neutral-400">Average Order Value (AOV)</span>
            <span className="font-extrabold text-white text-sm">
              ₹{Math.round(salesReport.averageOrderValueMinor / 100)}
            </span>
          </div>

          {/* Channel Split (Dine-in vs Delivery) */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2 text-xs">
            <h4 className="font-bold text-white text-xs pb-1 border-b border-neutral-800 flex items-center justify-between">
              <span>Channel Split</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            </h4>
            <div className="flex justify-between items-center text-neutral-300">
              <span>🍽️ Dine-In ({salesReport.dineIn.ordersCount} orders)</span>
              <span className="font-bold text-white">₹{Math.round(salesReport.dineIn.revenueMinor / 100)}</span>
            </div>
            <div className="flex justify-between items-center text-neutral-300">
              <span>🛵 Delivery ({salesReport.delivery.ordersCount} orders)</span>
              <span className="font-bold text-white">₹{Math.round(salesReport.delivery.revenueMinor / 100)}</span>
            </div>
          </div>

          {/* Top Selling Dishes */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2.5 text-xs">
            <h4 className="font-bold text-white text-xs pb-1 border-b border-neutral-800">
              Top Selling Dishes
            </h4>
            {salesReport.topDishes.length > 0 ? (
              salesReport.topDishes.map((dish, idx) => (
                <div key={idx} className="flex justify-between items-center text-neutral-300">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-[10px] font-bold text-amber-400 flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-white truncate">{dish.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-neutral-400">{dish.quantity} sold</span>
                    <span className="font-bold text-amber-400">₹{Math.round(dish.revenueMinor / 100)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-center py-2">No completed orders yet in this timeframe.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MENU MANAGEMENT */}
      {activeTab === "menu" && (
        <div className="space-y-3 pt-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="search"
              placeholder="Filter menu items to toggle sold out..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{item.name}</h4>
                  <p className="text-[11px] text-[var(--accent)] font-semibold">
                    ₹{Math.round(item.priceMinor / 100)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleMenu(item.id, item.effectiveAvailable)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[44px] flex items-center gap-1.5 border ${
                    item.effectiveAvailable
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
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
          <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-200">
            <p className="font-bold text-amber-300">Permanent Table QR Sessions</p>
            <p className="text-[11px] mt-0.5">
              Customers scan these QR codes to dine in. Rotating a token immediately invalidates old printed stickers.
            </p>
          </div>

          <div className="space-y-2">
            {tables.map((tbl) => (
              <div
                key={tbl.id}
                className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">{tbl.label}</span>
                    <span className="text-[11px] font-mono text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded">
                      {tbl.token}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRotateToken(tbl.id)}
                    disabled={rotatingTableId === tbl.id}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 min-h-[44px] px-2 font-semibold"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${rotatingTableId === tbl.id ? "animate-spin" : ""}`} />
                    Rotate Token
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800">
                  <span className="text-neutral-400 text-[11px]">QR Scan URL: /t/{tbl.token}</span>
                  <Link
                    href={`/t/${tbl.token}`}
                    target="_blank"
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
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
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-neutral-800 pb-2">
              Cafe Operational Status
            </h3>

            {/* Open / Closed Switch */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Cafe Kitchen Open</p>
                <p className="text-[11px] text-neutral-400">Accepting dine-in and online orders</p>
              </div>
              <button
                type="button"
                onClick={handleToggleCafeOpen}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border min-h-[44px] flex items-center gap-1.5 ${
                  cafeSettings.isOpen
                    ? "bg-emerald-500 text-black border-emerald-400 font-black"
                    : "bg-red-950 text-red-400 border-red-500/40"
                }`}
              >
                <Power className="w-4 h-4" />
                {cafeSettings.isOpen ? "OPEN" : "CLOSED"}
              </button>
            </div>

            {/* Delivery Switch */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
              <div>
                <p className="text-xs font-bold text-white">Home Delivery</p>
                <p className="text-[11px] text-neutral-400">Doorstep delivery via Razorpay</p>
              </div>
              <button
                type="button"
                onClick={handleToggleDelivery}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border min-h-[44px] flex items-center gap-1.5 ${
                  cafeSettings.deliveryEnabled
                    ? "bg-emerald-500 text-black border-emerald-400 font-black"
                    : "bg-red-950 text-red-400 border-red-500/40"
                }`}
              >
                {cafeSettings.deliveryEnabled ? "ENABLED" : "DISABLED"}
              </button>
            </div>

            <div className="pt-3 border-t border-neutral-800 text-xs text-neutral-400 space-y-1">
              <p>Operating Hours: <span className="text-white font-semibold">{cafeSettings.openingHours}</span></p>
              <p>Standard Delivery Fee: <span className="text-white font-semibold">₹30</span></p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: STAFF */}
      {activeTab === "staff" && (
        <div className="space-y-3 pt-1">
          <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs text-neutral-400">
            <p className="font-semibold text-white">Role-Based Access Control (RBAC)</p>
            <p className="text-[11px] mt-0.5">
              Staff roles are validated server-side from `staff_members`. Kitchen cannot access admin controls or delete staff.
            </p>
          </div>

          <div className="space-y-2">
            {staffList.map((st) => (
              <div
                key={st.id}
                className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-white">{st.name}</h4>
                  <p className="text-[11px] text-neutral-400">{st.phone}</p>
                </div>
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--accent)] text-black">
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
