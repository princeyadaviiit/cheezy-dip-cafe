"use server";

import crypto from "crypto";
import { requireStaffAuth } from "@/lib/auth/server";
import { MENU_ITEMS, type MenuItem } from "@/lib/menu-data";
import { ORDERS_STORE, type OrderRecord } from "@/lib/orders/order-store";
import { type OrderStatus } from "@/components/ui/status-badge";

// In-memory catalog availability overrides
const AVAILABILITY_OVERRIDES: Map<string, boolean> = new Map();

// Cafe operational settings
let CAFE_SETTINGS = {
  isOpen: true,
  deliveryEnabled: true,
  openingHours: "10:00 AM - 11:00 PM",
  minDeliveryOrderMinor: 15000, // ₹150
  deliveryFeeMinor: 3000, // ₹30
};

// Active Tables mapping (mirrors database seed)
const TABLES_STORE: Array<{
  id: string;
  label: string;
  token: string;
  isActive: boolean;
}> = [
  { id: "d0000000-0000-0000-0000-000000000001", label: "Table 1", token: "cd_tbl_tok_01x9a", isActive: true },
  { id: "d0000000-0000-0000-0000-000000000002", label: "Table 2", token: "cd_tbl_tok_02y8b", isActive: true },
  { id: "d0000000-0000-0000-0000-000000000003", label: "Table 3", token: "cd_tbl_tok_03z7c", isActive: true },
  { id: "d0000000-0000-0000-0000-000000000004", label: "Table 4", token: "cd_tbl_tok_04w6d", isActive: true },
  { id: "d0000000-0000-0000-0000-000000000005", label: "Table 5", token: "cd_tbl_tok_05v5e", isActive: true },
  { id: "d0000000-0000-0000-0000-000000000006", label: "Table 6", token: "cd_tbl_tok_06u4f", isActive: true },
];

// Active Staff Members mapping (mirrors database seed)
const STAFF_STORE: Array<{
  id: string;
  clerkUserId: string;
  name: string;
  phone: string;
  role: "kitchen" | "admin" | "owner";
  isActive: boolean;
}> = [
  {
    id: "s0000000-0000-0000-0000-000000000001",
    clerkUserId: "user_owner_default",
    name: "Cafe Owner",
    phone: "+919876543210",
    role: "owner",
    isActive: true,
  },
  {
    id: "s0000000-0000-0000-0000-000000000002",
    clerkUserId: "user_admin_vikram",
    name: "Vikram Admin",
    phone: "+919876543211",
    role: "admin",
    isActive: true,
  },
  {
    id: "s0000000-0000-0000-0000-000000000003",
    clerkUserId: "user_kitchen_chef_amit",
    name: "Chef Amit",
    phone: "+919876543212",
    role: "kitchen",
    isActive: true,
  },
];

export async function getAllAdminOrders(statusFilter?: OrderStatus): Promise<OrderRecord[]> {
  await requireStaffAuth();

  const all = Array.from(ORDERS_STORE.values()).sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
  );

  if (statusFilter) {
    return all.filter((ord) => ord.orderStatus === statusFilter);
  }
  return all;
}

export async function getAdminMenuCatalog(): Promise<
  Array<MenuItem & { effectiveAvailable: boolean }>
> {
  await requireStaffAuth();

  return MENU_ITEMS.map((item) => {
    const override = AVAILABILITY_OVERRIDES.get(item.id);
    return {
      ...item,
      effectiveAvailable: override !== undefined ? override : item.isAvailable,
    };
  });
}

export async function toggleMenuItemAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<{ itemId: string; isAvailable: boolean }> {
  const staff = await requireStaffAuth();
  if (staff.role !== "admin" && staff.role !== "owner") {
    throw new Error("UNAUTHORIZED: Only admin or owner can toggle menu item availability.");
  }

  AVAILABILITY_OVERRIDES.set(itemId, isAvailable);
  return { itemId, isAvailable };
}

export async function getCafeSettings() {
  await requireStaffAuth();
  return CAFE_SETTINGS;
}

export async function updateCafeSettings(updates: Partial<typeof CAFE_SETTINGS>) {
  const staff = await requireStaffAuth();
  if (staff.role !== "admin" && staff.role !== "owner") {
    throw new Error("UNAUTHORIZED: Only admin or owner can update cafe operational settings.");
  }

  CAFE_SETTINGS = {
    ...CAFE_SETTINGS,
    ...updates,
  };
  return CAFE_SETTINGS;
}

export async function getTablesList() {
  await requireStaffAuth();
  return TABLES_STORE;
}

export async function rotateTableToken(tableId: string): Promise<string> {
  const staff = await requireStaffAuth();
  if (staff.role !== "admin" && staff.role !== "owner") {
    throw new Error("UNAUTHORIZED: Only admin or owner can rotate table QR tokens.");
  }

  const table = TABLES_STORE.find((t) => t.id === tableId);
  if (!table) {
    throw new Error(`Table with ID '${tableId}' not found.`);
  }

  const newToken = `cd_tbl_tok_${crypto.randomBytes(4).toString("hex")}`;
  table.token = newToken;
  return newToken;
}

export async function getStaffList() {
  const staff = await requireStaffAuth();
  if (staff.role !== "owner") {
    // Admins see staff, but owner has full list
  }
  return STAFF_STORE;
}
