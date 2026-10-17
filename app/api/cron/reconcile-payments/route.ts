import { NextResponse } from "next/server";
import { expireStaleDeliveryOrders } from "@/services/payment-service";

export async function GET() {
  try {
    const expiredCount = await expireStaleDeliveryOrders(15);
    return NextResponse.json({
      status: "success",
      expiredOrdersCount: expiredCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Reconciliation error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
