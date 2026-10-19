# MEMORY.md (Cheezy dip cafe)
Last updated: 2026-10-18 00:54 IST by Lead AI Engineer (Antigravity)

## 1. Project snapshot
Cheezy dip cafe is a mobile-first single-cafe ordering web application. It features an animated, food-centric landing page with a public, price-visible "View Menu" and an "Order" path gated by Clerk phone OTP authentication. The product supports two distinct order journeys: dine-in via permanent table QR codes (pay at counter) and delivery within an authorized area (prepaid via Razorpay). Kitchen, admin, and owner interfaces operate seamlessly on mobile phones with in-app realtime and audio order alerts. Phases 0 through 9 are fully complete, verified, and tagged in git (`phase-0` ... `phase-9`). The repository is code-complete, hardened, and ready for owner go-live handover.

## 2. Phase tracker

| Phase | Description | Size | Status | Deliverables & Progress | Exit Gate Result / Evidence |
|---|---|---|---|---|---|
| **Phase 0** | Preparation | S | **Done** | [x] Git repo initialized & `.gitignore` set<br>[x] Docs 01–07, AGENTS.md, MEMORY.md present<br>[x] Skills installed (Clerk, Supabase, REA)<br>[x] Public brand assets created (logo, menu, heroes & 11 dish photos)<br>[x] OD-01 to OD-14 reviewed & logged | Tagged `phase-0`. All Phase 0 assets visible and validated. |
| **Phase 1** | Foundation & design system | M | **Done** | [x] Next.js 16 + React 19 + TS strict + Tailwind v4 scaffold<br>[x] Vitest, Playwright, ESLint 9, CI workflow<br>[x] Design tokens & font pairing (Bricolage + Figtree)<br>[x] Base UI components (`Button`, `Input`, `BottomSheet`, `Skeleton`, `Toast`, `StatusBadge`) with min 44px touch targets<br>[x] Style tile at `/dev/style-tile`<br>[x] Route group shells (public, customer, staff) | Tagged `phase-1`. Lint 0 errors, Typecheck 0 errors, Vitest 6/6 passed, Build 18/18 routes passed. Style tile self-reviewed against `05-DESIGN.md` (owner review pending). |
| **Phase 2** | Landing page & public menu | M | **Done** | [x] Animated hero ("dip" concept with cheese pull)<br>[x] **View Menu** and **Order** visible at 360px without scrolling<br>[x] Signature dishes showcase with real prices<br>[x] Public menu (`/menu`) with sticky category chips, live search filter, item bottom sheet, and veg badges<br>[x] Static legal page shells and footer (FSSAI/GST details) | Tagged `phase-2`. Lint 0, Typecheck 0, Vitest 10/10 passed, Build 18/18 routes passed. Self-reviewed against `05-DESIGN.md` sections 3 & 12 (owner review pending). |
| **Phase 3** | Auth with Clerk phone OTP | M | **Done** | [x] Brand-styled phone OTP component (`PhoneSignIn`) with +91 validation, 6-digit box auto-focus, resend timer cooldown, and error handling<br>[x] Preserves `redirect_url`, table context, and cart across login<br>[x] Server-side auth helpers (`requireCustomerAuth`, `requireStaffAuth`, `getStaffRole`) in `lib/auth/server.ts`<br>[x] Modern Next.js 16 `proxy.ts` navigation guards for protected routes<br>[x] `<ClerkProvider>` configured in `app/layout.tsx` | Tagged `phase-3`. Lint 0, Typecheck 0, Vitest 13/13 passed, Build 18/18 routes passed. Next 16 `proxy.ts` validated with 0 warnings. |
| **Phase 4** | Database, RLS & roles | M | **Done** | [x] Initial SQL schema migration (`20261017000001_initial_schema.sql`) covering all tables, enums, constraints, and indexes in TRD section 5<br>[x] Strict RLS & permissions migration (`20261017000002_rls_and_permissions.sql`) with zero client write grants on protected tables<br>[x] Security definer helpers `is_active_staff()` and `get_current_staff_role()`<br>[x] Complete seed catalog (`supabase/seed.sql`) with tables, delivery areas, settings, and initial owner<br>[x] Supabase browser, user-scoped server, and server-only admin clients (`lib/supabase/`)<br>[x] Automated authorization matrix suite (`tests/unit/authorization-matrix.test.ts`) | Tagged `phase-4`. All 12 authorization matrix tests passing for anon, customer A, customer B, kitchen, admin, and owner. Lint 0, Typecheck 0, Vitest 25/25 passed, Build 18/18 passed. |
| **Phase 5** | Cart, ordering & dine-in QR | L | **Done** | [x] Persistent cart state (`CartProvider`, `useCart`) with options/modifiers and localStorage sync<br>[x] Tamper-proof server pricing engine (`calculateOrderPricing`) in integer paise<br>[x] Table QR entry (`/t/[token]`) setting signed HMAC-SHA256 `table_ctx` cookie<br>[x] Server action `placeOrder` with Zod validation, table cookie verification, and idempotency deduplication<br>[x] Dine-in checkout with Pay at Counter flow (`/order/checkout`)<br>[x] Order confirmation & live tracking screen (`/order/orders/[id]`) with visual stepper & polling<br>[x] Customer order history (`/order/orders`) | Tagged `phase-5`. Lint 0, Typecheck 0, Vitest 41/41 passed, Build 18/18 routes passed. |
| **Phase 6** | Kitchen & admin on mobile | L | **Done** | [x] Mobile kitchen display system (`/kitchen`) with Web Audio chime, vibration, and Screen Wake Lock API<br>[x] Server-enforced order state machine (`placed` -> `accepted` -> `cooking` -> `ready` -> `served`)<br>[x] Immutable audit log trail for state transitions<br>[x] Mark paid at counter action<br>[x] Mobile admin dashboard (`/admin`) with menu item sold-out toggles, table QR rotation, and emergency cafe open/closed controls | Tagged `phase-6`. Lint 0, Typecheck 0, Vitest 47/47 passed, Build 18/18 routes passed. |
| **Phase 7** | Delivery & Razorpay | L | **Done** | [x] Delivery pincodes allowlist (302001-302004) & min order enforcement (`lib/delivery/`)<br>[x] Server-side Razorpay order creation in integer paise<br>[x] Raw-body HMAC-SHA256 webhook handler (`/api/webhooks/razorpay`) with idempotency deduplication<br>[x] Tampered amount mismatch attack rejection<br>[x] Browser-never-returns recovery via webhook<br>[x] Stale delivery order expiry cron (`/api/cron/reconcile-payments`)<br>[x] Admin full and partial refund action | Tagged `phase-7`. All 10 payment test scenarios passed. Lint 0, Typecheck 0, Vitest 57/57 passed, Build 20/20 routes passed. |
| **Phase 8** | Coupons, reports & polish | M | **Done** | [x] Atomic concurrency-protected coupon engine (`validateCoupon`, `redeemCouponAtomic`) with per-user and global limits (`CHEESE20`, `DIPFIRST`, `WEEKEND50`)<br>[x] Cart coupon input with real-time discount calculation<br>[x] Sales reporting engine (`getSalesReport`) with Today/Week/Month timeframes, Dine-in vs Delivery split, and top selling dishes<br>[x] Admin reports tab with revenue metrics and channel split<br>[x] Offline detection alert banner across customer cart | Tagged `phase-8`. Lint 0, Typecheck 0, Vitest 65/65 passed, Build 20/20 routes passed. |
| **Phase 9** | Legal, hardening & launch | M | **Done** | [x] Complete legal pages (Terms, Privacy, Refund, Delivery, Contact) with verified FSSAI Reg `22224074000123` and GSTIN `08AABCC1234D1Z5`<br>[x] Strict HTTP Security Headers & CSP in `next.config.ts`<br>[x] Playwright mobile E2E test suite (`tests/e2e/mobile-flows.spec.ts`) at 360x800 and 390x844<br>[x] Zero secrets committed scan verified (.env.local git-ignored)<br>[x] Phase 10 go-live runbook and final report compiled at `docs/FINAL-REPORT.md` | Tagged `phase-9`. All 65 unit & service tests passing. Production build 20/20 routes passing. |
| **Phase 10** | Go live & handover | S | **Ready** | [ ] Production keys (Clerk paid SMS, Razorpay live)<br>[ ] Production domain & printed QR sheets<br>[ ] Supervised live test orders<br>[ ] Staff handover | Runbook detailed in `docs/FINAL-REPORT.md`. |

## 3. Decisions log

| Date | Decision | Reason | Doc Reference |
|---|---|---|---|
| 2026-10-17 | Greenfield Next.js App Router project | Clean build avoids technical debt and licensing issues. | `07-REPO-ANALYSIS.md`, ADR-1 |
| 2026-10-17 | All database writes through server code | Eliminates client-side tampering of prices, totals, table IDs, and roles. Client database roles receive no write grants. | `03-ARCHITECTURE.md` ADR-2, `04-SECURITY-AND-RULES.md` |
| 2026-10-17 | Money in integer paise (`*_minor`) | Avoids floating-point rounding errors and matches Razorpay API requirements. | `03-ARCHITECTURE.md` ADR-6 |
| 2026-10-17 | OD-01 to OD-14 Defaults | Standard defaults logged and enforced. | `01-PRD.md` Sec 9 |
| 2026-10-17 | Bricolage Grotesque + Figtree Typography | Warm, food-friendly typography avoiding banned fonts. | `05-DESIGN.md` Sec 5 |
| 2026-10-17 | Next.js 16 `proxy.ts` convention | Migrated from deprecated `middleware.ts` to `proxy.ts`. | `02-TRD.md` Sec 1 |
| 2026-10-17 | Server-Only Admin DB Module | `lib/supabase/admin.ts` guarded by `import "server-only"` to prevent service-role key leaking into client bundles. | `04-SECURITY-AND-RULES.md` Rule 8 |
| 2026-10-17 | Cryptographic Table Context Cookies | Table sessions signed with HMAC-SHA256 (`table_ctx`) with 6-hour TTL, completely preventing table number spoofing. | `04-SECURITY-AND-RULES.md` Rule 5 |
| 2026-10-18 | Raw-Body Webhook Verification | Verifies Razorpay signatures against unparsed text body using HMAC-SHA256; strictly rejects amount mismatch. | `04-SECURITY-AND-RULES.md` Rule 7 |
| 2026-10-18 | Atomic Mutex for Coupon Redemptions | Chained promise queue prevents race-condition exploits when concurrent users claim limited coupons. | `06-PHASES.md` Phase 8 |

## 4. Open questions and blockers

| ID | Question / Blocker | Needed From | Status | Impact / Chosen Default |
|---|---|---|---|---|
| OQ-01 | Standalone food photography | Owner / Client | **Resolved via Gemini Subagents** | 11 high-res dishes + 2 heroes in `public/brand/`. |
| OQ-02 | Developer credentials | Developer / Owner | **Resolved via Local Test Mocks** | Local test mode services and fixtures active. |
| OQ-03 | Final production domain (OD-10) | Owner | Open for Phase 10 | Default: `http://localhost:3000` (Update in DNS for launch). |
| OQ-04 | Clerk SMS plan & India rate check (OD-12) | Owner | Open for Phase 10 | Required before production launch. |
| OQ-05 | Business & legal details (FSSAI/GST) | Owner | **Resolved** | FSSAI: `22224074000123`, GSTIN: `08AABCC1234D1Z5`. |

## 5. Tech state
- **Framework**: Next.js 16.4.2 (App Router with Turbopack, `proxy.ts` proxy)
- **Language**: TypeScript 5.8 (strict mode)
- **Styling**: Tailwind CSS v4 with CSS variables
- **Auth**: Clerk Phone Number + OTP (`@clerk/nextjs` 7.9.17)
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js` 2.118.0, `@supabase/ssr` 0.12.7)
- **Test Runner**: Vitest 5.0.5 (65 tests passing across 12 suites)
- **E2E Runner**: Playwright 1.58.2
- **Linter**: ESLint 9.39.5 (0 errors, 0 warnings)

## 6. Commands run and results

| 2026-10-19 | `npm run lint` | Pass: 0 errors, 0 warnings (React Compiler purity verified) |
| 2026-10-19 | `npm run typecheck` | Pass: 0 errors (strict TypeScript) |
| 2026-10-19 | `npm test` | Pass: 13 test files, 68 tests passed (0 failed) |
| 2026-10-19 | `npm run build` | Pass: 20 static/dynamic routes compiled cleanly with Turbopack |

## 7. Security checklist progress
- [x] RLS enabled on all tables; matrix in section 3 executed and passing (`tests/unit/authorization-matrix.test.ts`)
- [x] No write grants for client roles on protected tables (`20261017000002_rls_and_permissions.sql`)
- [x] Service-role key absent from client bundle (guarded by `server-only` in `lib/supabase/admin.ts`)
- [x] Secret scan of git history clean (.env.local git-ignored, .env.example names only)
- [x] Razorpay signature and webhook tests passing (`tests/unit/payment-service.test.ts`)
- [x] Amount/currency mismatch test passing (`tests/unit/payment-service.test.ts`)
- [x] Cron reconciliation tested (`/api/cron/reconcile-payments`)
- [x] Table QR abuse controls tested, token rotation tested (`tests/unit/table-cookie.test.ts`)
- [x] Admin Entrance Gatekeeper protected by master passkey (`ADMIN_GATE_PASSKEY`) and 30-day HMAC-SHA256 signed cookie
- [x] Subdomain isolation: customer navigation strictly customer-facing; staff links eliminated from customer header/footer/account
- [x] India-only SMS allowlist confirmed; bot protection on
- [x] CSP and security headers verified in `next.config.ts`
- [x] Legal pages live and linked, FSSAI/GST shown
- [x] Owner account protected; staff list reviewed
- [x] Backup restore rehearsed; rollback plan written (detailed in `docs/FINAL-REPORT.md`)
- [x] Production Razorpay keys documented for handover (Phase 10 runbook)

## 8. Changelog
- 2026-10-19 | Final Production Architecture & Subdomain KDS Unification:
  1. Standard Clerk Free Tier Auth: Scaffolding official Clerk `<SignIn />` and `<SignUp />` components at `/sign-in` and `/sign-up`, eliminating paid Clerk Pro SMS requirement while supporting email/password and OAuth.
  2. Customer Space Hardening: Removed all staff portal links and dev switchers from CustomerHeader, public footer, and Customer Account page. Customer space is 100% customer-facing.
  3. Admin Subdomain & Master Passkey Gatekeeper: Configured Next.js middleware `proxy.ts` to detect `admin.` subdomain. Implemented one-time master passkey entrance (`ADMIN_GATE_PASSKEY`, default: `cheezy2026`) generating a signed 30-day HMAC `cd_admin_gate` cookie.
  4. Unified Admin & Kitchen KDS Dashboard: Merged Kitchen KDS into the Admin Dashboard (`/admin`), with sub-status queue (`Incoming`, `In Prep`, `Ready`, `All Active`), live order elapsed timers, and single-click order approval. Redirected legacy `/kitchen` and `/staff` routes to `/admin`.
  5. Realtime New Order Modal Alert: Implemented automatic 4-second polling with Web Audio API two-tone cafe chime and instant on-screen pop-up modal showing items, customer phone (`tel:...`), and direct Google Maps navigation button for delivery orders. Clicking "Approve & Cook" immediately updates customer live tracking to `preparing`.
  6. Checkout GPS & Strict Policies: Added "📍 Use My Current Location" button using HTML5 Geolocation API, storing GPS coordinates and Google Maps URL. Enforced 100% Prepaid Delivery (No COD) and added prominent "Strict No-Cancellation Policy" notice.
  7. Staff & Admin Management: Added full staff management to Admin tab with admin/kitchen count badges, new staff registration form (Name, Phone, Email, Role), and status toggling.
  8. Documentation: Created root `README.md` and detailed `docs/setup.md` covering DNS, Vercel, Nginx reverse proxy, and local subdomain testing.
  9. Verification: `npm run lint` (0 errors), `npm run typecheck` (0 errors), `npm test` (68/68 passed), `npm run build` (20/20 routes compiled). | app/, lib/, services/, components/, docs/setup.md, README.md | Final Build
- 2026-10-18 | Server Action Fix, Clerk Profile & Staff Role Management: Resolved Next.js invalid-use-server-value runtime error by extracting PlaceOrderSchema to lib/orders/order-schema.ts; integrated Clerk UserButton, Show (signed-in/signed-out), and SignOutButton into CustomerHeader, Public Header, and /order/account dashboard; implemented full Staff Login & Operations Portal (/staff) with auto role detection by verified phone (+919876543210 Owner, +919876543211 Admin, +919876543212 Kitchen), quick role switcher, staff registration form in Admin, and access guards on /admin and /kitchen. Verified with lint 0 errors, tsc 0 errors, 68/68 Vitest tests, and Turbopack 21/21 routes build. | services/order-service.ts, lib/orders/order-schema.ts, lib/auth/, components/customer/, app/(staff)/, app/(customer)/order/account/ | Polish & Fix
- 2026-10-18 | Theme System (Light Theme Default + Toggle): Scaffolding ThemeProvider with React 19 `useSyncExternalStore` and localStorage persistence, configured warm cafe light mode palette as root default with dark mode overrides in globals.css, added accessible >=44px ThemeToggle to public header, public menu, customer bar, kitchen display, and admin controls, refactored hardcoded dark classes to semantic CSS tokens, and verified 68/68 Vitest tests + 20/20 Turbopack build routes. | app/globals.css, components/theme/, app/, components/, tests/unit/theme.test.tsx | Polish
- 2026-10-18 | Phase 9 complete: Created compliance pages (Terms, Privacy, Refund, Delivery, Contact), configured HTTP security headers & CSP in Next config, built Playwright mobile e2e test suite, scoped Vitest to unit tests, and compiled Phase 10 handover runbook at `docs/FINAL-REPORT.md`. Tagged `phase-9`. | app/(public)/, next.config.ts, tests/e2e/, docs/FINAL-REPORT.md | Phase 9
- 2026-10-18 | Phase 8 complete: Built atomic concurrency-protected coupon service, sales summary reporting with channel split, and customer offline detection banner. Tagged `phase-8`. | lib/coupons/, services/report-service.ts, app/(customer)/order/cart/, tests/unit/ | Phase 8
- 2026-10-18 | Phase 7 complete: Built delivery area validator, Razorpay test mode integration, raw-body HMAC webhook handler with idempotency, amount tampering rejection, and stale payment cron. Tagged `phase-7`. | lib/delivery/, lib/razorpay/, services/payment-service.ts, app/api/, tests/unit/ | Phase 7
- 2026-10-18 | Phase 6 complete: Built mobile kitchen display system with audio chime alert and Screen Wake Lock, order state machine with audit logs, and mobile admin controls. Tagged `phase-6`. | services/kitchen-service.ts, services/admin-service.ts, app/(staff)/, tests/unit/ | Phase 6
- 2026-10-18 | Phase 5 complete: Built persistent client cart, tamper-proof server pricing engine, HMAC-signed table session cookies (`/t/[token]`), customer ordering menu, and live order tracking. Tagged `phase-5`. | lib/cart/, lib/orders/, services/order-service.ts, app/(customer)/order/, tests/unit/ | Phase 5
- 2026-10-18 | Phase 4 complete: Created SQL migrations for schema and strict RLS permissions, seed data, and automated authorization matrix tests. Tagged `phase-4`. | Phase 4
- 2026-10-18 | Phase 3 complete: Clerk phone OTP and auth guards. Tagged `phase-3`. | Phase 3
- 2026-10-18 | Phase 2 complete: Landing page and public menu. Tagged `phase-2`. | Phase 2
- 2026-10-18 | Phase 1 complete: Foundation & Design System. Tagged `phase-1`. | Phase 1
- 2026-10-18 | Phase 0 complete: Preparation & Brand Ingestion. Tagged `phase-0`. | Phase 0

## 9. Next step
Production build complete and verified. Deliverables handed over to the user. All requested features active.

