import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_GATE_COOKIE = "cd_admin_gate";
const GATE_SECRET =
  process.env.TABLE_COOKIE_SECRET ||
  "cheezy_dip_admin_gatekeeper_secret_min_32_bytes";

// Default admin gate passkey (can be overridden via env var)
const ADMIN_GATE_PASSKEY = process.env.ADMIN_GATE_PASSKEY || "cheezy2026";

function signGatePayload(payload: string): string {
  return crypto.createHmac("sha256", GATE_SECRET).update(payload).digest("hex");
}

/**
 * Checks whether the current device/browser has unlocked the Admin Entrance Gate
 */
export async function checkAdminGateUnlocked(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(ADMIN_GATE_COOKIE)?.value;
    if (!cookie || !cookie.includes(".")) {
      return false;
    }

    const [val, signature] = cookie.split(".");
    if (val !== "unlocked" || !signature) {
      return false;
    }

    const expectedSig = signGatePayload(val);
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Verifies the admin entrance passkey and sets an httpOnly session cookie
 */
export async function verifyAdminGatePasskey(enteredPasskey: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!enteredPasskey || enteredPasskey.trim() !== ADMIN_GATE_PASSKEY.trim()) {
    return {
      success: false,
      error: "Invalid Admin Passkey. Please verify and try again.",
    };
  }

  const cookieStore = await cookies();
  const signature = signGatePayload("unlocked");
  const cookieValue = `unlocked.${signature}`;

  // 30 days validity for one-time entrance on this browser
  cookieStore.set(ADMIN_GATE_COOKIE, cookieValue, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return { success: true };
}

/**
 * Re-locks the admin entrance gate
 */
export async function lockAdminGate(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_GATE_COOKIE);
}
