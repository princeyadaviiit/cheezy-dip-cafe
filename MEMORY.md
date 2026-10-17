# MEMORY.md (Cheezy dip cafe)
Last updated: 2026-10-17 21:18 IST by Lead AI Engineer (Antigravity)

## 1. Project snapshot
Cheezy dip cafe is a mobile-first single-cafe ordering web application. It features an animated, food-centric landing page with a public, price-visible "View Menu" and an "Order" path gated by Clerk phone OTP authentication. The product supports two distinct order journeys: dine-in via permanent table QR codes (pay at counter) and delivery within an authorized area (prepaid via Razorpay). Kitchen, admin, and owner interfaces operate seamlessly on mobile phones with in-app realtime and Web Push order alerts. Phases 0, 1, and 2 are complete, verified, and tagged. Phase 3 (Auth with Clerk Phone OTP) is active.

## 2. Phase tracker

| Phase | Description | Size | Status | Deliverables & Progress | Exit Gate Result / Evidence |
|---|---|---|---|---|---|
| **Phase 0** | Preparation | S | **Done** | [x] Git repo initialized & `.gitignore` set<br>[x] Docs 01–07, AGENTS.md, MEMORY.md present<br>[x] Skills installed (Clerk, Supabase, REA)<br>[x] Public brand assets created (logo, menu, heroes & 11 dish photos)<br>[x] OD-01 to OD-14 reviewed & logged | Tagged `phase-0`. All Phase 0 assets visible and validated. |
| **Phase 1** | Foundation & design system | M | **Done** | [x] Next.js 16 + React 19 + TS strict + Tailwind v4 scaffold<br>[x] Vitest, Playwright, ESLint 9, CI workflow<br>[x] Design tokens & font pairing (Bricolage + Figtree)<br>[x] Base UI components (`Button`, `Input`, `BottomSheet`, `Skeleton`, `Toast`, `StatusBadge`) with min 44px touch targets<br>[x] Style tile at `/dev/style-tile`<br>[x] Route group shells (public, customer, staff) | Tagged `phase-1`. Lint 0 errors, Typecheck 0 errors, Vitest 6/6 passed, Build 18/18 routes passed. Style tile self-reviewed against `05-DESIGN.md` (owner review pending). |
| **Phase 2** | Landing page & public menu | M | **Done** | [x] Animated hero ("dip" concept with cheese pull)<br>[x] **View Menu** and **Order** visible at 360px without scrolling<br>[x] Signature dishes showcase with real prices<br>[x] Public menu (`/menu`) with sticky category chips, live search filter, item bottom sheet, and veg badges<br>[x] Static legal page shells and footer (FSSAI/GST details) | Tagged `phase-2`. Lint 0, Typecheck 0, Vitest 10/10 passed, Build 18/18 routes passed. Self-reviewed against `05-DESIGN.md` sections 3 & 12 (owner review pending). |
| **Phase 3** | Auth with Clerk phone OTP | M | **In Progress** | [ ] Clerk phone OTP themed<br>[ ] India SMS allowlist & bot protection<br>[ ] Order gate redirection flow<br>[ ] Profiles creation & guards | Pending implementation |
| **Phase 4** | Database, RLS & roles | M | Not started | [ ] Supabase schema & migrations<br>[ ] Clerk + Supabase integration<br>[ ] `staff_members` & `is_active_staff()`<br>[ ] RLS policies (zero client write grants)<br>[ ] Seed menu data | None |
| **Phase 5** | Cart, ordering & dine-in QR | L | Not started | [ ] Persistent cart with modifiers<br>[ ] `placeOrder` server service<br>[ ] Table QR `/t/[token]` + signed cookie<br>[ ] Dine-in checkout (Pay at counter)<br>[ ] Order tracking page | None |
| **Phase 6** | Kitchen & admin on mobile | L | Not started | [ ] Mobile kitchen display (realtime + audio/push)<br>[ ] Order state machine transitions<br>[ ] Admin menu & sold-out toggles<br>[ ] Cafe settings & table QR generator | None |
| **Phase 7** | Delivery & Razorpay | L | Not started | [ ] Address book & delivery area allowlist<br>[ ] Razorpay server order & verification<br>[ ] Webhook idempotency & cron reconciliation<br>[ ] Admin refund action | None |
| **Phase 8** | Coupons, reports & polish | M | Not started | [ ] Atomic coupon redemption<br>[ ] Sales summary dashboard<br>[ ] Comprehensive error/offline handling | None |
| **Phase 9** | Legal, hardening & launch | M | Not started | [ ] Legal pages complete (FSSAI/GST)<br>[ ] Security checklist verified with tests<br>[ ] Lighthouse mobile >= 90<br>[ ] Secret & bundle scan clean | None |
| **Phase 10** | Go live & handover | S | Not started | [ ] Production keys (Clerk paid SMS, Razorpay live)<br>[ ] Production domain & printed QR sheets<br>[ ] Supervised live test orders<br>[ ] Staff handover | None |

## 3. Decisions log

| Date | Decision | Reason | Doc Reference |
|---|---|---|---|
| 2026-10-17 | Greenfield Next.js App Router project | No third-party repository meets all requirements. Clean build avoids technical debt and licensing issues. | `07-REPO-ANALYSIS.md`, ADR-1 |
| 2026-10-17 | All database writes through server code | Eliminates client-side tampering of prices, totals, table IDs, and roles. Client database roles receive no write grants. | `03-ARCHITECTURE.md` ADR-2, `04-SECURITY-AND-RULES.md` |
| 2026-10-17 | Money in integer paise (`*_minor`) | Avoids floating-point rounding errors and matches Razorpay API requirements. | `03-ARCHITECTURE.md` ADR-6 |
| 2026-10-17 | OD-01 to OD-14 Defaults | Standard defaults logged and enforced. | `01-PRD.md` Sec 9 |
| 2026-10-17 | Bricolage Grotesque + Figtree Typography | Warm, food-friendly typography avoiding banned fonts (Inter, Geist, Space Grotesk). | `05-DESIGN.md` Sec 5 |
| 2026-10-17 | Phase 2 Catalog Seeding | Comprehensive menu extracted directly from cafe poster (`lib/menu-data.ts`) with paise pricing and high-res imagery. | Phase 2 |

## 4. Open questions and blockers

| ID | Question / Blocker | Needed From | Status | Impact / Chosen Default |
|---|---|---|---|---|
| OQ-01 | **Standalone food photography** | Owner / Client | **Resolved via Gemini Subagents** | High-res commercial dish photos available in `public/brand/dishes/`. |
| OQ-02 | **Developer credentials** (Clerk, Supabase, Razorpay) | Developer / Owner | Open (Built against local interfaces / test mocks) | Will use local mocks & test credentials until owner supplies keys. |
| OQ-03 | **Final production domain** (OD-10) | Owner | Open (Default: `http://localhost:3000`) | Required before physical print in Phase 10. |
| OQ-04 | **Clerk SMS plan & India rate check** (OD-12) | Owner | Open | Required before production launch (Phase 10). |
| OQ-05 | **Business & legal details** (FSSAI/GST) | Owner | Open | Placeholders set with clear notice in legal pages. |

## 5. Tech state
- **Node.js**: Windows local environment (Node 20+)
- **Package Manager**: npm
- **Framework**: Next.js 16.4.2 (App Router with Turbopack)
- **Language**: TypeScript 5.8 (strict mode)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) with CSS variable tokens
- **Auth**: Clerk Phone Number + OTP (`@clerk/nextjs` 7.9.17)
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js` 2.118.0, `@supabase/ssr` 0.12.7)
- **Validation**: Zod 4.6.7
- **Test Runner**: Vitest 5.0.5 + `@testing-library/react` 16.3.3 + `jsdom`
- **E2E Testing**: `@playwright/test` 1.64.1 (configured for 360x800 and 390x844 viewports)
- **Linter**: ESLint 9.39.5 (`eslint-config-next` 16.4.2)
- **Agent Skills Installed**: Clerk & Supabase suites in `.agents/skills`

## 6. Commands run and results

| Date | Command | Result |
|---|---|---|
| 2026-10-17 | `npm run lint` | Pass: 0 errors, 0 warnings |
| 2026-10-17 | `npm run typecheck` | Pass: 0 errors |
| 2026-10-17 | `npm test` | Pass: 3 test files, 10 tests passed (0 failed) |
| 2026-10-17 | `npm run build` | Pass: 18 static/dynamic routes built cleanly with Turbopack in 8.0s |

## 7. Changelog
- 2026-10-17 | Phase 2 complete: Built mobile-first animated Landing Page (`/`) with 360px above-fold dual CTA (View Menu & Order), cheese dip hero showcase, customer favorites, ordering steps, timings, and legal footer. Built Public Menu (`/menu`) with sticky category horizontal scroll, live search filter, item bottom sheet, and ordering flow. Added menu catalog unit tests (10/10 tests pass). | app/(public)/page.tsx, app/(public)/menu/page.tsx, lib/menu-data.ts, tests/unit/menu-data.test.ts | Phase 2
- 2026-10-17 | Phase 1 complete: Next.js + React 19 + Tailwind v4 + TS 5.8 scaffolded, base components created, style tile built, tests & CI workflow passing. | Phase 1
- 2026-10-17 | Phase 0 complete: Project initialized, brand assets generated, skills installed. | Phase 0

## 8. Next step
Proceed immediately with Phase 3 (Auth with Clerk phone OTP, themed sign-in flow, SMS allowlist configuration instructions, order gate redirection preserving table context and cart, and server-side auth guards).
