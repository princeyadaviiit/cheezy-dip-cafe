"use client";

import React, { useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ShoppingBag, Utensils, Sparkles } from "lucide-react";
import { MENU_ITEMS, CATEGORIES, type MenuItem } from "@/lib/menu-data";
import { useCart } from "@/lib/cart/cart-context";
import { ItemModifierModal } from "@/components/orders/item-modifier-modal";
import { Button } from "@/components/ui/button";

function CustomerOrderContent() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");
  const { items: cartItems, addItem, totalCount, subtotalMinor, tableLabel, setTableLabel, orderType, setOrderType } = useCart();

  // If table is in query param, save to cart context
  React.useEffect(() => {
    if (tableParam) {
      setTableLabel(decodeURIComponent(tableParam));
      setOrderType("dine_in");
    }
  }, [tableParam, setTableLabel, setOrderType]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);

  // Filter items
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.categoryId === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-4 pb-24">
      {/* Table / Dining Mode Banner */}
      {tableLabel || tableParam ? (
        <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-neutral-900 rounded-xl border border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                Dine-In Session
              </p>
              <p className="text-sm font-bold text-white">
                Seated at {tableLabel || tableParam}
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2 py-1 bg-amber-500/20 text-amber-300 font-semibold rounded-md border border-amber-500/30">
            Pay at Counter
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between p-1 bg-neutral-900 rounded-xl border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setOrderType("dine_in")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors min-h-[44px] ${
              orderType === "dine_in"
                ? "bg-[var(--accent)] text-black"
                : "text-[var(--muted)] hover:text-white"
            }`}
          >
            🍽️ Dine-In
          </button>
          <button
            type="button"
            onClick={() => setOrderType("delivery")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors min-h-[44px] ${
              orderType === "delivery"
                ? "bg-[var(--accent)] text-black"
                : "text-[var(--muted)] hover:text-white"
            }`}
          >
            🛵 Delivery
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="search"
          placeholder="Search cheese burgers, loaded fries, shakes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-900 border border-[var(--border)] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--accent)] min-h-[44px]"
        />
      </div>

      {/* Horizontal Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border min-h-[44px] transition-colors flex items-center ${
            selectedCategory === "all"
              ? "bg-[var(--accent)] text-black border-[var(--accent)]"
              : "bg-neutral-900 text-neutral-300 border-[var(--border)] hover:bg-neutral-800"
          }`}
        >
          All Items ({MENU_ITEMS.length})
        </button>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border min-h-[44px] transition-colors flex items-center ${
                isSelected
                  ? "bg-[var(--accent)] text-black border-[var(--accent)]"
                  : "bg-neutral-900 text-neutral-300 border-[var(--border)] hover:bg-neutral-800"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Item List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.id}
              className="p-3.5 bg-neutral-900/70 border border-[var(--border)] rounded-2xl flex gap-3.5 items-center justify-between hover:border-neutral-700 transition-colors"
            >
              {/* Item Info */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-1">
                  {item.diet === "veg" && (
                    <span className="w-3.5 h-3.5 rounded border border-emerald-500 flex items-center justify-center p-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </span>
                  )}
                  {item.featured && (
                    <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Chef Special
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white truncate">
                  {item.name}
                </h3>
                <p className="text-xs text-[var(--muted)] line-clamp-2 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-extrabold text-[var(--accent)]">
                    ₹{Math.round(item.priceMinor / 100)}
                  </span>
                  {item.options && item.options.length > 0 && (
                    <span className="text-[10px] text-neutral-400">
                      • Customizable
                    </span>
                  )}
                </div>
              </div>

              {/* Item Thumbnail & Add Button */}
              <div className="relative shrink-0 flex flex-col items-center">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-neutral-800 border border-[var(--border)]">
                  {item.imagePath ? (
                    <Image
                      src={item.imagePath}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600">
                      No photo
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalItem(item)}
                  className="mt-[-14px] z-10 px-4 py-1 rounded-lg bg-[var(--accent)] text-black text-xs font-bold shadow-md hover:bg-amber-400 min-h-[32px] flex items-center justify-center border border-amber-300"
                >
                  ADD +
                </button>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 px-4 rounded-2xl bg-neutral-900 border border-[var(--border)]">
            <p className="text-sm font-semibold text-neutral-300">
              No dishes found matching &quot;{searchQuery}&quot;
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              Try searching for &quot;burger&quot;, &quot;fries&quot;, or &quot;cheese&quot;
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-3 text-xs"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Item Customizer Modal */}
      <ItemModifierModal
        item={activeModalItem}
        isOpen={activeModalItem !== null}
        onClose={() => setActiveModalItem(null)}
        onAddToCart={(item, qty, options, note) => {
          addItem(item, qty, options, note);
        }}
      />

      {/* Floating Bottom Cart Bar */}
      {totalCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4 z-50">
          <Link
            href="/order/cart"
            className="w-full bg-[var(--accent)] text-black p-3.5 rounded-2xl shadow-xl flex items-center justify-between font-bold hover:bg-amber-400 transition-transform active:scale-[0.98] min-h-[52px]"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-black text-[var(--accent)] text-xs font-black flex items-center justify-center">
                {totalCount}
              </span>
              <span className="text-sm font-extrabold tracking-tight">
                {totalCount === 1 ? "1 item added" : `${totalCount} items added`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black">
                ₹{Math.round(subtotalMinor / 100)}
              </span>
              <span className="text-xs bg-black/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                View Cart →
              </span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CustomerOrderPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-neutral-400">Loading menu...</div>}>
      <CustomerOrderContent />
    </Suspense>
  );
}
