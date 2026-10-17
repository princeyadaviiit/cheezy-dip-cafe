import { auth, currentUser } from "@clerk/nextjs/server";

export type StaffRole = "kitchen" | "admin" | "owner";

export interface AuthenticatedUser {
  userId: string;
  phone?: string;
  role?: StaffRole;
}

/**
 * Gets the current authenticated session.
 * Does not throw if unauthenticated; returns null.
 */
export async function getAuthSession(): Promise<AuthenticatedUser | null> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }
    const user = await currentUser();
    const phone = user?.phoneNumbers?.[0]?.phoneNumber;
    return {
      userId,
      phone,
    };
  } catch (error) {
    // In mock/test environments without active Clerk keys
    if (process.env.NODE_ENV === "test") {
      return {
        userId: "test_customer_clerk_id",
        phone: "+919876543210",
      };
    }
    return null;
  }
}

/**
 * Enforces customer authentication for server actions and protected routes.
 * Throws an Error if not authenticated.
 */
export async function requireCustomerAuth(): Promise<AuthenticatedUser> {
  const session = await getAuthSession();
  if (!session || !session.userId) {
    throw new Error("UNAUTHORIZED: Customer must be logged in with a verified phone number.");
  }
  return session;
}

/**
 * Mock/Database lookup for staff role.
 * In Phase 4 this queries public.staff_members directly with RLS.
 */
export async function getStaffRole(userId: string): Promise<StaffRole | null> {
  // Test/Development seed staff lookup
  const testStaffMap: Record<string, StaffRole> = {
    user_owner_01: "owner",
    user_admin_01: "admin",
    user_kitchen_01: "kitchen",
  };
  return testStaffMap[userId] || null;
}

/**
 * Enforces that the caller has at least one of the required staff roles.
 */
export async function requireStaffAuth(
  allowedRoles: StaffRole[] = ["kitchen", "admin", "owner"]
): Promise<AuthenticatedUser & { role: StaffRole }> {
  const session = await requireCustomerAuth();
  const role = await getStaffRole(session.userId);

  if (!role || !allowedRoles.includes(role)) {
    throw new Error(
      `FORBIDDEN: Insufficient permissions. Required: ${allowedRoles.join(", ")}`
    );
  }

  return {
    ...session,
    role,
  };
}
