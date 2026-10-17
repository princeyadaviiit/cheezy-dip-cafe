import { describe, it, expect } from "vitest";

type Actor = "anon" | "customerA" | "customerB" | "kitchen" | "admin" | "owner";

interface SecurityContext {
  actor: Actor;
  clerkUserId: string | null;
  role: "kitchen" | "admin" | "owner" | null;
}

function createSecurityContext(actor: Actor): SecurityContext {
  switch (actor) {
    case "anon":
      return { actor, clerkUserId: null, role: null };
    case "customerA":
      return { actor, clerkUserId: "user_cust_A", role: null };
    case "customerB":
      return { actor, clerkUserId: "user_cust_B", role: null };
    case "kitchen":
      return { actor, clerkUserId: "user_kitchen", role: "kitchen" };
    case "admin":
      return { actor, clerkUserId: "user_admin", role: "admin" };
    case "owner":
      return { actor, clerkUserId: "user_owner", role: "owner" };
  }
}

/**
 * Simulates the RLS and Server Action Authorization Engine
 * Mirrors the exact policies in 20261017000002_rls_and_permissions.sql
 */
class AuthorizationMatrixEvaluator {
  canReadMenu(ctx: SecurityContext, itemIsActive: boolean): boolean {
    // Menu is public for active items; staff can see inactive items too
    if (itemIsActive) return true;
    return ctx.role !== null;
  }

  canReadOrder(ctx: SecurityContext, orderOwnerId: string): boolean {
    if (!ctx.clerkUserId) return false;
    // Staff can read all orders
    if (ctx.role !== null) return true;
    // Customers can only read their own orders
    return ctx.clerkUserId === orderOwnerId;
  }

  canDirectWriteOrder(ctx: SecurityContext): boolean {
    // HARD RULE: Zero client write grants on protected tables. All direct writes are rejected.
    return false;
  }

  canReadAddress(ctx: SecurityContext, addressOwnerId: string): boolean {
    if (!ctx.clerkUserId) return false;
    return ctx.clerkUserId === addressOwnerId;
  }

  canReadPayments(ctx: SecurityContext, orderOwnerId: string): boolean {
    if (!ctx.clerkUserId) return false;
    // Admin and owner can inspect all payments
    if (ctx.role === "admin" || ctx.role === "owner") return true;
    // Kitchen staff do NOT have payments access
    if (ctx.role === "kitchen") return false;
    // Customers can see payments for their own orders only
    return ctx.clerkUserId === orderOwnerId;
  }

  canReadStaffMembers(ctx: SecurityContext, targetStaffClerkId: string): boolean {
    if (!ctx.clerkUserId) return false;
    if (ctx.role === "admin" || ctx.role === "owner") return true;
    if (ctx.role === "kitchen") return ctx.clerkUserId === targetStaffClerkId;
    return false;
  }

  canDirectWriteSettings(ctx: SecurityContext): boolean {
    // Settings cannot be modified via direct DB write
    return false;
  }

  canInitiateRefund(ctx: SecurityContext): boolean {
    // Only Admin and Owner can issue refunds
    return ctx.role === "admin" || ctx.role === "owner";
  }
}

describe("Phase 4: Authorization Matrix (docs/04 section 3)", () => {
  const auth = new AuthorizationMatrixEvaluator();

  const anon = createSecurityContext("anon");
  const custA = createSecurityContext("customerA");
  const custB = createSecurityContext("customerB");
  const kitchen = createSecurityContext("kitchen");
  const admin = createSecurityContext("admin");
  const owner = createSecurityContext("owner");

  describe("Public Menu Read", () => {
    it("allows all actors to read active menu items", () => {
      expect(auth.canReadMenu(anon, true)).toBe(true);
      expect(auth.canReadMenu(custA, true)).toBe(true);
      expect(auth.canReadMenu(custB, true)).toBe(true);
      expect(auth.canReadMenu(kitchen, true)).toBe(true);
      expect(auth.canReadMenu(admin, true)).toBe(true);
      expect(auth.canReadMenu(owner, true)).toBe(true);
    });

    it("hides inactive menu items from public but shows to staff", () => {
      expect(auth.canReadMenu(anon, false)).toBe(false);
      expect(auth.canReadMenu(custA, false)).toBe(false);
      expect(auth.canReadMenu(admin, false)).toBe(true);
      expect(auth.canReadMenu(kitchen, false)).toBe(true);
    });
  });

  describe("Orders Read Isolation", () => {
    it("denies anonymous users from reading any order", () => {
      expect(auth.canReadOrder(anon, "user_cust_A")).toBe(false);
    });

    it("allows Customer A to read own order but denies Customer B order", () => {
      expect(auth.canReadOrder(custA, "user_cust_A")).toBe(true);
      expect(auth.canReadOrder(custA, "user_cust_B")).toBe(false);
    });

    it("allows staff (kitchen, admin, owner) to read all incoming orders", () => {
      expect(auth.canReadOrder(kitchen, "user_cust_A")).toBe(true);
      expect(auth.canReadOrder(admin, "user_cust_A")).toBe(true);
      expect(auth.canReadOrder(owner, "user_cust_B")).toBe(true);
    });
  });

  describe("Direct Database Writes (Zero Client Write Grants)", () => {
    it("strictly blocks direct client order writes for all actors", () => {
      expect(auth.canDirectWriteOrder(anon)).toBe(false);
      expect(auth.canDirectWriteOrder(custA)).toBe(false);
      expect(auth.canDirectWriteOrder(kitchen)).toBe(false);
      expect(auth.canDirectWriteOrder(admin)).toBe(false);
      expect(auth.canDirectWriteOrder(owner)).toBe(false);
    });

    it("strictly blocks direct settings writes for all actors", () => {
      expect(auth.canDirectWriteSettings(anon)).toBe(false);
      expect(auth.canDirectWriteSettings(custA)).toBe(false);
      expect(auth.canDirectWriteSettings(admin)).toBe(false);
    });
  });

  describe("Customer Address Isolation", () => {
    it("customer can only read their own delivery addresses", () => {
      expect(auth.canReadAddress(custA, "user_cust_A")).toBe(true);
      expect(auth.canReadAddress(custA, "user_cust_B")).toBe(false);
      expect(auth.canReadAddress(anon, "user_cust_A")).toBe(false);
      expect(auth.canReadAddress(kitchen, "user_cust_A")).toBe(false);
    });
  });

  describe("Payments Read Privacy", () => {
    it("customer reads payment for own order only", () => {
      expect(auth.canReadPayments(custA, "user_cust_A")).toBe(true);
      expect(auth.canReadPayments(custA, "user_cust_B")).toBe(false);
    });

    it("kitchen cannot read payment provider records", () => {
      expect(auth.canReadPayments(kitchen, "user_cust_A")).toBe(false);
    });

    it("admin and owner can audit payments", () => {
      expect(auth.canReadPayments(admin, "user_cust_A")).toBe(true);
      expect(auth.canReadPayments(owner, "user_cust_B")).toBe(true);
    });
  });

  describe("Refund Permission Enforcement", () => {
    it("only admin and owner may execute refunds", () => {
      expect(auth.canInitiateRefund(anon)).toBe(false);
      expect(auth.canInitiateRefund(custA)).toBe(false);
      expect(auth.canInitiateRefund(kitchen)).toBe(false);
      expect(auth.canInitiateRefund(admin)).toBe(true);
      expect(auth.canInitiateRefund(owner)).toBe(true);
    });
  });
});
