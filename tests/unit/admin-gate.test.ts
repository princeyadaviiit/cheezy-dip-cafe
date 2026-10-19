import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkAdminGateUnlocked,
  verifyAdminGatePasskey,
  lockAdminGate,
  ADMIN_GATE_COOKIE,
} from "@/lib/auth/admin-gate";
import {
  claimAdminRoleForCurrentUser,
  getCurrentStaffStatus,
} from "@/services/admin-service";
import { STAFF_STORE, findStaffByIdentifier } from "@/lib/auth/staff-store";

describe("Admin Gatekeeper & Multi-Stage Auth Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("checkAdminGateUnlocked returns false when cookie is absent", async () => {
    const isUnlocked = await checkAdminGateUnlocked();
    expect(isUnlocked).toBe(false);
  });

  it("verifyAdminGatePasskey rejects incorrect passkeys", async () => {
    const res = await verifyAdminGatePasskey("wrong_password");
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/invalid admin passkey/i);
  });

  it("verifyAdminGatePasskey accepts correct passkey and sets signed cookie", async () => {
    const res = await verifyAdminGatePasskey("cheezy2026");
    expect(res.success).toBe(true);

    const isUnlocked = await checkAdminGateUnlocked();
    expect(isUnlocked).toBe(true);
  });

  it("lockAdminGate revokes gate session", async () => {
    await verifyAdminGatePasskey("cheezy2026");
    expect(await checkAdminGateUnlocked()).toBe(true);

    await lockAdminGate();
    expect(await checkAdminGateUnlocked()).toBe(false);
  });

  it("claimAdminRoleForCurrentUser fails if admin gate is locked", async () => {
    await lockAdminGate();
    await expect(claimAdminRoleForCurrentUser()).rejects.toThrow(/gate passkey session is required/i);
  });

  it("claimAdminRoleForCurrentUser succeeds when gate is unlocked and elevates Clerk user", async () => {
    // Unlock gate first
    await verifyAdminGatePasskey("cheezy2026");
    expect(await checkAdminGateUnlocked()).toBe(true);

    // Call claimAdminRoleForCurrentUser
    const claimRes = await claimAdminRoleForCurrentUser();
    expect(claimRes.success).toBe(true);
    expect(claimRes.role).toBe("admin");

    // Check that user is recognized in current staff status
    const status = await getCurrentStaffStatus();
    expect(status.isAuthenticated).toBe(true);
    expect(status.role).toBe("admin");
  });
});
