"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, MENU_ITEMS, type MenuItem } from "@/lib/menu-data";
import { formatPrice } from "@/lib/utils";
import { Search, ArrowRight, Utensils, X } from "lucide-react";

export default function PublicMenuPage() {
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const filteredItems = React.useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.categoryId === activeCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto px-4 py-4 pb-24">
      {/* Top Banner Header */}
      <header className="flex items-center justify-between py-3 border-b border-[var(--border)]">
        <div>
          <Link href="/" className="text-xs text-[var(--brand-primary)] font-semibold uppercase tracking-wider">
            ← Cheezy dip cafe
          </Link>
          <h1 className="text-xl font-bold font-display text-[var(--text)]">Cafe Menu</h1>
        </div>
        <Link href="/order">
          <Button size="sm" variant="primary" className="font-bold gap-1 shadow">
            Order <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </header>

      {/* Search Input */}
      <div className="relative my-3">
        <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          placeholder="Search burger, pizza, fries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full min-h-[44px] pl-10 pr-9 py-2 text-base md:text-sm bg-[var(--bg-raised)] text-[var(--text)] border border-[var(--border)] rounded-[var(--r-input)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-muted)]/60"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sticky Category Chips */}
      <div className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-xs py-2 -mx-4 px-4 overflow-x-auto no-scrollbar flex items-center gap-2 border-b border-[var(--border)]">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-[var(--r-pill)] text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeCategory === "all"
              ? "bg-[var(--brand-primary)] text-[var(--text-on-brand)]"
              : "bg-[var(--bg-raised)] text-[var(--text-muted)] border border-[var(--border)] hover:text-white"
          }`}
        >
          All Items ({MENU_ITEMS.length})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-[var(--r-pill)] text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
              activeCategory === cat.id
                ? "bg-[var(--brand-primary)] text-[var(--text-on-brand)]"
                : "bg-[var(--bg-raised)] text-[var(--text-muted)] border border-[var(--border)] hover:text-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items List */}
      <section className="mt-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3.5 rounded-[var(--r-card)] bg-[var(--bg-raised)] border border-[var(--border)] space-y-3">
              <Skeleton className="w-full h-36" variant="card" />
              <Skeleton className="w-2/3 h-5" />
              <Skeleton className="w-full h-3.5" />
            </div>
          ))
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Utensils className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-40" />
            <p className="text-sm font-semibold text-[var(--text)]">No dishes found</p>
            <p className="text-xs text-[var(--text-muted)]">
              Try searching for something else or clear the category filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="mt-2"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="rounded-[var(--r-card)] bg-[var(--bg-raised)] border border-[var(--border)] overflow-hidden p-3 flex gap-3.5 shadow-xs hover:border-[var(--brand-primary)]/40 transition-colors cursor-pointer"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[var(--r-input)] overflow-hidden bg-zinc-900 shrink-0">
                <Image
                  src={item.imagePath}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
                <span className="absolute top-1.5 left-1.5 bg-black/80 w-2.5 h-2.5 rounded-full border border-emerald-500/40 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <h2 className="font-display font-bold text-sm text-[var(--text)] leading-snug line-clamp-1">
                      {item.name}
                    </h2>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-extrabold font-mono text-[var(--brand-primary)]">
                    {formatPrice(item.priceMinor)}
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] border border-[var(--border)] px-2 py-1 rounded-[var(--r-input)] hover:text-white">
                    View & Order
                  </span>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Floating Bottom Action Bar for Quick Ordering */}
      <aside className="fixed bottom-0 left-0 right-0 p-3 bg-[var(--bg-raised)]/95 backdrop-blur-md border-t border-[var(--border)] z-40">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[var(--text)]">Ready to eat?</p>
            <p className="text-[10px] text-[var(--text-muted)]">Dine-in at table or home delivery</p>
          </div>
          <Link href="/order">
            <Button variant="primary" size="md" className="font-bold shadow">
              Order Food Now
            </Button>
          </Link>
        </div>
      </aside>

      {/* Item Detail Bottom Sheet */}
      <BottomSheet
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name}
        description={selectedItem ? formatPrice(selectedItem.priceMinor) : ""}
      >
        {selectedItem && (
          <div className="space-y-4 text-left">
            <div className="relative w-full aspect-video rounded-[var(--r-input)] overflow-hidden bg-zinc-900">
              <Image
                src={selectedItem.imagePath}
                alt={selectedItem.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 mb-1.5">
                100% Vegetarian
              </span>
              <p className="text-xs text-[var(--text)] leading-relaxed">
                {selectedItem.description}
              </p>
            </div>

            {selectedItem.options && selectedItem.options.length > 0 && (
              <div className="pt-2 border-t border-[var(--border)] space-y-2">
                <p className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                  Available Sizes & Upgrades
                </p>
                <div className="space-y-1.5">
                  {selectedItem.options[0].choices.map((choice, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 rounded-[var(--r-input)] bg-[var(--bg)] border border-[var(--border)] text-xs"
                    >
                      <span>{choice.label}</span>
                      {choice.priceDeltaMinor > 0 && (
                        <span className="font-mono text-[var(--brand-primary)]">
                          +{formatPrice(choice.priceDeltaMinor)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-[var(--r-input)] bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 text-xs text-[var(--brand-primary)]">
              💡 Tip: Login with your mobile number to add items to cart and choose table dine-in or delivery.
            </div>

            <Link href="/order" className="block pt-2">
              <Button variant="primary" size="lg" className="w-full font-bold">
                Continue to Order ({formatPrice(selectedItem.priceMinor)})
              </Button>
            </Link>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
