import { describe, it, expect } from "vitest";
import {
  validateCoupon,
  redeemCouponAtomic,
} from "@/lib/coupons/coupon-service";

describe("Coupon Engine (Validation, Limits, and Atomic Redemption)", () => {
  it("validates percentage coupon CHEESE20 with discount cap", () => {
    // 20% off up to ₹50 on min ₹199 (19900 paise)
    // Order 1: ₹200 (20000 paise) -> 20% is ₹40 (4000 paise)
    const result1 = validateCoupon("CHEESE20", 20000, "user_cust_1");
    expect(result1.isValid).toBe(true);
    expect(result1.discountMinor).toBe(4000);

    // Order 2: ₹500 (50000 paise) -> 20% is ₹100, capped at max ₹50 (5000 paise)
    const result2 = validateCoupon("CHEESE20", 50000, "user_cust_1");
    expect(result2.isValid).toBe(true);
    expect(result2.discountMinor).toBe(5000);
  });

  it("validates fixed discount coupon DIPFIRST", () => {
    // Flat ₹30 off on min ₹149 (14900 paise)
    const result = validateCoupon("DIPFIRST", 18000, "user_cust_2");
    expect(result.isValid).toBe(true);
    expect(result.discountMinor).toBe(3000);
  });

  it("rejects coupon when minimum subtotal requirement is not met", () => {
    const result = validateCoupon("CHEESE20", 10000, "user_cust_3"); // ₹100 < ₹199 min
    expect(result.isValid).toBe(false);
    expect(result.discountMinor).toBe(0);
    expect(result.error).toContain("Minimum order is ₹199");
  });

  it("rejects expired coupons", () => {
    const result = validateCoupon("EXPIRED10", 10000, "user_cust_4");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("expired");
  });

  it("enforces per-user redemption limit", async () => {
    const userId = "user_cust_limit_test";
    // DIPFIRST maxUsesPerUser = 1
    const redemption1 = await redeemCouponAtomic("DIPFIRST", 20000, userId, "ord_cpn_001");
    expect(redemption1.success).toBe(true);
    expect(redemption1.discountMinor).toBe(3000);

    // Second redemption by same user must be rejected
    const validation2 = validateCoupon("DIPFIRST", 20000, userId);
    expect(validation2.isValid).toBe(false);
    expect(validation2.error).toContain("maximum allowed number of times");

    await expect(
      redeemCouponAtomic("DIPFIRST", 20000, userId, "ord_cpn_002")
    ).rejects.toThrow(/maximum allowed number of times/);
  });

  it("handles concurrent redemption attempts safely without race conditions", async () => {
    const users = ["concurrent_user_1", "concurrent_user_2", "concurrent_user_3"];
    const promises = users.map((uid, idx) =>
      redeemCouponAtomic("WEEKEND50", 35000, uid, `ord_concurrent_${idx}`)
    );

    const results = await Promise.all(promises);
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.success).toBe(true);
      expect(r.discountMinor).toBe(5000);
    }
  });
});
