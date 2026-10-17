-- Migration: 20261017000001_initial_schema.sql
-- Description: Core tables, enums, constraints, and indexes for Cheezy Dip Cafe

-- 1. ENUMS
CREATE TYPE public.order_type AS ENUM ('dine_in', 'delivery');

CREATE TYPE public.order_status AS ENUM (
  'pending_payment',
  'placed',
  'accepted',
  'preparing',
  'ready',
  'served',
  'out_for_delivery',
  'delivered',
  'completed',
  'rejected',
  'cancelled',
  'expired'
);

CREATE TYPE public.payment_method AS ENUM ('razorpay', 'pay_at_counter');

CREATE TYPE public.payment_status AS ENUM (
  'not_required',
  'pending',
  'paid',
  'failed',
  'partially_refunded',
  'refunded'
);

CREATE TYPE public.staff_role AS ENUM ('kitchen', 'admin', 'owner');

-- 2. CUSTOMER & STAFF PROFILES
CREATE TABLE public.profiles (
  clerk_user_id TEXT PRIMARY KEY,
  display_name TEXT,
  phone_e164 TEXT UNIQUE NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  blocked_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE,
  phone_e164 TEXT UNIQUE NOT NULL,
  role public.staff_role NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL REFERENCES public.profiles(clerk_user_id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  landmark TEXT,
  area TEXT NOT NULL,
  pincode TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'New Delhi',
  is_default BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. MENU CATALOG & DINING
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.menu_items (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_minor BIGINT NOT NULL CHECK (price_minor >= 0),
  image_path TEXT NOT NULL,
  diet TEXT NOT NULL DEFAULT 'veg' CHECK (diet IN ('veg', 'non_veg', 'egg')),
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.modifier_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  min_select INT NOT NULL DEFAULT 0,
  max_select INT NOT NULL DEFAULT 1
);

CREATE TABLE public.modifier_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_delta_minor BIGINT NOT NULL DEFAULT 0 CHECK (price_delta_minor >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE public.menu_item_modifier_groups (
  menu_item_id TEXT NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  modifier_group_id UUID NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (menu_item_id, modifier_group_id)
);

CREATE TABLE public.dining_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  qr_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  token_rotated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.delivery_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode TEXT NOT NULL,
  area_name TEXT NOT NULL,
  fee_minor BIGINT DEFAULT NULL CHECK (fee_minor IS NULL OR fee_minor >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. OFFERS & COUPONS
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('flat', 'percent')),
  value INT NOT NULL CHECK (value > 0),
  min_order_minor BIGINT NOT NULL DEFAULT 0 CHECK (min_order_minor >= 0),
  max_discount_minor BIGINT DEFAULT NULL,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_to TIMESTAMPTZ NOT NULL,
  usage_limit INT DEFAULT NULL,
  per_user_limit INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 5. ORDERS & ORDER ITEMS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_clerk_id TEXT NOT NULL,
  order_type public.order_type NOT NULL,
  order_status public.order_status NOT NULL DEFAULT 'placed',
  payment_method public.payment_method NOT NULL,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  table_id UUID REFERENCES public.dining_tables(id),
  delivery_address_snapshot JSONB,
  contact_phone TEXT NOT NULL,
  customer_note TEXT,
  subtotal_minor BIGINT NOT NULL CHECK (subtotal_minor >= 0),
  discount_minor BIGINT NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  delivery_fee_minor BIGINT NOT NULL DEFAULT 0 CHECK (delivery_fee_minor >= 0),
  tax_minor BIGINT NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  total_minor BIGINT NOT NULL CHECK (total_minor >= 0),
  coupon_code TEXT,
  idempotency_key TEXT NOT NULL,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_customer_idempotency UNIQUE (customer_clerk_id, idempotency_key),
  CONSTRAINT chk_dine_in_table CHECK (order_type <> 'dine_in' OR table_id IS NOT NULL),
  CONSTRAINT chk_delivery_address CHECK (order_type <> 'delivery' OR delivery_address_snapshot IS NOT NULL),
  CONSTRAINT chk_delivery_payment CHECK (order_type <> 'delivery' OR payment_method = 'razorpay')
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL,
  name_snapshot TEXT NOT NULL,
  unit_price_minor BIGINT NOT NULL CHECK (unit_price_minor >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  modifiers_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  line_total_minor BIGINT NOT NULL CHECK (line_total_minor >= 0),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. PAYMENTS, REFUNDS & IDEMPOTENCY
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_order_id TEXT UNIQUE NOT NULL,
  provider_payment_id TEXT,
  amount_minor BIGINT NOT NULL CHECK (amount_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status public.payment_status NOT NULL DEFAULT 'pending',
  method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  provider_refund_id TEXT UNIQUE,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  status TEXT NOT NULL DEFAULT 'processed',
  initiated_by TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payment_webhook_events (
  provider_event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  result TEXT
);

CREATE TABLE public.order_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  actor_clerk_id TEXT NOT NULL,
  old_status public.order_status,
  new_status public.order_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. SETTINGS, COUNTERS, PUSH, AUDIT
CREATE TABLE public.cafe_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  role_at_subscribe TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_clerk_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  diff JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.order_counters (
  day TEXT PRIMARY KEY,
  last_value INT NOT NULL DEFAULT 0
);

-- 8. PERFORMANCE INDEXES
CREATE INDEX idx_orders_customer ON public.orders(customer_clerk_id);
CREATE INDEX idx_orders_status ON public.orders(order_status);
CREATE INDEX idx_orders_placed_at ON public.orders(placed_at DESC);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_addresses_user ON public.addresses(clerk_user_id);
CREATE INDEX idx_staff_clerk ON public.staff_members(clerk_user_id) WHERE active = true;
CREATE INDEX idx_dining_tables_token ON public.dining_tables(qr_token);
