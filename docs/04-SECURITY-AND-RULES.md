# 04. Security and Engineering Rules

**Project:** Cheezy dip cafe ordering platform
**Date:** 17 October 2026

Words used: **MUST** and **NEVER** are hard rules. A phase is not done if any applicable rule is broken.

---

## 1. Threat model

| # | Threat | Example | Control |
|---|---|---|---|
| T1 | Price or total tampering | Edit cart JSON to pay less | Server recomputes everything from database values (TRD 7.1) |
| T2 | Fake payment | Call "payment success" endpoint by hand | Signature verification plus webhook; callback alone never marks paid |
| T3 | Cross-customer data access | Change order id in URL | RLS on `sub`, server ownership checks, tested |
| T4 | Privilege escalation | User sets own role to admin | Roles only in `staff_members`, written by owner via server action |
| T5 | Remote fake dine-in orders | Someone orders to a table they are not at | Random QR token, signed table cookie, login, staff accept step, rate limits, rotation |
| T6 | SMS pumping / OTP abuse | Bots trigger many OTPs to premium numbers | India-only SMS allowlist, bot protection, resend cooldown, rate limits, spend alerts |
| T7 | Pay-at-counter no-shows | Order food, never pay | Verified phone, active-order cap, staff accept step, block list, admin report |
| T8 | Duplicate orders | Double tap, retry | Idempotency key unique per customer |
| T9 | Webhook spoofing/replay | Forged Razorpay event | Raw-body signature check, event id de-duplication, amount/order cross-check |
| T10 | Secret leakage | Key in repo, logs or bundle | Env rules, secret scanning, server-only modules |
| T11 | Realtime data leak | Customer subscribes to all orders | RLS-scoped realtime, no private data in broadcast channels |
| T12 | XSS / injection | Malicious note or item name | Output encoding, no `dangerouslySetInnerHTML` on user content, parameterized queries, CSP |
| T13 | Coupon abuse | Concurrent redemption beyond limit | Atomic redemption function with unique constraints |
| T14 | Stale/abandoned payments | Customer paid, order not marked | Cron reconciliation against Razorpay |
| T15 | Staff account takeover | Stolen staff phone | Admin session limits, immediate deactivate in `staff_members`, audit log |

---

## 2. Hard rules (copy into `AGENTS.md`)

### Identity and authorization
1. Every server action and route handler MUST authenticate and authorize itself. Hidden buttons and proxy/middleware checks are not security.
2. Role MUST come from `staff_members` only. NEVER read a role from client input, URL, local storage, or user-editable metadata.
3. NEVER trust client-supplied user ids, table ids, prices, totals, order status, payment status, or ownership.
4. Customers MUST only access their own orders and addresses. This MUST be proven by tests that change ids.
5. Role and staff changes MUST be owner-only and audited.

### Database
6. RLS MUST be enabled on every table. NEVER disable RLS to work around a bug.
7. `anon` and `authenticated` roles MUST have no insert/update/delete on orders, order_items, payments, refunds, staff_members, cafe_settings, coupons, dining_tables.
8. The service-role key MUST exist only in server-only modules. NEVER import it from a client component. NEVER prefix it with `NEXT_PUBLIC_`.
9. Schema changes MUST be migrations committed to git. NEVER hand-edit the production schema without a recorded migration.
10. Money MUST be integer paise. NEVER use floating point for money.
11. Order items MUST store immutable snapshots of name, price and options.

### Payments
12. Razorpay orders MUST be created server-side with the server-computed amount.
13. The checkout signature MUST be verified server-side. The webhook signature MUST be verified against the raw request body.
14. Webhook handling MUST be idempotent (event id) and MUST cross-check order id, amount and currency.
15. NEVER mark an order paid because the browser said so.
16. NEVER send an unpaid delivery order to the kitchen.
17. Refunds MUST be permission-checked and audited.
18. NEVER store card data. Store provider references only.
19. Use Razorpay **test mode** until the full test plan passes. The cafe owner owns the live merchant account and settlement bank account. NEVER route client revenue to a personal account.

### Secrets and logging
20. `.env.local` MUST be git-ignored. `.env.example` MUST contain names only.
21. NEVER paste secrets into prompts, logs, screenshots, commits or error messages.
22. Logs MUST NOT contain secrets, full webhook payloads, OTPs, or full addresses. Log order ids, payment ids and transitions.
23. If a secret is exposed, rotate it immediately and record it in `MEMORY.md` without the value.

### Input and output
24. Every server input MUST be validated with Zod (types, ranges, lengths, enums).
25. User-provided text MUST be rendered as text. NEVER inject it as HTML.
26. Apply rate limits to OTP-adjacent paths, checkout, coupon attempts, QR resolution and webhooks.
27. Set security headers and a Content Security Policy that permits only required origins (Clerk, Razorpay Checkout, Supabase).

### Quality and honesty
28. Never claim a test passed without running it. Report the real command and result.
29. Do not weaken a security rule to finish a task. Stop and ask.
30. Small, reviewable changes. Review every migration, RLS policy, payment handler and authorization change before merge.

---

## 3. RLS and authorization test matrix

Run as: anonymous, customer A, customer B, kitchen, admin, owner, blocked customer.

| Resource | Anon | Cust A (own) | Cust A (B's) | Kitchen | Admin | Owner |
|---|---|---|---|---|---|---|
| Public menu read | yes | yes | yes | yes | yes | yes |
| Orders read | no | yes | no | yes (all) | yes | yes |
| Orders write (direct) | no | no | no | no | no | no (server only) |
| Addresses read | no | yes | no | no | no | no |
| Payments read | no | own via order | no | no | yes | yes |
| Staff table read | no | no | no | self only | yes | yes |
| Settings write | no | no | no | no | via server action | via server action |
| Staff role change | no | no | no | no | no | via server action |
| Refund | no | no | no | no | yes | yes |

"Server action" means authorized by code, never by direct database access.

---

## 4. Table QR rules

- Tokens are random, at least 12 characters, from a cryptographically secure generator.
- Token to table resolution is server-side only. Unknown or rotated tokens return a friendly "ask staff for help" page, never an error trace.
- Table context lives in an httpOnly, secure, signed cookie with an expiry of a few hours. It is the only source of table id for orders.
- Dine-in order creation requires a valid table cookie, a logged-in verified phone, and a cafe that is open.
- Per-phone active dine-in order cap and rate limit.
- Admin can rotate a token and print a new sheet. Rotation does not affect past orders.

---

## 5. OTP and login rules

- Enable India only on the Clerk SMS allowlist (default is US and Canada only).
- Phone/SMS in production needs a paid Clerk plan. The owner confirms cost (OD-12).
- Keep resend cooldown and bot protection on. Add rate limits on the sign-in route.
- Set a spend alert or periodic check on SMS usage.
- Customers do not need email. Do not collect it unless a feature needs it.
- Blocked customers (`profiles.is_blocked`) cannot place orders; Clerk ban is used when full access revocation is required.

---

## 6. Privacy and legal

- Collect only: verified phone, name, addresses, order history.
- Provide a Privacy Policy that states what is collected, why, retention, who processes it (Clerk, Supabase, Vercel, Razorpay), and how to request deletion.
- Provide Terms of Service, Refund and Cancellation Policy, Delivery Policy, Contact page.
- Show FSSAI license number and GST details as supplied by the owner.
- Razorpay merchant onboarding commonly requires business policy pages on the website. Confirm the exact list in the Razorpay dashboard.
- India's Digital Personal Data Protection Act applies to personal data processing. Have the owner confirm policy wording with a qualified professional. This document is not legal advice.
- Define a retention period for old orders and addresses with the owner; implement deletion on request.
- Never invent reviews, ratings, awards, or business claims.

---

## 7. Operations

- Environments are separated (local, preview, production). No production data in development.
- Enable Supabase backups and rehearse a restore before launch.
- Monitor: server errors, webhook failures, payment/order mismatches, cron failures.
- Alert on repeated webhook signature failures.
- Review staff list when anyone leaves; deactivate in `staff_members` the same day.
- Update dependencies on a schedule; audit before launch.

---

## 8. Pre-launch security checklist

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
