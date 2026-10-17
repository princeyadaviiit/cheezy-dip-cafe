# Cheezy dip cafe: Engineering Rules for AI Agents

Save this file at the repository root as `AGENTS.md`. Full specs live in `docs/`.

## Read first, every session
1. `MEMORY.md` (current state, decisions, next step)
2. `docs/06-PHASES.md` (which phase is active)
3. The doc that governs the task: PRD `01`, TRD `02`, architecture `03`, security `04`, design `05`

If `MEMORY.md` and the docs disagree, stop and ask. Do not guess.

## Product in one paragraph
Mobile-first single-cafe ordering web app. Animated landing page with **View Menu** (public, prices visible) and **Order** (requires Clerk phone OTP login). Order types: **dine-in** through a permanent table QR (pay at counter) and **delivery** (Razorpay). Admin, owner and kitchen use the same app on phones with new-order alerts. English only.

## Stack
Next.js App Router, TypeScript strict, Tailwind with CSS-variable tokens, Clerk (phone OTP), Supabase (Postgres, RLS, Realtime, Storage), Razorpay, Zod, Vitest, Playwright, Web Push. Check current official docs and the installed versions before writing code. Never invent APIs.

## Hard rules
- Every server action and route handler authenticates and authorizes itself.
- Role comes only from `staff_members`. Never from client input or user-editable metadata.
- Never trust client prices, totals, roles, table ids, order status or payment status.
- All writes go through server code (`services/`), validated with Zod. Client database roles have no write grants on protected tables.
- RLS on every table. Never disable it to work around a bug.
- Service-role key is server-only (`server-only` module). Never `NEXT_PUBLIC_`.
- Money is integer paise.
- Razorpay: create orders on the server, verify the checkout signature, verify webhooks on the raw body, make processing idempotent, never mark paid from a browser callback, never send an unpaid delivery order to the kitchen.
- Table id for dine-in comes only from the signed table cookie set by `/t/[token]`.
- No secrets in code, logs, prompts or commits. `.env.example` holds names only.
- Schema changes are committed migrations.
- Business logic stays out of presentation components.

## Design rules
- Follow `docs/05-DESIGN.md` and the 30-item "Must avoid things" list. Inspect the logo, colors and photos in `public/brand/` before designing anything.
- Mobile first: design at 360 px, touch targets at least 44 px, admin and kitchen fully usable on a phone.
- Every async screen has loading (skeleton), empty and error states.
- No invented reviews, ratings, testimonials or claims. No emojis as UI. No Inter, Geist or Space Grotesk.

## Working style
- One phase at a time. Write a short plan before changing files.
- Small, reviewable changes. Stop at each phase exit gate and wait for approval.
- Run lint, typecheck, relevant tests and build when scripts exist. Report the real commands and results. Never claim an unrun test passed.
- Update `MEMORY.md` after every meaningful change (see its format).
- Do not copy code from third-party repositories (`docs/07-REPO-ANALYSIS.md`). Re-implement ideas.
- When a decision is missing, use the default in PRD section 9 and log it. If there is no default, ask.
