"use server";

import {
  checkAdminGateUnlocked,
  verifyAdminGatePasskey,
  lockAdminGate,
} from "@/lib/auth/admin-gate";

export async function checkAdminGateStatus(): Promise<boolean> {
  return await checkAdminGateUnlocked();
}

export async function submitAdminGatePasskey(passkey: string): Promise<{
  success: boolean;
  error?: string;
}> {
  return await verifyAdminGatePasskey(passkey);
}

export async function lockAdminGateSession(): Promise<void> {
  await lockAdminGate();
}
