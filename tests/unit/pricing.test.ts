import { describe, it, expect } from "vitest";
import { calculateOrderPricing } from "@/lib/orders/pricing";

describe("Pricing Engine (Paise calculations & Tamper resistance)", () => {
  it("calculates basic subtotal for valid catalog items", () => {
    const result = calculateOrderPricing({
      items: [
        { menuItemId: "fries-cheese-loaded", quantity: 2 }, // 10900 * 2 = 21800
        { menuItemId: "burger-crispy", quantity: 1 }, // 4000
      ],
      orderType: "dine_in",
    });

    expect(result.subtotalMinor).toBe(21800 + 4000); // 25800 paise (₹258)
    expect(result.deliveryFeeMinor).toBe(0);
    expect(result.taxMinor).toBe(0);
    expect(result.totalMinor).toBe(25800);
    expect(result.items).toHaveLength(2);
  });

  it("calculates modifiers and options add-on deltas correctly", () => {
    const result = calculateOrderPricing({
      items: [
        {
          menuItemId: "burger-crispy-dip",
          quantity: 1, // 12900
          optionChoiceLabels: ["Extra Melting Dip (+₹20)"], // +2000 paise
        },
      ],
      orderType: "dine_in",
    });

    // 12900 + 2000 = 14900 paise
    expect(result.items[0].unitPriceMinor).toBe(12900);
    expect(result.items[0].lineTotalMinor).toBe(14900);
    expect(result.totalMinor).toBe(14900);
    expect(result.items[0].modifiersSnapshot).toHaveLength(1);
    expect(result.items[0].modifiersSnapshot[0].priceDeltaMinor).toBe(2000);
  });

  it("enforces zero delivery fee for dine_in even if fee is passed", () => {
    const result = calculateOrderPricing({
      items: [{ menuItemId: "burger-crispy", quantity: 1 }],
      orderType: "dine_in",
      deliveryFeeMinor: 5000, // client attempts to pass delivery fee
    });

    expect(result.deliveryFeeMinor).toBe(0);
    expect(result.totalMinor).toBe(4000);
  });

  it("applies delivery fee for delivery orders", () => {
    const result = calculateOrderPricing({
      items: [{ menuItemId: "burger-crispy", quantity: 1 }],
      orderType: "delivery",
      deliveryFeeMinor: 3000,
    });

    expect(result.deliveryFeeMinor).toBe(3000);
    expect(result.totalMinor).toBe(4000 + 3000); // 7000 paise
  });

  it("applies coupon discounts without exceeding subtotal", () => {
    const result = calculateOrderPricing({
      items: [{ menuItemId: "burger-crispy", quantity: 1 }], // 4000
      orderType: "dine_in",
      couponDiscountMinor: 1000, // ₹10 off
    });

    expect(result.discountMinor).toBe(1000);
    expect(result.totalMinor).toBe(3000);
  });

  it("throws validation error for non-existent catalog items", () => {
    expect(() =>
      calculateOrderPricing({
        items: [{ menuItemId: "fake-item-does-not-exist", quantity: 1 }],
        orderType: "dine_in",
      })
    ).toThrow(/VALIDATION_ERROR/);
  });

  it("throws validation error for invalid quantities", () => {
    expect(() =>
      calculateOrderPricing({
        items: [{ menuItemId: "burger-crispy", quantity: 0 }],
        orderType: "dine_in",
      })
    ).toThrow(/Invalid quantity/);

    expect(() =>
      calculateOrderPricing({
        items: [{ menuItemId: "burger-crispy", quantity: 999 }],
        orderType: "dine_in",
      })
    ).toThrow(/Invalid quantity/);
  });
});
