# Cheezy dip cafe: Project Documentation Set

**Date:** 17 October 2026
**Status:** Planning complete. No application code exists yet.

## What is being built
A mobile-first ordering web app for one cafe. Visitors see an animated landing page with two choices: **View Menu** (public, prices visible) and **Order** (phone OTP login). Orders are **dine-in** through a permanent table QR (pay at counter) or **delivery** (Razorpay). Admin, owner and kitchen run everything from phones and get new-order alerts. English only.

## Files

| File | Purpose |
|---|---|
| `01-PRD.md` | What the product does, requirements, journeys, open decisions |
| `02-TRD.md` | Stack, routes, database, order and payment logic, tests |
| `03-ARCHITECTURE.md` | Diagrams, flows, trust boundaries, decision records |
| `04-SECURITY-AND-RULES.md` | Threat model, hard rules, test matrix, launch checklist |
| `05-DESIGN.md` | Design system, landing page, mobile UX, banned patterns |
| `06-PHASES.md` | Phases 0 to 10 with exit gates |
| `07-REPO-ANALYSIS.md` | Findings on the reference repos and the build decision |
| `AGENTS.md` | Rules file for the repository root |
| `ANTIGRAVITY-PROMPT.md` | Kickoff prompt, resume prompt, `MEMORY.md` format |

## Key decisions
1. **Build a new project; do not fork any repo.** No analysed repo has Clerk phone OTP, verified Razorpay, table QR and delivery together, and none shows a license file.
2. **All writes go through the server.** Clients only read through RLS.
3. **Delivery pays by Razorpay; dine-in pays at counter.** Both are settings, so this can change later.
4. **Delivery area is a pincode list** with a flat fee and a free-delivery threshold.
5. **Table QR encodes a random token**, so printed codes never change unless rotated. The final domain must be fixed before printing.
6. **Staff alerts use realtime plus Web Push** so phones that sleep still alert.

## Things to confirm before launch
- Clerk phone/SMS needs a paid plan in production, and India must be enabled on the SMS allowlist. India per-SMS cost was not verified.
- Razorpay merchant account owned by the cafe, with required policy pages.
- GST rate and price mode, FSSAI number, refund and cancellation policy.
- Final domain, table count, delivery area and fees, opening hours, staff phone numbers.

## How to start
Open `ANTIGRAVITY-PROMPT.md` and follow the "How to use" steps.
