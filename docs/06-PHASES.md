# 06. Implementation Phases

**Project:** Cheezy dip cafe ordering platform
**Date:** 17 October 2026

Rules for every phase:
- Work on one phase at a time. At the end of a phase, **stop**, update `MEMORY.md`, and wait for approval before starting the next.
- A phase is done only when its exit gate passes with real command output recorded in `MEMORY.md`.
- Small pull requests. No optional feature before core ordering, security and payment behavior is reliable.
- Size guide: S = small, M = medium, L = large.

---

## Phase 0. Preparation (owner and developer) | S

**Goal:** Everything needed to start building is in place.

Deliverables
- GitHub repository created, `.gitignore` set, `docs/` contains all seven documents plus `AGENTS.md` and `MEMORY.md`.
- Accounts: Clerk (dev), Supabase (dev and later prod), Razorpay (test mode), Vercel.
- Client assets placed in `public/brand/` (logo, photos, menu data).
- Final domain decided (OD-10), because printed QR codes depend on it.
- Antigravity configured; Clerk and Supabase skills installed after checking current names (see `AGENTS.md` and prompt).
- Open decisions OD-01 to OD-14 reviewed with defaults accepted or changed.

Exit gate: checklist in `MEMORY.md` all ticked, assets visible to the agent.

---

## Phase 1. Foundation and design system | M

Deliverables
- Next.js + TypeScript + Tailwind project, lint, typecheck, test runner, CI.
- Brand ingestion (design doc section 2), style tile approved by owner.
- Design tokens, fonts, base components (button, input, sheet, skeleton, toast, status badge).
- Layout shell for public, customer, staff areas.
- `.env.example`, README with setup.

Exit gate: `lint`, `typecheck`, `build` pass; style tile approved; component preview at 360 px looks correct.

---

## Phase 2. Landing page and public menu | M

Deliverables
- Animated landing page per design doc section 7, with **View Menu** and **Order** buttons.
- Public menu with real data and prices (seed from client menu), search, category chips, skeletons.
- Static legal page shells and footer.
- Performance pass on landing and menu.

Exit gate: Lighthouse mobile budgets met; reduced-motion works; owner approves the landing page.

---

## Phase 3. Auth with Clerk phone OTP | M

Deliverables
- Clerk phone OTP sign-in themed to the brand; India enabled on the SMS allowlist; bot protection on.
- "Order" gate: unauthenticated users go to sign-in and return to where they were.
- Server-side auth helpers and route guards.
- Profile creation on first login.

Exit gate: new and returning user login works with real OTP on a phone (dev tests may use Clerk test numbers); protected routes reject anonymous users; OTP cost and plan confirmed with owner (OD-12).

---

## Phase 4. Database, RLS and roles | M

Deliverables
- Migrations for all tables in TRD section 5, enums, constraints, indexes.
- Clerk + Supabase third-party auth integration configured.
- `staff_members`, `is_active_staff()`, RLS policies, no client write grants.
- Seed data for categories and items.
- Owner seeded by controlled procedure.

Exit gate: authorization matrix (security doc section 3) passes with automated tests for anonymous, customer A, customer B, kitchen, admin, owner.

---

## Phase 5. Cart, ordering and dine-in QR | L

Deliverables
- Cart with options, quantity rules, persistence across login.
- `placeOrder` service with server-side pricing, validation, idempotency, order numbers.
- Table QR: `/t/[token]`, signed cookie, table banner, QR creation and rotation in admin, print sheet PDF.
- Dine-in checkout with Pay at counter.
- Order confirmation and tracking page.

Exit gate: price tampering, invalid option, closed cafe, duplicate submit and missing-table tests pass; scanning a QR on a real phone opens the menu with the correct table and an order reaches the database.

---

## Phase 6. Kitchen and admin on mobile | L

Deliverables
- Kitchen screen with realtime orders, alert (sound, vibration, banner), reconnect handling, wake lock.
- Order state machine enforced server-side with audit events.
- Admin: order management, menu management with image upload, availability toggles, cafe settings (open/closed, hours), tables, staff management (owner), customer block list.
- Mark paid at counter.
- Web Push for background alerts.

Exit gate: staff complete a full dine-in service on phones; a new order alerts a locked Android phone via push; role restrictions verified; audit log records transitions.

---

## Phase 7. Delivery and Razorpay | L

Deliverables
- Address book, delivery areas by pincode, delivery fee and minimum order, delivery on/off switch.
- Razorpay order creation, Checkout, signature verification, webhook with idempotency, cron reconciliation, expiry of stale orders.
- Delivery statuses (out for delivery, delivered).
- Refunds (full and partial) from admin.
- Razorpay merchant account owned by the cafe; test mode only until sign-off.

Exit gate: all payment tests in TRD section 14 pass in test mode, including invalid signature, duplicate webhook, amount mismatch, browser never returns, and refund.

---

## Phase 8. Coupons, reports and polish | M

Deliverables
- Coupons with atomic redemption and limits.
- Sales summary (today, week, month; by type and payment method).
- Empty, error and offline states across the app.
- Copy review against design doc section 11.

Exit gate: coupon concurrency test passes; reports match test orders; design checklist (section 12 of design doc) satisfied on every screen.

---

## Phase 9. Legal, hardening and launch readiness | M

Deliverables
- Terms, Privacy, Refund and Cancellation, Delivery, Contact pages with owner-approved content; FSSAI and GST shown.
- Security checklist (security doc section 8) fully complete; headers and CSP.
- Playwright mobile suite, Lighthouse report, bundle secret scan.
- Production Supabase project, backups enabled and restore rehearsed.
- Monitoring and alerts, runbook for staff and for payment disputes.

Exit gate: every checklist item ticked with evidence in `MEMORY.md`.

---

## Phase 10. Go live and handover | S

Deliverables
- Production Clerk instance on paid plan with India SMS enabled; production Razorpay keys added; webhook URL configured.
- Domain, HTTPS, Vercel Pro, environment variables set.
- QR sheets printed (domain final) and placed on tables.
- Supervised live test orders: one dine-in, one delivery with small real payment and refund.
- Staff training; handover notes; support and ownership responsibilities written down.

Exit gate: live orders complete end to end; owner signs off.

---

## Dependency summary

```
0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10
              \-- Phase 2 can start before Clerk, but order gating needs Phase 3
Phase 4 (RLS) must finish before real orders or payments are built.
```
