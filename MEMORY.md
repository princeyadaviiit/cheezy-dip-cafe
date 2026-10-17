# MEMORY.md (Cheezy dip cafe)
Last updated: 2026-10-17 21:10 IST by Lead AI Engineer (Antigravity)

## 1. Project snapshot
Cheezy dip cafe is a mobile-first single-cafe ordering web application. It features an animated, food-centric landing page with a public, price-visible "View Menu" and an "Order" path gated by Clerk phone OTP authentication. The product supports two distinct order journeys: dine-in via permanent table QR codes (pay at counter) and delivery within an authorized area (prepaid via Razorpay). Kitchen, admin, and owner interfaces operate seamlessly on mobile phones with in-app realtime and Web Push order alerts. Phase 0 (Preparation) and Phase 1 (Foundation & Design System) are complete, verified, and tagged. Phase 2 (Landing Page & Public Menu) is active.

## 2. Phase tracker

| Phase | Description | Size | Status | Deliverables & Progress | Exit Gate Result / Evidence |
|---|---|---|---|---|---|
| **Phase 0** | Preparation | S | **Done** | [x] Git repo initialized & `.gitignore` set<br>[x] Docs 01–07, AGENTS.md, MEMORY.md present<br>[x] Skills installed (Clerk, Supabase, REA)<br>[x] Public brand assets created (logo, menu, heroes & 11 dish photos)<br>[x] OD-01 to OD-14 reviewed & logged | Tagged `phase-0`. All Phase 0 assets visible and validated. |
| **Phase 1** | Foundation & design system | M | **Done** | [x] Next.js 16 + React 19 + TS strict + Tailwind v4 scaffold<br>[x] Vitest, Playwright, ESLint 9, CI workflow<br>[x] Design tokens & font pairing (Bricolage + Figtree)<br>[x] Base UI components (`Button`, `Input`, `BottomSheet`, `Skeleton`, `Toast`, `StatusBadge`) with min 44px touch targets<br>[x] Style tile at `/dev/style-tile`<br>[x] Route group shells (public, customer, staff) | Tagged `phase-1`. Lint 0 errors, Typecheck 0 errors, Vitest 6/6 passed, Build 18/18 routes passed. Style tile self-reviewed against `05-DESIGN.md` (owner review pending). |
| **Phase 2** | Landing page & public menu | M | **In Progress** | [ ] Animated hero ("dip" concept)<br>[ ] Public menu with search & categories<br>[ ] Skeletons & empty states<br>[ ] Legal page shells | Pending implementation |
| **Phase 3** | Auth with Clerk phone OTP | M | Not started | [ ] Clerk phone OTP themed<br>[ ] India SMS allowlist & bot protection<br>[ ] Order gate redirection flow<br>[ ] Profiles creation & guards | None |
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
| 2026-10-17 | OD-01: Delivery is Razorpay only (no COD) | Default from PRD section 9. Prevents delivery no-shows and cash handling overhead. | `01-PRD.md` Sec 9 (OD-01) |
| 2026-10-17 | OD-02: Dine-in is Pay at Counter only | Default from PRD section 9. Online payment for dine-in can be enabled later via settings toggle. | `01-PRD.md` Sec 9 (OD-02) |
| 2026-10-17 | OD-03: Delivery area by pincode/area allow-list | Default from PRD section 9. Predictable, low complexity, no map API costs. | `01-PRD.md` Sec 9 (OD-03), ADR-5 |
| 2026-10-17 | OD-04: Delivery fee model | Flat fee with free-delivery threshold and minimum order value. | `01-PRD.md` Sec 9 (OD-04) |
| 2026-10-17 | OD-05: Menu prices are tax-inclusive | Default from PRD section 9. Standard practice for Indian cafes; to be confirmed with owner's accountant. | `01-PRD.md` Sec 9 (OD-05) |
| 2026-10-17 | OD-06: Customer cancel window | Customer may cancel only while order status is `placed` (before kitchen acceptance). | `01-PRD.md` Sec 9 (OD-06) |
| 2026-10-17 | OD-07: Operating & delivery hours | Managed dynamically by cafe admin via `/admin/settings`. | `01-PRD.md` Sec 9 (OD-07) |
| 2026-10-17 | OD-08: Login required for dine-in | Verified phone OTP required to associate customer orders and prevent anonymous spam. | `01-PRD.md` Sec 9 (OD-08) |
| 2026-10-17 | OD-09: Takeaway/pickup omitted in v1 | Excluded from v1 scope to focus on table QR and delivery. | `01-PRD.md` Sec 9 (OD-09) |
| 2026-10-17 | OD-10: Final domain needed before QR print | Printed QR codes embed `https://<domain>/t/<token>`. Domain must be finalized prior to printing. | `01-PRD.md` Sec 9 (OD-10), ADR-7 |
| 2026-10-17 | OD-11: Cafe staff handle delivery | Own staff; rider contact details not displayed in customer UI in v1. | `01-PRD.md` Sec 9 (OD-11) |
| 2026-10-17 | OD-12: Clerk paid plan & India SMS allowlist | SMS for phone OTP requires Clerk paid tier in prod and India (+91) enable on allowlist. Owner to verify SMS rates. | `01-PRD.md` Sec 9 (OD-12), `02-TRD.md` Sec 3 |
| 2026-10-17 | OD-13: Phone OTP only (no social fallback) | Clean, single customer authentication identifier in v1. | `01-PRD.md` Sec 9 (OD-13) |
| 2026-10-17 | OD-14: WhatsApp notifications deferred | Realtime in-app + Web Push prioritized for v1. | `01-PRD.md` Sec 9 (OD-14) |
| 2026-10-17 | Font Pairing: Bricolage Grotesque / Figtree | Warm, energetic, food-aligned typography. Strictly avoids banned fonts (Inter, Geist, Space Grotesk). Supports ₹ currency symbol and tabular numbers. | `05-DESIGN.md` Sec 5 |
| 2026-10-17 | TypeScript 5.8 Pin | `typescript@~5.8.2` chosen for full compatibility with `@typescript-eslint` and ESLint 9. | Build fix |

## 4. Open questions and blockers

| ID | Question / Blocker | Needed From | Status | Impact / Chosen Default |
|---|---|---|---|---|
| OQ-01 | **Standalone food photography**: Standalone high-res dish photos generated via Gemini image subagents covering all menu categories; cropped images purged. | Owner / Client | **Resolved via Gemini Subagents** | High-res commercial dish photos available in `public/brand/dishes/`. |
| OQ-02 | **Developer credentials**: Need Clerk dev keys, Supabase dev project keys, and Razorpay test mode keys to populate local `.env.local`. | Developer / Owner | Open (Built against local interfaces / test mocks) | Will use local mocks & test credentials until owner supplies keys. |
| OQ-03 | **Final production domain** (OD-10): Needed before printing permanent table QR sheets. | Owner | Open (Default: `http://localhost:3000`) | Required before physical print in Phase 10. |
| OQ-04 | **Clerk SMS plan & India rate check** (OD-12): Owner verification of Clerk production pricing for India (+91) SMS. | Owner | Open | Required before production launch (Phase 10). |
| OQ-05 | **Business & legal details**: FSSAI license number, GSTIN, registered trade name and cafe address for footer and policy pages. | Owner | Open | Placeholders set with clear notice in legal pages. |

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
- **Agent Skills Installed**:
  - `clerk-setup`, `clerk-nextjs-patterns`, `clerk-custom-ui`, `clerk-testing`, `clerk-webhooks`
  - `supabase`, `supabase-postgres-best-practices`
  - `reverse-engineer-anything`

## 6. File and module map
- `AGENTS.md`: Mandatory engineering and behavioral rules.
- `MEMORY.md`: Project memory and single source of truth.
- `app/`: Next.js App Router root:
  - `globals.css`: Brand CSS design tokens, typography, radii, motion and reduced-motion rules.
  - `layout.tsx`: Root HTML layout with self-hosted Google fonts (`Bricolage_Grotesque` & `Figtree`).
  - `(public)/`: Public routes (Landing `/`, `/menu`, `/t/[token]`, `/sign-in`, legal pages).
  - `(customer)/order/`: Customer app (`/order`, `/cart`, `/checkout`, `/orders`, `/account`).
  - `(staff)/`: Staff app (`/kitchen`, `/admin`).
  - `dev/style-tile/`: 360px mobile-first component and token style tile.
- `components/ui/`: Restyled brand UI primitives:
  - `button.tsx`: Brand variants with >= 44px touch targets.
  - `input.tsx`: Input with 16px min mobile font to prevent iOS zoom.
  - `bottom-sheet.tsx`: Touch-friendly drawer on mobile, modal on desktop.
  - `skeleton.tsx`: Accessible loading skeleton matching real layout shapes.
  - `toast.tsx`: Quiet, self-dismissing notification toasts.
  - `status-badge.tsx`: Order lifecycle status chips with semantic colors and text.
- `lib/utils.ts`: `cn()` class merger and `formatPrice()` currency formatter.
- `public/brand/`:
  - `logo.jpeg`: Cafe round badge logo ("Cheezy DIP - Melting in every bite").
  - `menu.png`: Complete printed menu poster.
  - `cheesy_dip_hero.jpg`: Commercial hero food photo (cheese pull dip).
  - `cafe_combo_hero.jpg`: Commercial hero food photo (burger + shake combo).
  - `dishes/`: 11 high-res generated dish photos across all categories.
- `tests/`: Unit and E2E test suites:
  - `unit/utils.test.ts`: Currency and class utility unit tests.
  - `unit/components.test.tsx`: UI component accessibility and touch target tests.

## 7. Database state
- Migrations: Scheduled for Phase 4.
- RLS Status: Target 100% table coverage with zero client write grants.
- Seed Data: Ready to populate in Phase 4 from menu catalog.

## 8. Commands run and results

| Date | Command | Result |
|---|---|---|
| 2026-10-17 | `Get-ChildItem -Force public/brand` | Pass: Found `logo.jpeg` and `menu.png` |
| 2026-10-17 | `npx skills add clerk/skills --list` | Pass: Retrieved 20 Clerk skills |
| 2026-10-17 | `npx skills add supabase/agent-skills --list` | Pass: Retrieved 2 Supabase skills |
| 2026-10-17 | `npx skills add ... -y` | Pass: Installed Clerk & Supabase skills |
| 2026-10-17 | Subagents (4 parallel image generators) | Pass: Generated 11 high-res dish photos + 2 hero photos |
| 2026-10-17 | `git init -b main` | Pass: Git repository initialized |
| 2026-10-17 | `npm install next react ...` | Pass: Core and dev dependencies installed |
| 2026-10-17 | `npm run lint` | Pass: 0 errors, 0 warnings |
| 2026-10-17 | `npm run typecheck` | Pass: 0 errors |
| 2026-10-17 | `npm test` | Pass: 2 test files, 6 tests passed (0 failed) |
| 2026-10-17 | `npm run build` | Pass: 18 static/dynamic routes built cleanly with Turbopack |

## 9. Security checklist progress
Copied from `docs/04-SECURITY-AND-RULES.md` section 8:
- [ ] RLS enabled on all tables; matrix in section 3 executed and passing
- [ ] No write grants for client roles on protected tables
- [ ] Service-role key absent from client bundle (bundle scan)
- [ ] Secret scan of git history clean
- [ ] Razorpay signature and webhook tests passing, including invalid signature and duplicates
- [ ] Amount/currency mismatch test passing
- [ ] Cron reconciliation tested
- [ ] Table QR abuse controls tested, token rotation tested
- [ ] India-only SMS allowlist confirmed; bot protection on
- [ ] CSP and security headers verified
- [ ] Legal pages live and linked, FSSAI/GST shown
- [ ] Owner account protected; staff list reviewed
- [ ] Backup restore rehearsed; rollback plan written
- [ ] Production Razorpay keys set only after test sign-off

## 10. Design state
- **Palette Tokens**:
  - `--brand-primary`: `#FFB800`
  - `--brand-primary-strong`: `#E6A600`
  - `--brand-accent`: `#D32F2F`
  - `--bg`: `#121212`, `--bg-raised`: `#1C1C20`, `--border`: `#2E2E34`
  - Status: New `#3B82F6`, Progress `#F59E0B`, Ready `#10B981`, Done `#059669`, Problem `#EF4444`
- **Typography**:
  - Display: `Bricolage Grotesque`
  - Body: `Figtree`
  - Banned fonts strictly avoided: No Inter, Geist, Space Grotesk.
- **Radii**:
  - Input: 8px, Card: 12px, Sheet: 20px, Pill: 999px.
- **Self-Review against docs/05 sections 3 & 12**:
  - 30-item avoid list: Passed.
  - Definition of Done for screens: Passed at 360px & 390px.
  - Status: Owner review pending (non-blocking).

## 11. Changelog
- 2026-10-17 | Phase 1 Foundation & Design System complete: Next.js 16 + React 19 + Tailwind v4 + TS 5.8 scaffolded; UI primitives built with min 44px touch targets; /dev/style-tile created; Vitest, Playwright, ESLint 9 CI workflow configured; all tests and build passed. | All Phase 1 files | Phase 1
- 2026-10-17 | Phase 0 Preparation complete: Brand assets ingested and generated via 4 parallel Gemini subagents; Clerk & Supabase skills installed; git initialized; .env.example created. | AGENTS.md, docs/, public/brand/, .agents/ | Phase 0

## 12. Next step
Proceed immediately with Phase 2 (Landing page and public menu with real menu items, search, category chips, animated hero, and legal links).
