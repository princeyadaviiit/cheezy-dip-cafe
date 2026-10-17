import { describe, it, expect } from "vitest";
import { CATEGORIES, MENU_ITEMS } from "@/lib/menu-data";
import { formatPrice } from "@/lib/utils";

describe("Menu Catalog Integrity", () => {
  it("contains all core categories defined on the cafe poster", () => {
    const categoryIds = CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain("burgers");
    expect(categoryIds).toContain("pizzas");
    expect(categoryIds).toContain("sandwiches");
    expect(categoryIds).toContain("momos");
    expect(categoryIds).toContain("french-fries");
    expect(categoryIds).toContain("tea-coffee");
  });

  it("every menu item has valid positive price in minor units (paise)", () => {
    for (const item of MENU_ITEMS) {
      expect(item.priceMinor).toBeGreaterThan(0);
      expect(item.name.length).toBeGreaterThan(2);
      expect(item.imagePath).toBeDefined();
    }
  });

  it("formats menu prices accurately with Rupee symbol", () => {
    const burger = MENU_ITEMS.find((i) => i.id === "burger-crispy-dip");
    expect(burger).toBeDefined();
    if (burger) {
      expect(formatPrice(burger.priceMinor)).toContain("129");
    }
  });

  it("has featured items for the landing page hero showcase", () => {
    const featured = MENU_ITEMS.filter((i) => i.featured);
    expect(featured.length).toBeGreaterThanOrEqual(4);
  });
});
