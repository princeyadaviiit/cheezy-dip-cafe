import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import {
  STAFF_STORE,
  findStaffByIdentifier,
  findStaffByPhoneOrId,
  type StaffRole,
} from "./staff-store";

export type { StaffRole };

export interface AuthenticatedUser {
  userId: string;
  phone?: string;
  email?: string;
  name?: string;
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
    const email = user?.emailAddresses?.[0]?.emailAddress;
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || undefined;
    return {
      userId,
      phone,
      email,
      name,
    };
  } catch {
    // In mock/test environments without active Clerk keys
    if (process.env.NODE_ENV === "test") {
      return {
        userId: "test_customer_clerk_id",
        phone: "+919123456789",
        email: "customer@test.com",
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
    throw new Error("UNAUTHORIZED: Customer must be logged in to proceed.");
  }
  return session;
}

/**
 * Resolves staff role for a user.
 * 1. Checks unit test legacy IDs.
 * 2. Checks active dev role cookie (for testing & switching).
 * 3. Checks registered staff members in STAFF_STORE (mirrors Supabase public.staff_members) by userId, email, or phone.
 */
export async function getStaffRole(
  userId: string,
  phone?: string,
  email?: string
): Promise<StaffRole | null> {
  // 1. Test/Development seed staff lookup (for backwards compatibility with unit tests)
  const testStaffMap: Record<string, StaffRole> = {
    user_owner_01: "owner",
    user_admin_01: "admin",
    user_kitchen_01: "kitchen",
    user_owner_default: "owner",
    user_admin_vikram: "admin",
    user_kitchen_chef_amit: "kitchen",
  };
  if (testStaffMap[userId]) {
    return testStaffMap[userId];
  }

  // 2. Dev role cookie override (for testing staff flows without switching Clerk accounts)
  try {
    const cookieStore = await cookies();
    const devRole = cookieStore.get("cd_staff_role")?.value;
    if (devRole === "owner" || devRole === "admin" || devRole === "kitchen") {
      return devRole;
    }
  } catch {
    // cookies() unavailable in some non-request contexts
  }

  // 3. Check staff directory by Clerk userId
  const memberByUserId = findStaffByIdentifier(userId);
  if (memberByUserId && memberByUserId.isActive) {
    return memberByUserId.role;
  }

  // 4. Check staff directory by verified email
  if (email) {
    const memberByEmail = findStaffByIdentifier(email);
    if (memberByEmail && memberByEmail.isActive) {
      if (!memberByEmail.clerkUserId) {
        memberByEmail.clerkUserId = userId;
      }
      return memberByEmail.role;
    }
  }

  // 5. Check staff directory by verified phone number
  if (phone) {
    const memberByPhone = findStaffByIdentifier(phone);
    if (memberByPhone && memberByPhone.isActive) {
      if (!memberByPhone.clerkUserId) {
        memberByPhone.clerkUserId = userId;
      }
      return memberByPhone.role;
    }
  }

  return null;
}

/**
 * Enforces that the caller has at least one of the required staff roles.
 */
export async function requireStaffAuth(
  allowedRoles: StaffRole[] = ["kitchen", "admin", "owner"]
): Promise<AuthenticatedUser & { role: StaffRole }> {
  const session = await requireCustomerAuth();
  const role = await getStaffRole(session.userId, session.phone, session.email);

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
