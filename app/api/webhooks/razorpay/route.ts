import { NextRequest, NextResponse } from "next/server";
import { processRazorpayWebhook } from "@/services/payment-service";

export async function POST(request: NextRequest) {
  try {
    // 1. Read raw body as text for cryptographic HMAC signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    const result = await processRazorpayWebhook(rawBody, signature);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal webhook processing error";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
