# 07. Repository Analysis

**Date:** 17 October 2026
**Purpose:** Decide the best starting point for Cheezy dip cafe.
**Verdict:** Build a new project. Use the repos as references for ideas only. Copy no code.

## 1. How this analysis was done, and its limits

I opened the GitHub pages and READMEs of four repos and the official Clerk + Supabase demo on 17 October 2026, and checked Clerk's current docs for phone login. I did **not** clone any repo, read source code, run any build, or inspect migrations, RLS policies or payment handlers. Everything below is from public README text and file listings. Treat "claims" as claims until code is audited.

KitchenAsty (different framework, ORM, auth and payment gateway) was **not re-opened** this session. Its notes come from the earlier architecture plan only, and it is excluded from the shortlist because adapting it would be a port, not a head start.

## 2. Requirements the baseline must meet

| Requirement | Why it matters |
|---|---|
| Clerk phone OTP for customers | Client requirement |
| Dine-in via permanent table QR, ordering attached to table | Client requirement |
| Delivery with address and area rules | Client requirement |
| Razorpay with server-side signature and webhook verification | Client requirement and top security risk |
| Pay at counter flow | Client requirement |
| Realtime new-order alerts for staff | Client requirement |
| Mobile-first admin | Client requirement |
| Single cafe | Avoids unneeded complexity |
| Clear license permitting reuse | Commercial client project |

## 3. Findings per repository

### Thaliq (Samirsain/Thaliq)
**What it is:** A multi-tenant restaurant SaaS (QR menu, kitchen display, waiter/cashier flows, analytics). Next.js, TypeScript, Tailwind v4, shadcn/ui, Supabase. 11 commits, 0 stars. The default branch shown is `claude/thaliq-saas-prd-qluyf1`.

**Useful ideas**
- QR route shape `/menu/[restaurant]/[branch]/[table]` and table-scoped ordering.
- `table_sessions`, `order_status_history` and a full status lifecycle.
- Prices re-fetched from the database and coupons re-validated inside `placeOrder`.
- Atomic coupon-redemption counter function.
- Client-side image compression to WebP before upload, per-folder storage RLS.
- QR links embed the site URL, so the domain must be final before printing. (Same lesson applies here.)
- `AGENTS.md` and `docs/` approach for agent work.

**Mismatches**
- Customers never authenticate. Our flow requires phone OTP.
- Staff use a 4-digit PIN with a custom cookie and the service-role client. Our staff use Clerk sessions and RLS.
- Multi-tenant by design (restaurants, branches, subscriptions, platform admin). We are single-cafe.
- Uses polling (`router.refresh()`) because unauthenticated actors cannot use RLS-scoped Realtime. We can use Realtime.
- Payment is manual UPI QR confirmed by cashier. No Razorpay, no delivery flow.
- No LICENSE file visible in the root listing.

**Verdict:** Best conceptual reference for the table-QR ordering flow. Not a base to fork, since the tenancy model and auth model would be rewritten.

### Blossom Cafe (Himkush1414/blossom-cafe)
**What it is:** A live cafe site (theblossomcafe.in) with ordering, reservations, events, kitchen mode with bill printing, coupons, analytics. Next.js 15, TypeScript, Supabase Auth, Razorpay, Vercel. 100 commits, 12 stars. Contains a `.bolt` folder, which suggests it was started with an AI builder.

**Useful ideas**
- Order types delivery, takeaway and dine-in with delivery charges.
- Coupon engine, availability toggles reflected live, kitchen display, browser-based bill printing.
- Real Razorpay usage in production (reported).

**Concerns**
- The README lists only `NEXT_PUBLIC_RAZORPAY_KEY_ID` in environment variables, with no Razorpay secret or webhook secret. That suggests server-side signature or webhook verification may be missing. **Not verified in code.**
- README lists only the Supabase anon key, which raises the question of whether writes happen from the client under RLS. **Not verified in code.**
- Supabase Auth and guest mode, not Clerk.
- Reservations, event booking and a mouse-tracking 3D admin background are outside our scope and conflict with the design rules.
- It is one real cafe's brand and live site. Reusing its look or content would be inappropriate.
- No LICENSE file visible in the root listing.

**Verdict:** Good feature checklist and a reminder of the delivery/print needs. Do not fork; payment trust is unproven.

### Restaurant Ordering App (nadeem521328/restaurant-ordering-app)
**What it is:** A single-restaurant ordering app deployed for a real restaurant. Next.js 16, TypeScript, Supabase Auth, RLS plus admin allowlist table, Zod, Realtime, API routes. 14 commits.

**Useful ideas**
- Single-restaurant scope matches ours.
- Server-side order creation, service-role key restricted to the server, admin allowlist via table, Zod validation, Realtime for admin.
- Open/closed/sold-out controls; `tel:` link for calling customers.
- `proxy.ts` and a `services/` folder, close to the structure in TRD.

**Mismatches**
- Cash on delivery only, no online payments, no accounts for customers, no table QR, no delivery rules beyond COD.
- Supabase Auth instead of Clerk.
- No LICENSE file visible in the root listing.

**Verdict:** The closest model for the security pattern (server-side writes, allowlist, RLS). Reference only.

### Clerk + Supabase + Next.js demo (clerk/clerk-supabase-nextjs)
**What it is:** The official companion repo to Clerk's Supabase integration guide. 78 stars, 13 commits.

**Useful**
- Uses the native third-party auth integration and RLS on Clerk user ids. This is the integration pattern we need.
- Env names use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

**Limits**
- Auth demo only, not a cafe product. Uses `middleware.ts` and pnpm; check the current Next.js and Clerk docs before copying patterns.

**Verdict:** Authoritative integration reference. Use it with the two official guides.

## 4. Comparison

| Need | Thaliq | Blossom | Restaurant Ordering | Clerk demo |
|---|---|---|---|---|
| Clerk phone OTP | No | No | No | Clerk yes, phone not demonstrated |
| Table QR dine-in | Yes (strong) | Table map and dine-in | No | No |
| Delivery | No | Yes | COD only | No |
| Razorpay | No | Claimed; verification unproven | No | No |
| Pay at counter | Cashier flow | Unclear | COD | No |
| Realtime alerts | Polling | Kitchen mode (details unknown) | Realtime | No |
| Single cafe | No (multi-tenant) | Yes | Yes | n/a |
| RLS and server writes | RLS yes, mixed service-role use | Unknown | Yes, described | RLS demo |
| License visible | No | No | No | Not checked |

No repo covers more than a fraction of the requirements, and the missing parts (Clerk phone auth, verified Razorpay, QR plus delivery together) are the hardest ones.

## 5. Decision

1. **Greenfield Next.js project** following `02-TRD.md`.
2. **Ideas borrowed (re-implemented, not copied):** Thaliq's table-QR flow and atomic coupon logic; Restaurant Ordering App's server-write plus allowlist pattern; Blossom Cafe's feature checklist for delivery and printable bills; Clerk demo's auth and RLS wiring.
3. **No code copy.** None of the three cafe/restaurant repos shows a LICENSE file in its root listing. Without a license, code is not free to reuse. If the developer later wants to reuse specific code, check the license file directly and get written permission from the author.
4. **Audit if anything is reused:** read the code, check migrations and RLS, hunt for hard-coded secrets, insecure admin checks and unverified payment flows, and record the commit SHA.

## 6. Reference links

- Thaliq: https://github.com/Samirsain/Thaliq
- Blossom Cafe: https://github.com/Himkush1414/blossom-cafe
- Restaurant Ordering App: https://github.com/nadeem521328/restaurant-ordering-app
- Clerk + Supabase + Next.js demo: https://github.com/clerk/clerk-supabase-nextjs
- Clerk and Supabase integration guide: https://clerk.com/docs/guides/development/integrations/databases/supabase
- Supabase third-party auth with Clerk: https://supabase.com/docs/guides/auth/third-party/clerk
- Clerk sign-up and sign-in options (phone, SMS allowlist): https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options
- Razorpay payments docs: https://razorpay.com/docs/payments/
- Clerk agent skills: https://github.com/clerk/skills
- Supabase agent skills: https://github.com/supabase/agent-skills
