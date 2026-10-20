import crypto from "crypto";

export type StaffRole = "kitchen" | "admin" | "owner";

export interface StaffMember {
  id: string;
  clerkUserId?: string;
  name: string;
  phone: string;
  email?: string;
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
    phone: "+918696321018",
    email: "owner@cheezydipcafe.com",
    role: "owner",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function resetStaffStore(): void {
  STAFF_STORE.length = 0;
  STAFF_STORE.push({
    id: "s0000000-0000-0000-0000-000000000001",
    clerkUserId: "user_owner_default",
    name: "Cafe Owner",
    phone: "+918696321018",
    email: "owner@cheezydipcafe.com",
    role: "owner",
    isActive: true,
    createdAt: new Date().toISOString(),
  });
}

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

export function findStaffByIdentifier(identifier: string): StaffMember | undefined {
  if (!identifier) return undefined;
  const target = identifier.trim().toLowerCase();

  // Match by Clerk User ID or staff record ID
  const byId = STAFF_STORE.find(
    (s) => s.id === identifier || (s.clerkUserId && s.clerkUserId === identifier)
  );
  if (byId) return byId;

  // Match by email
  const byEmail = STAFF_STORE.find(
    (s) => s.email && s.email.toLowerCase() === target
  );
  if (byEmail) return byEmail;

  // Match by normalized phone
  const clean = normalizePhone(identifier);
  if (clean.length >= 10) {
    return STAFF_STORE.find((s) => normalizePhone(s.phone) === clean);
  }

  return undefined;
}

// Backwards-compatible alias
export const findStaffByPhoneOrId = findStaffByIdentifier;

export function addStaffMemberRecord(input: {
  name: string;
  phone: string;
  email?: string;
  role: StaffRole;
}): StaffMember {
  const normalized = normalizePhone(input.phone);
  const cleanEmail = input.email ? input.email.trim().toLowerCase() : undefined;

  const existing = STAFF_STORE.find((s) => {
    if (cleanEmail && s.email && s.email.toLowerCase() === cleanEmail) return true;
    if (normalized.length >= 10 && normalizePhone(s.phone) === normalized) return true;
    return false;
  });

  if (existing) {
    existing.role = input.role;
    existing.name = input.name;
    if (cleanEmail) existing.email = cleanEmail;
    existing.isActive = true;
    return existing;
  }

  const newStaff: StaffMember = {
    id: `staff_${crypto.randomBytes(4).toString("hex")}`,
    name: input.name,
    phone: input.phone.startsWith("+") ? input.phone : `+91${normalized}`,
    email: cleanEmail,
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
