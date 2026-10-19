import { NextRequest, NextResponse } from "next/server";
import { handleTelegramWebhook } from "@/services/telegram-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await handleTelegramWebhook(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Telegram webhook route error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal error" },
      { status: 200 } // Telegram requires 200 to acknowledge webhook delivery
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Cheezy Dip Cafe Telegram Bot Webhook",
    timestamp: new Date().toISOString(),
  });
}
