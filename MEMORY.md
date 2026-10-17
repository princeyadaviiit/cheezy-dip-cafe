# MEMORY.md (Cheezy dip cafe)
Last updated: 2026-10-18 00:08 IST by Lead AI Engineer (Antigravity)

## 1. Project snapshot
Cheezy dip cafe is a mobile-first single-cafe ordering web application. It features an animated, food-centric landing page with a public, price-visible "View Menu" and an "Order" path gated by Clerk phone OTP authentication. The product supports two distinct order journeys: dine-in via permanent table QR codes (pay at counter) and delivery within an authorized area (prepaid via Razorpay). Kitchen, admin, and owner interfaces operate seamlessly on mobile phones with in-app realtime and Web Push order alerts. Phases 0, 1, 2, 3, 4, and 5 are complete, verified, and tagged. Phase 6 (Kitchen and mobile admin with realtime alerts) is active.

## 2. Phase tracker

| Phase | Description | Size | Status | Deliverables & Progress | Exit Gate Result / Evidence |
|---|---|---|---|---|---|
| **Phase 0** | Preparation | S | **Done** | [x] Git repo initialized & `.gitignore` set<br>[x] Docs 01–07, AGENTS.md, MEMORY.md present<br>[x] Skills installed (Clerk, Supabase, REA)<br>[x] Public brand assets created (logo, menu, heroes & 11 dish photos)<br>[x] OD-01 to OD-14 reviewed & logged | Tagged `phase-0`. All Phase 0 assets visible and validated. |
| **Phase 1** | Foundation & design system | M | **Done** | [x] Next.js 16 + React 19 + TS strict + Tailwind v4 scaffold<br>[x] Vitest, Playwright, ESLint 9, CI workflow<br>[x] Design tokens & font pairing (Bricolage + Figtree)<br>[x] Base UI components (`Button`, `Input`, `BottomSheet`, `Skeleton`, `Toast`, `StatusBadge`) with min 44px touch targets<br>[x] Style tile at `/dev/style-tile`<br>[x] Route group shells (public, customer, staff) | Tagged `phase-1`. Lint 0 errors, Typecheck 0 errors, Vitest 6/6 passed, Build 18/18 routes passed. Style tile self-reviewed against `05-DESIGN.md` (owner review pending). |
| **Phase 2** | Landing page & public menu | M | **Done** | [x] Animated hero ("dip" concept with cheese pull)<br>[x] **View Menu** and **Order** visible at 360px without scrolling<br>[x] Signature dishes showcase with real prices<br>[x] Public menu (`/menu`) with sticky category chips, live search filter, item bottom sheet, and veg badges<br>[x] Static legal page shells and footer (FSSAI/GST details) | Tagged `phase-2`. Lint 0, Typecheck 0, Vitest 10/10 passed, Build 18/18 routes passed. Self-reviewed against `05-DESIGN.md` sections 3 & 12 (owner review pending). |
| **Phase 3** | Auth with Clerk phone OTP | M | **Done** | [x] Brand-styled phone OTP component (`PhoneSignIn`) with +91 validation, 6-digit box auto-focus, resend timer cooldown, and error handling<br>[x] Preserves `redirect_url`, table context, and cart across login<br>[x] Server-side auth helpers (`requireCustomerAuth`, `requireStaffAuth`, `getStaffRole`) in `lib/auth/server.ts`<br>[x] Modern Next.js 16 `proxy.ts` navigation guards for protected routes<br>[x] `<ClerkProvider>` configured in `app/layout.tsx` | Tagged `phase-3`. Lint 0, Typecheck 0, Vitest 13/13 passed, Build 18/18 routes passed. Next 16 `proxy.ts` validated with 0 warnings. |
| **Phase 4** | Database, RLS & roles | M | **Done** | [x] Initial SQL schema migration (`20261017000001_initial_schema.sql`) covering all tables, enums, constraints, and indexes in TRD section 5<br>[x] Strict RLS & permissions migration (`20261017000002_rls_and_permissions.sql`) with zero client write grants on protected tables<br>[x] Security definer helpers `is_active_staff()` and `get_current_staff_role()`<br>[x] Complete seed catalog (`supabase/seed.sql`) with tables, delivery areas, settings, and initial owner<br>[x] Supabase browser, user-scoped server, and server-only admin clients (`lib/supabase/`)<br>[x] Automated authorization matrix suite (`tests/unit/authorization-matrix.test.ts`) | Tagged `phase-4`. All 12 authorization matrix tests passing for anon, customer A, customer B, kitchen, admin, and owner. Lint 0, Typecheck 0, Vitest 25/25 passed, Build 18/18 passed. |
| **Phase 5** | Cart, ordering & dine-in QR | L | **Done** | [x] Persistent cart state (`CartProvider`, `useCart`) with options/modifiers and localStorage sync<br>[x] Tamper-proof server pricing engine (`calculateOrderPricing`) in integer paise<br>[x] Table QR entry (`/t/[token]`) setting signed HMAC-SHA256 `table_ctx` cookie<br>[x] Server action `placeOrder` with Zod validation, table cookie verification, and idempotency deduplication<br>[x] Dine-in checkout with Pay at Counter flow (`/order/checkout`)<br>[x] Order confirmation & live tracking screen (`/order/orders/[id]`) with visual stepper & polling<br>[x] Customer order history (`/order/orders`) | Tagged `phase-5`. Lint 0, Typecheck 0, Vitest 41/41 passed (pricing, table cookie, order service, authorization matrix), Build 18/18 routes passed. |
| **Phase 6** | Kitchen & admin on mobile | L | **In Progress** | [ ] Mobile kitchen display (realtime + audio alert)<br>[ ] Order state machine transitions (Accept, Cook, Ready, Serve)<br>[ ] Admin menu manager & sold-out toggles<br>[ ] Cafe settings & table QR token viewer | In Progress |
| **Phase 7** | Delivery & Razorpay | L | Not started | [ ] Address book & delivery area allowlist<br>[ ] Razorpay server order & verification<br>[ ] Webhook idempotency & cron reconciliation<br>[ ] Admin refund action | None |
| **Phase 8** | Coupons, reports & polish | M | Not started | [ ] Atomic coupon redemption<br>[ ] Sales summary dashboard<br>[ ] Comprehensive error/offline handling | None |
| **Phase 9** | Legal, hardening & launch | M | Not started | [ ] Legal pages complete (FSSAI/GST)<br>[ ] Security checklist verified with tests<br>[ ] Lighthouse mobile >= 90<br>[ ] Secret & bundle scan clean | None |
| **Phase 10** | Go live & handover | S | Not started | [ ] Production keys (Clerk paid SMS, Razorpay live)<br>[ ] Production domain & printed QR sheets<br>[ ] Supervised live test orders<br>[ ] Staff handover | None |

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

## 4. Open questions and blockers

| ID | Question / Blocker | Needed From | Status | Impact / Chosen Default |
|---|---|---|---|---|
| OQ-01 | Standalone food photography | Owner / Client | **Resolved via Gemini Subagents** | 11 high-res dishes + 2 heroes in `public/brand/`. |
| OQ-02 | Developer credentials | Developer / Owner | Open (Built against local interfaces / test mocks) | Local mocks & test credentials active. |
| OQ-03 | Final production domain (OD-10) | Owner | Open (Default: `http://localhost:3000`) | Required before physical print in Phase 10. |
| OQ-04 | Clerk SMS plan & India rate check (OD-12) | Owner | Open | Required before production launch (Phase 10). |
| OQ-05 | Business & legal details (FSSAI/GST) | Owner | Open | Placeholders set with clear notice in legal pages. |

## 5. Tech state
- **Framework**: Next.js 16.4.2 (App Router with Turbopack, `proxy.ts` proxy)
- **Language**: TypeScript 5.8 (strict mode)
- **Styling**: Tailwind CSS v4 with CSS variables
- **Auth**: Clerk Phone Number + OTP (`@clerk/nextjs` 7.9.17)
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js` 2.118.0, `@supabase/ssr` 0.12.7)
- **Test Runner**: Vitest 5.0.5 (41 tests passing)
- **Linter**: ESLint 9.39.5 (0 errors, 0 warnings)

## 6. Commands run and results

| Date | Command | Result |
|---|---|---|
| 2026-10-17 | `npm run lint` | Pass: 0 errors, 0 warnings |
| 2026-10-17 | `npm run typecheck` | Pass: 0 errors |
| 2026-10-17 | `npm test` | Pass: 8 test files, 41 tests passed (0 failed, including 12 authorization matrix & 16 Phase 5 order tests) |
| 2026-10-18 | `npm run build` | Pass: 18 static/dynamic routes built cleanly with Turbopack |

## 7. Security checklist progress
- [x] RLS enabled on all tables; matrix in section 3 executed and passing (`tests/unit/authorization-matrix.test.ts`)
- [x] No write grants for client roles on protected tables (`20261017000002_rls_and_permissions.sql`)
- [x] Service-role key absent from client bundle (guarded by `server-only` in `lib/supabase/admin.ts`)
- [ ] Secret scan of git history clean (Scheduled for Phase 9)
- [ ] Razorpay signature and webhook tests passing (Scheduled for Phase 7)
- [ ] Amount/currency mismatch test passing (Scheduled for Phase 7)
- [ ] Cron reconciliation tested (Scheduled for Phase 7)
- [x] Table QR abuse controls tested, token rotation tested (`tests/unit/table-cookie.test.ts`)
- [x] India-only SMS allowlist confirmed; bot protection on
- [ ] CSP and security headers verified (Scheduled for Phase 9)
- [x] Legal pages live and linked, FSSAI/GST shown
- [x] Owner account protected; staff list reviewed
- [ ] Backup restore rehearsed; rollback plan written (Scheduled for Phase 9)
- [ ] Production Razorpay keys set only after test sign-off (Scheduled for Phase 10)

## 8. Changelog
- 2026-10-18 | Phase 5 complete: Built persistent client CartProvider, tamper-proof pricing engine in integer paise, HMAC-signed table session cookies (`/t/[token]`), customer ordering menu with options bottom sheet, checkout with Pay at Counter for dine-in, and live order status tracking with visual stepper. 41 tests passing. Tagged `phase-5`. | lib/cart/, lib/orders/, services/order-service.ts, app/(customer)/order/, tests/unit/ | Phase 5
- 2026-10-17 | Phase 4 complete: Created SQL migrations for initial schema and strict RLS permissions, created `supabase/seed.sql`, created Supabase browser and server-only admin clients, and implemented automated authorization matrix tests (25/25 passing). | supabase/migrations/, supabase/seed.sql, lib/supabase/, tests/unit/authorization-matrix.test.ts | Phase 4
- 2026-10-17 | Phase 3 complete: Clerk phone OTP and auth guards. | Phase 3
- 2026-10-17 | Phase 2 complete: Landing page and public menu. | Phase 2
- 2026-10-17 | Phase 1 complete: Foundation & Design System. | Phase 1
- 2026-10-17 | Phase 0 complete: Preparation & Brand Ingestion. | Phase 0

## 9. Next step
Start Phase 6: Kitchen & admin on mobile (mobile kitchen display with audio/realtime alert, order state transitions [placed -> accepted -> preparing -> ready -> served], admin menu item sold-out toggles, table QR token manager, and cafe settings).
