import { AUDIT_LOGS_STORE } from "@/lib/orders/order-store";

export interface CouponRecord {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  percentage?: number;
  fixedMinor?: number;
  maxDiscountMinor?: number;
  minOrderMinor: number;
  maxUsesGlobal: number;
  maxUsesPerUser: number;
  currentUsesGlobal: number;
  isActive: boolean;
  expiresAt: string;
}

// Initial active coupons store
const COUPONS_STORE: Map<string, CouponRecord> = new Map([
  [
    "CHEESE20",
    {
      code: "CHEESE20",
      description: "20% off up to ₹50 on orders above ₹199",
      discountType: "percentage",
      percentage: 20,
      maxDiscountMinor: 5000, // ₹50 max discount
      minOrderMinor: 19900, // ₹199
      maxUsesGlobal: 100,
      maxUsesPerUser: 1,
      currentUsesGlobal: 12,
      isActive: true,
      expiresAt: "2028-12-31T23:59:59.000Z",
    },
  ],
  [
    "DIPFIRST",
    {
      code: "DIPFIRST",
      description: "Flat ₹30 off on orders above ₹149",
      discountType: "fixed",
      fixedMinor: 3000, // ₹30
      minOrderMinor: 14900, // ₹149
      maxUsesGlobal: 500,
      maxUsesPerUser: 1,
      currentUsesGlobal: 45,
      isActive: true,
      expiresAt: "2028-12-31T23:59:59.000Z",
    },
  ],
  [
    "WEEKEND50",
    {
      code: "WEEKEND50",
      description: "Flat ₹50 off on orders above ₹299",
      discountType: "fixed",
      fixedMinor: 5000, // ₹50
      minOrderMinor: 29900, // ₹299
      maxUsesGlobal: 200,
      maxUsesPerUser: 2,
      currentUsesGlobal: 80,
      isActive: true,
      expiresAt: "2028-12-31T23:59:59.000Z",
    },
  ],
  [
    "EXPIRED10",
    {
      code: "EXPIRED10",
      description: "Expired test coupon",
      discountType: "fixed",
      fixedMinor: 1000,
      minOrderMinor: 5000,
      maxUsesGlobal: 10,
      maxUsesPerUser: 1,
      currentUsesGlobal: 5,
      isActive: true,
      expiresAt: "2020-01-01T00:00:00.000Z",
    },
  ],
]);

// User coupon redemption ledger: `couponCode:userId` -> count
const USER_COUPON_REDEMPTIONS: Map<string, number> = new Map();

// Concurrency mutex simulation for atomic global redemption
let redemptionLock = Promise.resolve();

export interface CouponValidationResult {
  isValid: boolean;
  discountMinor: number;
  coupon?: CouponRecord;
  error?: string;
}

/**
 * Validates whether a coupon code is eligible for the user and subtotal
 */
export function validateCoupon(
  code: string,
  subtotalMinor: number,
  userId: string
): CouponValidationResult {
  const normalized = code.trim().toUpperCase();
  const coupon = COUPONS_STORE.get(normalized);

  if (!coupon || !coupon.isActive) {
    return { isValid: false, discountMinor: 0, error: `Coupon code '${code}' is invalid or no longer active.` };
  }

  // 1. Expiration check
  if (new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { isValid: false, discountMinor: 0, error: `Coupon code '${code}' has expired.` };
  }

  // 2. Minimum subtotal check
  if (subtotalMinor < coupon.minOrderMinor) {
    return {
      isValid: false,
      discountMinor: 0,
      error: `Add items worth ₹${Math.round((coupon.minOrderMinor - subtotalMinor) / 100)} more to apply ${coupon.code}. Minimum order is ₹${Math.round(coupon.minOrderMinor / 100)}.`,
    };
  }

  // 3. Global usage limit check
  if (coupon.currentUsesGlobal >= coupon.maxUsesGlobal) {
    return { isValid: false, discountMinor: 0, error: `Coupon code '${code}' has reached its maximum global usage limit.` };
  }

  // 4. Per-user usage limit check
  const userUsesKey = `${normalized}:${userId}`;
  const userUsesCount = USER_COUPON_REDEMPTIONS.get(userUsesKey) || 0;
  if (userUsesCount >= coupon.maxUsesPerUser) {
    return {
      isValid: false,
      discountMinor: 0,
      error: `You have already used coupon code '${code}' the maximum allowed number of times.`,
    };
  }

  // 5. Compute discount
  let computedDiscountMinor = 0;
  if (coupon.discountType === "fixed" && coupon.fixedMinor) {
    computedDiscountMinor = Math.min(subtotalMinor, coupon.fixedMinor);
  } else if (coupon.discountType === "percentage" && coupon.percentage) {
    const rawDiscount = Math.round((subtotalMinor * coupon.percentage) / 100);
    computedDiscountMinor = coupon.maxDiscountMinor
      ? Math.min(rawDiscount, coupon.maxDiscountMinor)
      : rawDiscount;
  }

  return {
    isValid: true,
    discountMinor: computedDiscountMinor,
    coupon,
  };
}

/**
 * Atomically redeems a coupon for an order, incrementing usage counters with concurrency protection
 */
export async function redeemCouponAtomic(
  code: string,
  subtotalMinor: number,
  userId: string,
  orderId: string
): Promise<{ success: boolean; discountMinor: number }> {
  // Chain through redemptionLock to guarantee atomic serialized counter increments
  return new Promise((resolve, reject) => {
    redemptionLock = redemptionLock
      .then(async () => {
        const validation = validateCoupon(code, subtotalMinor, userId);
        if (!validation.isValid || !validation.coupon) {
          throw new Error(validation.error || "Coupon redemption failed validation");
        }

        const coupon = validation.coupon;
        const userUsesKey = `${coupon.code}:${userId}`;
        const currentCount = USER_COUPON_REDEMPTIONS.get(userUsesKey) || 0;

        // Atomically increment
        coupon.currentUsesGlobal += 1;
        USER_COUPON_REDEMPTIONS.set(userUsesKey, currentCount + 1);

        AUDIT_LOGS_STORE.push({
          id: `audit_cpn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          entity: "coupon",
          entityId: coupon.code,
          action: "coupon_redeemed",
          actorRole: "customer",
          actorUserId: userId,
          metadata: {
            orderId,
            discountMinor: validation.discountMinor,
            globalUsesAfter: coupon.currentUsesGlobal,
          },
          createdAt: new Date().toISOString(),
        });

        resolve({ success: true, discountMinor: validation.discountMinor });
      })
      .catch(reject);
  });
}
