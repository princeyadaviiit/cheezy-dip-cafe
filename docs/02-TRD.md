# 02. Technical Requirements Document (TRD)

**Project:** Cheezy dip cafe ordering platform
**Date:** 17 October 2026
**Audience:** Developer and AI coding agent (Google Antigravity)

Version numbers below are policy, not pins. At implementation time the agent must read the current official docs and `package.json`, and record the exact versions used in `MEMORY.md`.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router), TypeScript strict | Use the latest stable version that the installed Clerk SDK supports. Next.js 16 renamed `middleware.ts` to `proxy.ts`; check which applies. |
| Styling | Tailwind CSS plus CSS variables for design tokens | UI primitives may use Radix/shadcn, but must be fully restyled to the brand. No default look. |
| Auth | Clerk, phone number + OTP | See section 3 for the SMS constraint. |
| Database | Supabase PostgreSQL | Migrations in repo. RLS on every table. |
| Realtime | Supabase Realtime (postgres changes) | Staff and customers both have Clerk sessions, so RLS-scoped realtime is possible. |
| Storage | Supabase Storage | Menu images, brand assets. Public read for menu images only. |
| Payments | Razorpay (Orders API, Checkout, Webhooks, Refunds API) | Delivery only by default. Amounts in paise. |
| Validation | Zod | Every server input. |
| Push | Web Push (VAPID) | For background alerts to staff devices. |
| Tests | Vitest (unit/integration), Playwright (e2e, mobile viewports) | |
| Hosting | Vercel (Pro for commercial use) + Supabase Pro | Hobby/free tiers are for development only. |
| Source control / CI | GitHub, GitHub Actions | Lint, typecheck, test, build on every PR. |

---

## 2. Route map

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Animated landing page, View Menu / Order |
| `/menu` | Public | Read-only menu with prices (no cart controls, an Order button per item) |
| `/t/[token]` | Public | Table QR entry. Resolves token, stores table context, redirects to `/menu` |
| `/sign-in` | Public | Clerk phone OTP, accepts `redirect_url` |
| `/order` | Customer | Ordering home (same menu with add-to-cart) |
| `/order/cart` | Customer | Cart |
| `/order/checkout` | Customer | Order type, address, coupon, payment choice |
| `/order/orders` | Customer | Own order history |
| `/order/orders/[id]` | Customer (owner of order) | Live tracking and receipt |
| `/order/account` | Customer | Name, phone, addresses |
| `/kitchen` | Kitchen, admin, owner | Kitchen display |
| `/admin` | Admin, owner | Dashboard home (live orders, quick toggles) |
| `/admin/orders`, `/admin/menu`, `/admin/tables`, `/admin/coupons`, `/admin/delivery`, `/admin/reports`, `/admin/customers`, `/admin/settings` | Admin, owner | Management screens |
| `/admin/staff` | Owner | Staff and roles |
| `/terms`, `/privacy`, `/refund-policy`, `/delivery-policy`, `/contact` | Public | Legal and contact |
| `/api/webhooks/razorpay` | Signature only | Razorpay events |
| `/api/webhooks/clerk` | Signature only | Optional user sync |
| `/api/cron/expire-orders` | Secret header | Expire stale pending-payment orders |

Route protection in the proxy/middleware is for navigation only. **Every server action and route handler must authorize again.**

---

## 3. Authentication (Clerk phone OTP)

Facts verified from Clerk's current documentation on 17 October 2026:

- Phone sign-in with OTP is supported.
- Phone/SMS **requires a paid Clerk plan for production**; development mode is free.
- SMS only works for countries enabled on the instance **SMS allowlist. By default only the US and Canada are enabled**, so India (+91) must be enabled in the Clerk dashboard.
- Clerk's per-SMS price for India was **not** verified. The owner must check the current price in the Clerk dashboard before launch (OD-12).

Implementation rules:

1. Enable phone number as the identifier. Disable email/password for customers unless OD-13 says otherwise.
2. Enable only **India** on the SMS allowlist. This limits SMS-pumping abuse.
3. Enable Clerk bot protection and keep Clerk's resend cooldown.
4. Use the official Clerk + Supabase **third-party auth integration** (not the old JWT template). Reference: `clerk/clerk-supabase-nextjs` and the two official guides linked in `07-REPO-ANALYSIS.md`.
5. Customer identity key everywhere is the Clerk `sub` (user id), stored as `text`.
6. Role comes from `staff_members` (trusted table), never from a client-editable field or a user-editable Clerk metadata field.
7. Seed the first owner by phone number through a documented one-time procedure (SQL or admin script, run by the developer, never exposed as a public route).
8. Staff are added by the owner entering a phone number; the first time that number logs in, the row binds to the Clerk user id.

---

## 4. Data access pattern

This is the central security design decision (ADR-2 in `03-ARCHITECTURE.md`).

| Operation | How |
|---|---|
| Public menu reads | Anonymous Supabase client, RLS allows select of active menu rows only. Cached with Next.js tags. |
| Customer reads (own orders, addresses) | User-scoped Supabase client with the Clerk token. RLS filters by `sub`. |
| Staff reads (all orders) | User-scoped client. RLS allows rows if the caller is an active staff member. |
| **All writes** (orders, payments, status changes, menu edits, settings) | Next.js server code only. Authorize with Clerk session + staff role lookup, validate with Zod, then write using a server-only service-role client inside narrow service functions. |
| Realtime | Client subscribes with the user-scoped token. RLS decides which rows are delivered. |

`authenticated` and `anon` database roles get **no** insert/update/delete grants on orders, order_items, payments, refunds, staff_members or settings. Writes cannot bypass the server even if a client bug exists.

The service-role key lives in a module marked `server-only` and is never imported by client components.

---

## 5. Database schema

Money is stored as integer **paise** (`*_minor` columns). Ids are `uuid` unless noted. All tables have `created_at`; mutable ones have `updated_at`. Enable RLS on all.

### 5.1 Enums

```
order_type        : dine_in | delivery
order_status      : pending_payment | placed | accepted | preparing | ready
                  | served | out_for_delivery | delivered | completed
                  | rejected | cancelled | expired
payment_method    : razorpay | pay_at_counter
payment_status    : not_required | pending | paid | failed
                  | partially_refunded | refunded
staff_role        : kitchen | admin | owner
```

### 5.2 Tables

| Table | Key columns | Purpose |
|---|---|---|
| `profiles` | `clerk_user_id` (pk, text), `display_name`, `phone_e164` (unique), `is_blocked`, `blocked_reason` | Customer profile and block flag |
| `staff_members` | `clerk_user_id` (nullable until first login), `phone_e164` (unique), `role`, `active`, `created_by` | Trusted role source |
| `addresses` | `id`, `clerk_user_id`, `label`, `recipient_name`, `phone`, `line1`, `line2`, `landmark`, `area`, `pincode`, `city`, `is_default`, `deleted_at` | Delivery addresses |
| `categories` | `id`, `name`, `slug`, `sort_order`, `is_active` | Menu groups |
| `menu_items` | `id`, `category_id`, `slug`, `name`, `description`, `price_minor`, `image_path`, `diet` (veg/non_veg/egg), `is_available`, `is_active`, `sort_order` | Products |
| `modifier_groups` | `id`, `name`, `required`, `min_select`, `max_select` | Option groups (for example "Choose a dip") |
| `modifier_options` | `id`, `group_id`, `name`, `price_delta_minor`, `is_available` | Options |
| `menu_item_modifier_groups` | `menu_item_id`, `modifier_group_id`, `sort_order` | Links |
| `dining_tables` | `id`, `label`, `qr_token` (unique), `is_active`, `token_rotated_at` | Tables and permanent QR |
| `delivery_areas` | `id`, `pincode`, `area_name`, `fee_minor` (nullable override), `is_active` | Delivery allow-list |
| `coupons` | `id`, `code` (unique, citext), `type` (flat/percent), `value`, `min_order_minor`, `max_discount_minor`, `valid_from`, `valid_to`, `usage_limit`, `per_user_limit`, `is_active` | Offers |
| `coupon_redemptions` | `coupon_id`, `order_id` (unique), `clerk_user_id` | Atomic usage tracking |
| `orders` | see 5.3 | Order header |
| `order_items` | `id`, `order_id`, `menu_item_id`, `name_snapshot`, `unit_price_minor`, `quantity`, `modifiers_snapshot` (jsonb), `line_total_minor`, `note` | Immutable snapshot |
| `payments` | `id`, `order_id`, `provider`, `provider_order_id` (unique), `provider_payment_id`, `amount_minor`, `currency`, `status`, `method` | Payment tracking |
| `refunds` | `id`, `payment_id`, `provider_refund_id`, `amount_minor`, `status`, `initiated_by`, `reason` | Refunds |
| `payment_webhook_events` | `provider_event_id` (pk), `event_type`, `received_at`, `processed_at`, `result` | Idempotency |
| `order_status_events` | `id`, `order_id`, `actor_clerk_id`, `old_status`, `new_status`, `created_at` | Audit of every transition |
| `cafe_settings` | `key` (pk), `value` (jsonb) | Open/closed, hours, delivery on/off, fee rules, payment toggles, tax mode |
| `push_subscriptions` | `id`, `clerk_user_id`, `endpoint` (unique), `p256dh`, `auth`, `role_at_subscribe` | Web Push targets |
| `audit_log` | `id`, `actor_clerk_id`, `action`, `entity`, `entity_id`, `diff` (jsonb) | Sensitive actions |
| `order_counters` | `day` (pk), `last_value` | Friendly order numbers such as `CD-0142` |

### 5.3 `orders` columns

`id`, `order_number` (unique), `customer_clerk_id`, `order_type`, `order_status`, `payment_method`, `payment_status`, `table_id` (nullable), `delivery_address_snapshot` (jsonb, nullable), `contact_phone`, `customer_note`, `subtotal_minor`, `discount_minor`, `delivery_fee_minor`, `tax_minor`, `total_minor`, `coupon_code`, `idempotency_key`, `placed_at`, `accepted_at`, `ready_at`, `completed_at`, `cancel_reason`.

Constraints:
- `unique (customer_clerk_id, idempotency_key)`
- `check (order_type <> 'dine_in' or table_id is not null)`
- `check (order_type <> 'delivery' or delivery_address_snapshot is not null)`
- `check (order_type <> 'delivery' or payment_method = 'razorpay')` unless OD-01 changes this
- `check (total_minor >= 0)`

### 5.4 RLS sketch

Helper (security definer, stable): `is_active_staff()` returns true if `staff_members` has an active row with `clerk_user_id = auth.jwt()->>'sub'`.

```sql
-- Customers read their own orders
create policy "own orders" on public.orders
  for select to authenticated
  using (customer_clerk_id = (select auth.jwt() ->> 'sub'));

-- Staff read all orders
create policy "staff read orders" on public.orders
  for select to authenticated
  using ((select public.is_active_staff()));

-- Public menu: only active rows
create policy "public menu" on public.menu_items
  for select to anon, authenticated
  using (is_active = true);
```

No insert/update/delete policies exist for client roles on write-protected tables. Follow current Supabase docs for the exact Clerk JWT claims, and test every policy (section 14).

---

## 6. Order lifecycle

### 6.1 Dine-in (pay at counter)

```
placed -> accepted -> preparing -> ready -> served -> completed
   \-> rejected          \-> cancelled (staff, with reason)
```
`payment_status`: `pending` at placement, set to `paid` when staff confirm receipt. An order may be `served` before it is paid; it may not be `completed` until `paid`.

### 6.2 Delivery (Razorpay)

```
pending_payment -> placed (paid) -> accepted -> preparing -> ready
                                  -> out_for_delivery -> delivered -> completed
pending_payment -> expired (no payment within 15 minutes)
placed|accepted -> rejected | cancelled  => refund flow
```
The kitchen never sees `pending_payment`.

### 6.3 Rules

- Transitions are defined once in `lib/orders/state-machine.ts` as an allow-list keyed by order type and actor role. Everything else is rejected.
- Customer may cancel only while `placed` (and policy OD-06 permits).
- Every transition writes `order_status_events`.
- Status and payment status are independent fields.

---

## 7. Checkout and payments

### 7.1 `placeOrder` (server action or route handler)

Input (Zod): `orderType`, `items[{menuItemId, quantity, optionIds[], note}]`, `couponCode?`, `addressId?` (delivery), `paymentMethod`, `customerNote?`, `idempotencyKey`.

Table id for dine-in is **not** an input. It is read from the signed table cookie set by `/t/[token]`.

Steps:
1. Authenticate (Clerk). Reject if `profiles.is_blocked`.
2. Reject if the cafe is closed or the order type is switched off.
3. Reload items, options, availability, prices from the database. Reject unavailable or invalid choices.
4. Validate option min/max rules and quantity limits.
5. Dine-in: validate table cookie, table active. Delivery: validate address belongs to the user and pincode is in `delivery_areas`; enforce minimum order.
6. Compute subtotal, coupon discount (re-validated, atomic redemption), delivery fee, tax (per OD-05), total, all in paise.
7. Enforce allowed payment method for the order type.
8. In one transaction: insert `orders` (idempotency key unique), `order_items` snapshots, order number.
9. Dine-in: set `order_status = placed`, `payment_status = pending`, notify staff. Done.
10. Delivery: set `pending_payment`, create Razorpay order for `total_minor`, store `payments` row with `provider_order_id`, return `{ orderId, razorpayOrderId, keyId, amount }`.

### 7.2 Razorpay completion

1. Browser opens Razorpay Checkout with the public key id and the server-created order id.
2. Browser posts `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` to `/api/payments/razorpay/verify`.
3. Server verifies the signature (HMAC-SHA256 of `order_id|payment_id` with the key secret), confirms the payment matches the stored order, amount and currency, then marks paid and moves the order to `placed`.
4. The webhook (`payment.captured` / `order.paid`, `payment.failed`, refund events) independently confirms the same outcome. Verify `X-Razorpay-Signature` against the **raw body** with the webhook secret. De-duplicate by event id.
5. Both paths call the same idempotent function `markOrderPaid(orderId, providerPaymentId)`. Whichever arrives first wins; the second is a no-op.
6. A browser callback alone never marks an order paid without the server signature check, and the kitchen is only notified after the server records `paid`.

Always confirm exact header names, event names and signature steps against the current Razorpay docs during implementation.

### 7.3 Stale and failed payments

- Cron every few minutes: for `pending_payment` orders older than 15 minutes, fetch the Razorpay order/payment status. If paid, repair state; otherwise set `expired`.
- User closes Checkout: order stays `pending_payment`; customer can retry with the same order within the window.
- Duplicate submit: idempotency key returns the existing order.

### 7.4 Refunds

Admin or owner only. Server calls Razorpay Refunds API, stores `refunds` row, updates `payment_status`, writes audit entry. Refund webhooks update final state.

### 7.5 Pay at counter

Staff action `markPaidAtCounter(orderId, method: cash|upi|card)` sets `payment_status = paid`, records actor, writes audit entry.

---

## 8. Table QR

- Each `dining_tables` row has a random, non-guessable `qr_token` (at least 12 characters of base32/base62 from a CSPRNG).
- Printed QR encodes `https://<final-domain>/t/<token>`. The domain must be final before printing (OD-10).
- `/t/[token]`: look up active table, set an httpOnly, secure, signed cookie `table_ctx` containing `tableId` and issue time (expires after a few hours), redirect to `/menu`.
- The UI shows "Table N" from the cookie. If no valid cookie exists, dine-in is unavailable and the user is told to scan the QR on their table.
- Admin can rotate a token (old QR stops working) and download a print sheet (PDF with table label, cafe logo and the text "Scan to view menu and order"). Use high error-correction level.
- Abuse limits: per-user active-order cap, per-phone and per-IP rate limits, staff accept/reject step, block flag.

---

## 9. Realtime and notifications

- Kitchen/admin subscribe to `orders` changes through the user-scoped client. On reconnect: refetch the authoritative list, then merge to avoid duplicate cards.
- Customer tracking page subscribes to the single order row (RLS restricts to the owner).
- Foreground alert: Web Audio sound (unlocked by an explicit "Enable alerts" tap), vibration where supported, and a persistent visual banner.
- Background alert: Web Push via VAPID. Subscriptions are stored per staff device. Android Chrome works in the browser; iOS requires the site to be added to the Home Screen. Document this for staff.
- Screen Wake Lock API on the kitchen view.
- If realtime is disconnected, a visible banner shows and a short polling fallback runs.

---

## 10. Caching and performance

- Landing and public menu are server-rendered with caching; admin menu edits call `revalidateTag` so changes appear quickly.
- Images: upload resized and compressed (browser-side or server-side), served as AVIF/WebP with explicit dimensions, blur placeholders, lazy-loaded below the fold.
- Fonts: self-hosted through `next/font`, subset, `display: swap`.
- Keep the landing page script weight small. Heavy animation libraries are not allowed unless justified in `MEMORY.md` with measured cost.
- Skeleton loaders for menu, orders, admin lists.

---

## 11. Environment variables

`.env.example` contains names only.

```dotenv
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # server only

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=                  # server only
RAZORPAY_WEBHOOK_SECRET=              # server only

# App
NEXT_PUBLIC_SITE_URL=
TABLE_COOKIE_SECRET=                  # server only, random 32+ bytes
CRON_SECRET=                          # server only

# Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=                    # server only
VAPID_SUBJECT=
```

Names must match the installed SDK versions; check current docs. Never put a secret under `NEXT_PUBLIC_`.

---

## 12. Repository layout

```
cheezy-dip-cafe/
├── app/
│   ├── (public)/        page.tsx (landing), menu/, t/[token]/, sign-in/, legal pages
│   ├── (customer)/order/ cart/, checkout/, orders/, account/
│   ├── (staff)/         kitchen/, admin/...
│   └── api/             webhooks/razorpay, webhooks/clerk, payments/razorpay/verify, cron/expire-orders
├── components/          menu/, cart/, checkout/, orders/, admin/, kitchen/, ui/
├── lib/                 auth/, supabase/, razorpay/, orders/ (state-machine, pricing), validation/, push/
├── services/            menu-service.ts, order-service.ts, payment-service.ts, table-service.ts, settings-service.ts
├── supabase/            migrations/, seed.sql
├── tests/               unit/, integration/, e2e/
├── docs/                01-PRD.md ... 07-REPO-ANALYSIS.md
├── public/              brand/, icons, manifest
├── AGENTS.md
├── MEMORY.md
└── .env.example
```

Business logic (pricing, state machine, payment) lives in `lib/` and `services/`, never inside presentation components.

---

## 13. Quality gates

Before any phase is marked done: `lint`, `typecheck`, relevant tests, and a production `build` must pass, and the agent must report the real commands and output in `MEMORY.md`. Unrun tests are never reported as passed.

---

## 14. Test plan (acceptance)

**Authorization and isolation**
- Anonymous user cannot read orders, addresses, profiles, payments.
- Customer A cannot read or change Customer B's order or address by changing an id.
- Customer cannot call any write path to set status, payment status, totals or role.
- Non-staff cannot open `/kitchen`, `/admin` or call their actions.
- Kitchen cannot perform admin-only actions (refund, price edit, staff change).

**Pricing and checkout**
- Tampered client price/total is ignored.
- Unavailable item, invalid option, over-max option, zero/negative/huge quantity rejected.
- Coupon expiry, per-user limit and global limit enforced under concurrent use.
- Closed cafe and disabled order type rejected.
- Double submit creates one order.

**Dine-in QR**
- Valid token sets table context; invalid or rotated token fails safely.
- Order for dine-in without a valid table cookie is rejected.
- Staff see the correct table label.

**Delivery and payment**
- Out-of-area pincode rejected; minimum order enforced; fee computed correctly.
- Razorpay test success, failure, user-closed-window, delayed webhook, duplicate webhook, invalid signature, amount mismatch, payment success with browser never returning.
- Browser callback alone cannot mark paid.
- Stale `pending_payment` expires; paid-but-unmarked is repaired by cron.
- Refund full and partial, permission checked, audited.

**Realtime and notifications**
- New order appears on kitchen screen without refresh.
- Reconnect refetches and does not duplicate cards.
- Push received on a registered Android device with the app in background.

**Mobile and UX**
- Playwright runs at 360x800 and 390x844 for landing, menu, login, QR flow, checkout, kitchen, admin.
- Lighthouse mobile budgets from PRD section 5.
- Reduced-motion mode disables landing animation without breaking layout.
- Skeletons and empty/error states exist on every async screen.

**Release**
- No secrets in repo or client bundle (scan).
- All legal pages present and linked.
- Backup restore rehearsed.
