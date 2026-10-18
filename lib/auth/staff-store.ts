import crypto from "crypto";

export type StaffRole = "kitchen" | "admin" | "owner";

export interface StaffMember {
  id: string;
  clerkUserId?: string;
  name: string;
  phone: string;
  role: StaffRole;
  isActive: boolean;
  createdAt?: string;
}

// In-memory staff members directory (mirrors Supabase public.staff_members)
export const STAFF_STORE: StaffMember[] = [
  {
    id: "s0000000-0000-0000-0000-000000000001",
    clerkUserId: "user_owner_default",
    name: "Cafe Owner",
    phone: "+919876543210",
    role: "owner",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "s0000000-0000-0000-0000-000000000002",
    clerkUserId: "user_admin_vikram",
    name: "Vikram Admin",
    phone: "+919876543211",
    role: "admin",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "s0000000-0000-0000-0000-000000000003",
    clerkUserId: "user_kitchen_chef_amit",
    name: "Chef Amit",
    phone: "+919876543212",
    role: "kitchen",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Normalizes phone numbers for reliable comparison (strips non-digits, keeps last 10 digits)
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function getAllStaffMembers(): StaffMember[] {
  return [...STAFF_STORE];
}

export function findStaffByPhoneOrId(identifier: string): StaffMember | undefined {
  if (!identifier) return undefined;

  // Match by Clerk User ID or staff record ID
  const byId = STAFF_STORE.find(
    (s) => s.id === identifier || (s.clerkUserId && s.clerkUserId === identifier)
  );
  if (byId) return byId;

  // Match by normalized phone
  const clean = normalizePhone(identifier);
  if (clean.length >= 10) {
    return STAFF_STORE.find((s) => normalizePhone(s.phone) === clean);
  }

  return undefined;
}

export function addStaffMemberRecord(input: {
  name: string;
  phone: string;
  role: StaffRole;
}): StaffMember {
  const normalized = normalizePhone(input.phone);
  const existing = STAFF_STORE.find((s) => normalizePhone(s.phone) === normalized);
  if (existing) {
    existing.role = input.role;
    existing.name = input.name;
    existing.isActive = true;
    return existing;
  }

  const newStaff: StaffMember = {
    id: `staff_${crypto.randomBytes(4).toString("hex")}`,
    name: input.name,
    phone: input.phone.startsWith("+") ? input.phone : `+91${normalized}`,
    role: input.role,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  STAFF_STORE.push(newStaff);
  return newStaff;
}

export function toggleStaffMemberActive(id: string): boolean {
  const staff = STAFF_STORE.find((s) => s.id === id);
  if (!staff) {
    throw new Error(`Staff member with ID '${id}' not found.`);
  }
  staff.isActive = !staff.isActive;
  return staff.isActive;
}
