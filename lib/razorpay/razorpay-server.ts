import "server-only";
import crypto from "crypto";

const KEY_ID =
  process.env.RAZORPAY_KEY_ID ||
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  "rzp_test_cheezy_dip_default_key";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "cheezy_dip_razorpay_secret_test_32_bytes";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "cheezy_dip_webhook_secret_test_32_bytes";

export interface RazorpayOrderInitResult {
  razorpayOrderId: string;
  amountMinor: number;
  currency: string;
  keyId: string;
}

/**
 * Creates a server-side Razorpay order representation
 */
export async function createRazorpayOrder(
  internalOrderId: string,
  amountMinor: number,
  currency: string = "INR"
): Promise<RazorpayOrderInitResult> {
  if (amountMinor <= 0) {
    throw new Error("Razorpay order amount must be greater than zero.");
  }

  // Detect whether authentic production/test Razorpay API credentials are configured
  const isRealRazorpayCredentials =
    Boolean(KEY_ID) &&
    Boolean(KEY_SECRET) &&
    !KEY_ID.includes("cheezy_dip_default_key") &&
    !KEY_SECRET.includes("cheezy_dip_razorpay_secret_test");

  if (isRealRazorpayCredentials) {
    try {
      const basicAuth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountMinor,
          currency,
          receipt: internalOrderId.slice(0, 40),
          notes: {
            internalOrderId,
            cafe: "Cheezy Dip Cafe",
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const description =
          errJson?.error?.description || `Razorpay order creation failed with HTTP ${res.status}`;
        throw new Error(`RAZORPAY_API_ERROR: ${description}`);
      }

      const rzpData = await res.json();
      return {
        razorpayOrderId: rzpData.id,
        amountMinor: rzpData.amount,
        currency: rzpData.currency || currency,
        keyId: KEY_ID,
      };
    } catch (err: unknown) {
      console.error("[Razorpay API] Order creation error:", err);
      // In production environment with real keys configured, throw error instead of silent mock
      if (process.env.NODE_ENV === "production") {
        throw err;
      }
    }
  }

  // Deterministic fallback for dev/offline testing suites
  const razorpayOrderId = `order_${crypto
    .createHash("sha256")
    .update(`${internalOrderId}:${amountMinor}:${Date.now()}`)
    .digest("hex")
    .substring(0, 14)}`;

  return {
    razorpayOrderId,
    amountMinor,
    currency,
    keyId: KEY_ID,
  };
}

/**
 * Verifies the Razorpay checkout signature returned to client
 * Formula: HMAC-SHA256(order_id + "|" + payment_id, secret) == signature
 */
export function verifyRazorpayCheckoutSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  if (!razorpayOrderId || !razorpayPaymentId || !signature) {
    return false;
  }

  try {
    const expected = crypto
      .createHmac("sha256", KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expected, "hex");

    if (sigBuf.length !== expBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * Verifies Razorpay Webhook signature against raw request body
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secretOverride?: string
): boolean {
  if (!rawBody || !signatureHeader) {
    return false;
  }

  try {
    const secret = secretOverride || WEBHOOK_SECRET;
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    const sigBuf = Buffer.from(signatureHeader, "hex");
    const expBuf = Buffer.from(expected, "hex");

    if (sigBuf.length !== expBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * Helper to compute valid signatures in tests or dev mocks
 */
export function generateTestWebhookSignature(rawBody: string, secretOverride?: string): string {
  const secret = secretOverride || WEBHOOK_SECRET;
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

export function generateTestCheckoutSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string
): string {
  return crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
}
