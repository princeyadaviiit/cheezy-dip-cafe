-- Migration: 20261017000002_rls_and_permissions.sql
-- Description: Enforce RLS on all tables, create security definer helpers, and restrict client write grants

-- 1. SECURITY DEFINER HELPERS
CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_members
    WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub')
      AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_staff_role()
RETURNS public.staff_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.staff_members
  WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub')
    AND active = true
  LIMIT 1;
$$;

-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dining_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_counters ENABLE ROW LEVEL SECURITY;

-- 3. REVOKE CLIENT WRITES
-- Hard Rule: All writes run via Next.js server code using service-role key.
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- 4. RLS SELECT POLICIES

-- Public Catalog Read
CREATE POLICY "Public active categories" ON public.categories
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR (SELECT public.is_active_staff()));

CREATE POLICY "Public active menu items" ON public.menu_items
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR (SELECT public.is_active_staff()));

CREATE POLICY "Public modifier groups" ON public.modifier_groups
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Public modifier options" ON public.modifier_options
  FOR SELECT TO anon, authenticated
  USING (is_available = true OR (SELECT public.is_active_staff()));

CREATE POLICY "Public menu modifier link" ON public.menu_item_modifier_groups
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Public active dining tables" ON public.dining_tables
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR (SELECT public.is_active_staff()));

CREATE POLICY "Public active delivery areas" ON public.delivery_areas
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR (SELECT public.is_active_staff()));

CREATE POLICY "Public cafe settings" ON public.cafe_settings
  FOR SELECT TO anon, authenticated
  USING (true);

-- Customer Profiles & Addresses
CREATE POLICY "Customer own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (clerk_user_id = (SELECT auth.jwt() ->> 'sub') OR (SELECT public.is_active_staff()));

CREATE POLICY "Customer own addresses" ON public.addresses
  FOR SELECT TO authenticated
  USING (clerk_user_id = (SELECT auth.jwt() ->> 'sub') AND deleted_at IS NULL);

-- Staff Members
CREATE POLICY "Staff view members" ON public.staff_members
  FOR SELECT TO authenticated
  USING (
    clerk_user_id = (SELECT auth.jwt() ->> 'sub')
    OR (SELECT public.get_current_staff_role() IN ('admin', 'owner'))
  );

-- Orders, Items, Payments & Lifecycle Events
CREATE POLICY "Customer own orders or staff all" ON public.orders
  FOR SELECT TO authenticated
  USING (
    customer_clerk_id = (SELECT auth.jwt() ->> 'sub')
    OR (SELECT public.is_active_staff())
  );

CREATE POLICY "Customer own order items or staff all" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (o.customer_clerk_id = (SELECT auth.jwt() ->> 'sub') OR (SELECT public.is_active_staff()))
    )
  );

CREATE POLICY "Customer own payments or staff all" ON public.payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (o.customer_clerk_id = (SELECT auth.jwt() ->> 'sub') OR (SELECT public.is_active_staff()))
    )
  );

CREATE POLICY "Staff read refunds" ON public.refunds
  FOR SELECT TO authenticated
  USING ((SELECT public.get_current_staff_role() IN ('admin', 'owner')));

CREATE POLICY "Order status events viewable by order owner or staff" ON public.order_status_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (o.customer_clerk_id = (SELECT auth.jwt() ->> 'sub') OR (SELECT public.is_active_staff()))
    )
  );

-- Push subscriptions & Audit Log
CREATE POLICY "Own push subscriptions" ON public.push_subscriptions
  FOR SELECT TO authenticated
  USING (clerk_user_id = (SELECT auth.jwt() ->> 'sub'));

CREATE POLICY "Admin view audit log" ON public.audit_log
  FOR SELECT TO authenticated
  USING ((SELECT public.get_current_staff_role() IN ('admin', 'owner')));
