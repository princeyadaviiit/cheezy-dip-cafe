import "server-only";
import fs from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  ORDERS_STORE,
  ORDER_RAZORPAY_MAP,
  type OrderRecord,
  type OrderItemSnapshot,
} from "@/lib/orders/order-store";
import { type OrderStatus } from "@/components/ui/status-badge";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  return UUID_REGEX.test(id);
}

export function isRealSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("mock.supabase.co") &&
    !key.includes("mock_service_role_key")
  );
}

// Local file persistence fallback for SSR and dev
const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Ignore FS errors in restricted environments
  }
}

function readDiskOrders(): Record<string, OrderRecord> {
  try {
    ensureDataDir();
    if (!fs.existsSync(ORDERS_FILE)) return {};
    const content = fs.readFileSync(ORDERS_FILE, "utf-8");
    return JSON.parse(content) || {};
  } catch {
    return {};
  }
}

function writeDiskOrder(order: OrderRecord): void {
  try {
    ensureDataDir();
    const diskOrders = readDiskOrders();
    diskOrders[order.id] = order;
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(diskOrders, null, 2), "utf-8");
  } catch {
    // Ignore FS errors
  }
}

/**
 * Persist an order record to global memory, local disk, and Supabase Postgres.
 */
export async function saveOrderRecord(order: OrderRecord): Promise<void> {
  // 1. Update in-memory singleton store
  ORDERS_STORE.set(order.id, order);
  if (order.razorpayOrderId) {
    ORDER_RAZORPAY_MAP.set(order.id, order.razorpayOrderId);
  }

  // 2. Persist to local disk fallback
  writeDiskOrder(order);

  // 3. Persist to Supabase if valid UUID and real database configured
  if (isRealSupabaseConfigured() && isUuid(order.id)) {
    try {
      const tableId =
        order.orderType === "dine_in"
          ? order.tableId && isUuid(order.tableId)
            ? order.tableId
            : "d0000000-0000-0000-0000-000000000001"
          : null;

      const deliverySnapshot =
        order.orderType === "delivery"
          ? order.deliveryAddressSnapshot || {
              recipientName: "Customer",
              phone: order.contactPhone,
            }
          : null;

      const orderRow = {
        id: order.id,
        order_number: order.orderNumber,
        customer_clerk_id: order.customerClerkId,
        order_type: order.orderType,
        order_status: order.orderStatus,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus,
        table_id: tableId,
        delivery_address_snapshot: deliverySnapshot,
        contact_phone: order.contactPhone,
        customer_note: order.customerNote || null,
        subtotal_minor: order.subtotalMinor,
        discount_minor: order.discountMinor,
        delivery_fee_minor: order.deliveryFeeMinor,
        tax_minor: order.taxMinor,
        total_minor: order.totalMinor,
        coupon_code: order.couponCode || null,
        idempotency_key: order.idempotencyKey,
        placed_at: order.placedAt,
        updated_at: order.updatedAt,
      };

      const { error: orderErr } = await supabaseAdmin.from("orders").upsert(orderRow);
      if (orderErr) {
        console.error("[OrderPersistence] Supabase order upsert error:", orderErr);
      }

      // Persist order items
      if (order.items && order.items.length > 0) {
        const itemRows = order.items.map((item) => ({
          order_id: order.id,
          menu_item_id: item.menuItemId,
          name_snapshot: item.nameSnapshot,
          unit_price_minor: item.unitPriceMinor,
          quantity: item.quantity,
          modifiers_snapshot: item.modifiersSnapshot || [],
          line_total_minor: item.lineTotalMinor,
          note: item.note || null,
        }));

        await supabaseAdmin.from("order_items").delete().eq("order_id", order.id);
        const { error: itemErr } = await supabaseAdmin.from("order_items").insert(itemRows);
        if (itemErr) {
          console.error("[OrderPersistence] Supabase order_items insert error:", itemErr);
        }
      }

      // If Razorpay order ID exists, record in payments table
      if (order.razorpayOrderId) {
        await supabaseAdmin.from("payments").upsert(
          {
            order_id: order.id,
            provider: "razorpay",
            provider_order_id: order.razorpayOrderId,
            provider_payment_id: order.razorpayPaymentId || null,
            amount_minor: order.totalMinor,
            currency: "INR",
            status: order.paymentStatus,
            updated_at: order.updatedAt,
          },
          { onConflict: "provider_order_id" }
        );
      }
    } catch (err) {
      console.error("[OrderPersistence] Unexpected error writing to Supabase:", err);
    }
  }
}

/**
 * Update an existing order record across memory, disk, and Supabase.
 */
export async function updateOrderRecord(order: OrderRecord): Promise<void> {
  // 1. In-memory
  ORDERS_STORE.set(order.id, order);
  if (order.razorpayOrderId) {
    ORDER_RAZORPAY_MAP.set(order.id, order.razorpayOrderId);
  }

  // 2. Disk
  writeDiskOrder(order);

  // 3. Supabase
  if (isRealSupabaseConfigured() && isUuid(order.id)) {
    try {
      const { error } = await supabaseAdmin
        .from("orders")
        .update({
          order_status: order.orderStatus,
          payment_status: order.paymentStatus,
          updated_at: order.updatedAt,
        })
        .eq("id", order.id);

      if (error) {
        console.error("[OrderPersistence] Supabase order update error:", error);
      }

      if (order.razorpayOrderId) {
        await supabaseAdmin.from("payments").upsert(
          {
            order_id: order.id,
            provider: "razorpay",
            provider_order_id: order.razorpayOrderId,
            provider_payment_id: order.razorpayPaymentId || null,
            amount_minor: order.totalMinor,
            currency: "INR",
            status: order.paymentStatus,
            updated_at: order.updatedAt,
          },
          { onConflict: "provider_order_id" }
        );
      }
    } catch (err) {
      console.error("[OrderPersistence] Supabase update exception:", err);
    }
  }
}

interface SupabaseOrderRow {
  id: string;
  order_number: string;
  customer_clerk_id: string;
  contact_phone: string;
  order_type: "dine_in" | "delivery";
  order_status: OrderStatus;
  payment_method: "pay_at_counter" | "razorpay";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  table_id: string | null;
  delivery_address_snapshot: Record<string, unknown> | null;
  customer_note: string | null;
  subtotal_minor: number | string;
  discount_minor: number | string;
  delivery_fee_minor: number | string;
  tax_minor: number | string;
  total_minor: number | string;
  coupon_code: string | null;
  idempotency_key: string;
  placed_at: string;
  updated_at: string;
  dining_tables?: { label: string } | null;
  order_items?: Array<{
    menu_item_id: string;
    name_snapshot: string;
    unit_price_minor: number | string;
    quantity: number;
    modifiers_snapshot: Array<{ label: string; priceDeltaMinor: number }>;
    line_total_minor: number | string;
    note: string | null;
  }>;
}

function mapRowToOrderRecord(row: SupabaseOrderRow): OrderRecord {
  const items: OrderItemSnapshot[] = (row.order_items || []).map((it) => ({
    menuItemId: it.menu_item_id,
    nameSnapshot: it.name_snapshot,
    unitPriceMinor: Number(it.unit_price_minor),
    quantity: it.quantity,
    modifiersSnapshot: it.modifiers_snapshot || [],
    lineTotalMinor: Number(it.line_total_minor),
    note: it.note || undefined,
  }));

  return {
    id: row.id,
    orderNumber: row.order_number,
    customerClerkId: row.customer_clerk_id,
    contactPhone: row.contact_phone,
    orderType: row.order_type,
    orderStatus: row.order_status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    tableId: row.table_id || undefined,
    tableLabel: row.dining_tables?.label || undefined,
    deliveryAddressSnapshot: row.delivery_address_snapshot || undefined,
    customerNote: row.customer_note || undefined,
    subtotalMinor: Number(row.subtotal_minor),
    discountMinor: Number(row.discount_minor),
    deliveryFeeMinor: Number(row.delivery_fee_minor),
    taxMinor: Number(row.tax_minor),
    totalMinor: Number(row.total_minor),
    couponCode: row.coupon_code || undefined,
    idempotencyKey: row.idempotency_key,
    items,
    placedAt: row.placed_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Find order by ID, checking memory first, then disk, then Supabase.
 */
export async function findOrderRecordById(orderId: string): Promise<OrderRecord | null> {
  if (!orderId) return null;

  // 1. Check in-memory singleton
  const memOrder = ORDERS_STORE.get(orderId);
  if (memOrder) return memOrder;

  // 2. Check disk fallback
  const diskOrders = readDiskOrders();
  if (diskOrders[orderId]) {
    const order = diskOrders[orderId];
    ORDERS_STORE.set(order.id, order);
    if (order.razorpayOrderId) {
      ORDER_RAZORPAY_MAP.set(order.id, order.razorpayOrderId);
    }
    return order;
  }

  // Also check if orderId is orderNumber in disk
  const diskByNumber = Object.values(diskOrders).find(
    (o) => o.orderNumber === orderId
  );
  if (diskByNumber) {
    ORDERS_STORE.set(diskByNumber.id, diskByNumber);
    return diskByNumber;
  }

  // 3. Check Supabase
  if (isRealSupabaseConfigured()) {
    try {
      let query = supabaseAdmin
        .from("orders")
        .select("*, order_items(*), dining_tables(label)");

      if (isUuid(orderId)) {
        query = query.eq("id", orderId);
      } else {
        query = query.eq("order_number", orderId);
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        const order = mapRowToOrderRecord(data as unknown as SupabaseOrderRow);

        // Hydrate Razorpay IDs from payments table if present
        const { data: payData } = await supabaseAdmin
          .from("payments")
          .select("provider_order_id, provider_payment_id")
          .eq("order_id", order.id)
          .maybeSingle();

        if (payData) {
          order.razorpayOrderId = payData.provider_order_id;
          order.razorpayPaymentId = payData.provider_payment_id || undefined;
        }

        ORDERS_STORE.set(order.id, order);
        if (order.razorpayOrderId) {
          ORDER_RAZORPAY_MAP.set(order.id, order.razorpayOrderId);
        }
        writeDiskOrder(order);
        return order;
      }
    } catch (err) {
      console.error("[OrderPersistence] Supabase find error:", err);
    }
  }

  return null;
}

/**
 * Load all order records across Supabase, disk, and in-memory.
 */
export async function loadAllOrderRecords(): Promise<OrderRecord[]> {
  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .select("*, order_items(*), dining_tables(label)")
        .order("placed_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const order = mapRowToOrderRecord(row as unknown as SupabaseOrderRow);
          ORDERS_STORE.set(order.id, order);
          writeDiskOrder(order);
        }
      }
    } catch (err) {
      console.error("[OrderPersistence] Supabase loadAll error:", err);
    }
  }

  // Merge with disk orders
  const diskOrders = readDiskOrders();
  for (const order of Object.values(diskOrders)) {
    if (!ORDERS_STORE.has(order.id)) {
      ORDERS_STORE.set(order.id, order);
    }
  }

  return Array.from(ORDERS_STORE.values()).sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
  );
}
