# 03. Architecture

**Project:** Cheezy dip cafe ordering platform
**Date:** 17 October 2026

---

## 1. System context

```
 Customer phone                         Staff phone / tablet
 (browse, order, track)                 (kitchen + admin, PWA-capable)
        |                                        |
        +----------------- HTTPS ----------------+
                              |
                    +---------v----------+
                    |  Next.js on Vercel |
                    |  - Server components (public pages, cached)
                    |  - Server actions / route handlers (all writes)
                    |  - Proxy: navigation guard only
                    +----+----------+----+
                         |          |
          Clerk session  |          |  service-role (server only)
                         |          |
                 +-------v--+   +---v-----------------+     +-----------+
                 |  Clerk   |   |  Supabase           |     | Razorpay  |
                 | phone OTP|   |  Postgres + RLS     |<--->| orders,   |
                 | sessions |   |  Realtime, Storage  |     | webhooks, |
                 +----------+   +---------------------+     | refunds   |
                                                            +-----------+
                         Web Push service (browser vendors) <-- server sends VAPID push
```

---

## 2. Trust boundaries

| Zone | Trusted? | Examples |
|---|---|---|
| Browser | Untrusted | Any value in a request: prices, totals, table id, role, payment result |
| Next.js server code | Trusted after authentication and authorization | Pricing engine, state machine, payment verification |
| Supabase with RLS | Trusted data store, protects reads | Policies keyed on Clerk `sub` and staff table |
| Razorpay | Trusted only through signature verification | Checkout signature, webhook signature |
| Clerk | Trusted for identity, not for permissions | A valid session says who, not what they may do |

---

## 3. Component responsibilities

| Component | Responsibility | Must not |
|---|---|---|
| Landing and public menu | Render brand experience and prices, cached | Reveal any private data |
| Customer app (`/order/*`) | Cart, checkout UI, tracking | Decide prices, payment status, table, or role |
| Table entry (`/t/[token]`) | Resolve token to table, set signed cookie | Accept a table id from the URL directly |
| `order-service` | Pricing, validation, order creation, state transitions | Be called from client components directly |
| `payment-service` | Razorpay order creation, signature verification, idempotent `markOrderPaid`, refunds | Trust browser callbacks |
| `table-service` | Token creation/rotation, QR sheet | Expose tokens to non-admins |
| `settings-service` | Open/closed, delivery rules, payment toggles | Allow non-admin writes |
| Kitchen/admin UI | Present orders, call server actions | Hold secrets or bypass authorization |
| Realtime layer | Push row changes to authorized subscribers | Replace the server as source of truth |
| Notification service | Web Push to staff subscriptions | Include private customer data in push payloads beyond what is necessary (order number, type, table) |
| Cron | Expire and reconcile pending payments | Run without the secret header |

---

## 4. Key flows

### 4.1 Visitor to first order

```
Landing  -- View Menu --> /menu (public)
   |
   +-- Order --> /order  -- not signed in --> /sign-in?redirect_url=/order
                                  |
                          phone + OTP (Clerk)
                                  |
                          back to /order with cart and table context preserved
```

### 4.2 Dine-in by table QR

```
Scan QR -> /t/{token}
   server: token -> active table -> set signed cookie table_ctx -> redirect /menu
Customer: Order -> login if needed -> cart -> checkout (Pay at counter)
   server placeOrder: read table from cookie (not from request body)
                      validate, price, insert order (placed, payment pending)
                      notify staff (realtime + push)
Staff: accept -> preparing -> ready -> served -> mark paid -> completed
```

### 4.3 Delivery with Razorpay

```
Checkout (delivery) -> placeOrder
   server: validate address/pincode, price, insert order (pending_payment)
           create Razorpay order (amount in paise) -> store payments row
Browser: Razorpay Checkout (public key id + order id)
Browser -> POST /api/payments/razorpay/verify (order id, payment id, signature)
   server: verify HMAC, match stored amount/order -> markOrderPaid (idempotent)
Razorpay -> POST /api/webhooks/razorpay (raw body + signature)
   server: verify signature, dedupe by event id -> markOrderPaid (same function)
markOrderPaid: order -> placed, payment -> paid, notify kitchen
Kitchen: accepted -> preparing -> ready -> out_for_delivery -> delivered
Cron: expire stale pending_payment, repair paid-but-unmarked
```

### 4.4 New-order alert

```
order becomes placed
   -> Supabase Realtime row change -> kitchen/admin clients (RLS-scoped)
   -> server sends Web Push to staff subscriptions
Client: sound (after "Enable alerts" tap) + vibration + persistent banner
Fallback: reconnect banner + refetch list
```

---

## 5. Deployment topology

| Environment | Hosting | Data | Payments/Auth |
|---|---|---|---|
| Local | `npm run dev` | Supabase dev project or local CLI | Clerk dev instance, Razorpay test keys |
| Preview | Vercel preview per PR | Supabase staging project | Clerk dev, Razorpay test |
| Production | Vercel Pro | Supabase Pro production project | Clerk production, Razorpay live (after test sign-off) |

Never point preview or local at production data. Production secrets live only in the hosting provider's secret store.

---

## 6. Architecture decision records

### ADR-1. Build greenfield, do not fork a repository
**Decision:** Start a new Next.js project. Borrow ideas from the analysed repos, copy no code.
**Why:** No analysed repo combines Clerk phone OTP, server-verified Razorpay, table QR and delivery. Each fork would force a rewrite of auth and payments, the two riskiest parts. No LICENSE file was visible in the root listing of the three cafe/restaurant repos, which means copying their code is not safe by default. See `07-REPO-ANALYSIS.md`.

### ADR-2. All writes go through the server
**Decision:** Clients read through RLS; every mutation runs in server code with explicit authorization and Zod validation, using a server-only service-role client.
**Why:** Prices, payment status, table and roles must not be client-influenced. Removing write grants from client roles makes bypass impossible even if the UI has a bug.
**Trade-off:** More server code than direct client writes. Accepted.

### ADR-3. Clerk phone OTP with Supabase third-party auth
**Decision:** Clerk handles login; Supabase trusts Clerk tokens; roles live in `staff_members`.
**Why:** Matches the client's requested login and the stack already chosen.
**Constraints:** Clerk SMS needs a paid plan in production and India must be enabled on the SMS allowlist. Cost to be confirmed (OD-12).

### ADR-4. Realtime plus Web Push for alerts
**Decision:** Supabase Realtime for live lists, Web Push for background alerts, wake lock on the kitchen screen.
**Why:** Mobile browsers throttle background tabs and restrict autoplay audio. Realtime alone will miss orders when a phone sleeps.
**Note:** One analysed repo (Thaliq) fell back to polling because its staff and customers had no auth session. Here every actor has a Clerk session, so scoped realtime works.

### ADR-5. Delivery area by pincode/area list
**Decision:** Allow-list of pincodes or area names with optional per-area fee.
**Why:** Simple, predictable, no map API cost, easy for the owner to edit. Radius or GPS can come later.

### ADR-6. Integer paise for money
**Decision:** All amounts are integers in paise. Razorpay also uses paise.
**Why:** Avoids floating-point errors and unit mismatches.

### ADR-7. Permanent QR token indirection
**Decision:** The QR encodes `/t/<random token>`, not a table number.
**Why:** Prevents guessing other tables, allows rotation if abused, and the QR never changes when menu or prices change. The only thing that invalidates printed QRs is a domain change, so the domain is fixed first.

### ADR-8. Single codebase for customer, kitchen and admin
**Decision:** One Next.js app with route groups and role guards.
**Why:** One cafe, one deployment, less maintenance.

---

## 7. Failure and recovery

| Failure | Behavior |
|---|---|
| Browser closes during payment | Order stays `pending_payment`; retry within window; cron repairs or expires |
| Webhook delayed or duplicated | Idempotent `markOrderPaid`; event id de-duplication |
| Webhook never arrives | Browser verify path or cron reconciliation marks paid |
| Realtime drops | Banner, polling fallback, refetch on reconnect |
| Supabase or Razorpay outage | Clear error messages; no partial state (transactional order creation) |
| Staff phone sleeps | Web Push alert plus wake lock on the kitchen screen |
| Abusive QR use | Rotate token, block number, rate limits |
| Bad deploy | Vercel instant rollback; migrations are forward-only and reviewed |
