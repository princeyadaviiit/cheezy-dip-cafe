import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  requireCustomerAuth,
  getStaffRole,
  requireStaffAuth,
} from "@/lib/auth/server";
import { lockAdminGate } from "@/lib/auth/admin-gate";

describe("Server Auth Guard & Role Layer", () => {
  beforeEach(async () => {
    await lockAdminGate();
  });
  it("requireCustomerAuth succeeds with authenticated user session", async () => {
    const user = await requireCustomerAuth();
    expect(user).toBeDefined();
    expect(user.userId).toBeDefined();
  });

  it("getStaffRole maps recognized staff IDs correctly", async () => {
    expect(await getStaffRole("user_owner_01")).toBe("owner");
    expect(await getStaffRole("user_admin_01")).toBe("admin");
    expect(await getStaffRole("user_kitchen_01")).toBe("kitchen");
    expect(await getStaffRole("customer_regular_01")).toBeNull();
  });

  it("requireStaffAuth rejects users without required role", async () => {
    // Regular customer trying to access admin
    await expect(
      requireStaffAuth(["admin", "owner"])
    ).rejects.toThrow(/FORBIDDEN/i);
  });
});
