import "server-only";
import crypto from "crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_cheezy_dip_default_key";
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

  // Generate deterministic test mode Razorpay order ID
  const razorpayOrderId = `order_${crypto.createHash("sha256").update(`${internalOrderId}:${amountMinor}:${Date.now()}`).digest("hex").substring(0, 14)}`;

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
