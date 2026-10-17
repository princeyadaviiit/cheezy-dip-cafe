# 01. Product Requirements Document (PRD)

**Product:** Cheezy dip cafe, mobile-first ordering web app
**Version:** 1.0 (planning)
**Date:** 17 October 2026
**Status:** Approved direction, open decisions listed in section 9

---

## 1. Overview

Cheezy dip cafe needs a branded website where customers can look at the menu, then order for **dine-in (by scanning a permanent table QR)** or for **delivery**. The cafe team manages orders, menu and settings from a phone. Almost every user will be on a mobile browser, so the whole product is designed mobile-first, desktop second.

This is a single-cafe product. It is not a marketplace, and it does not need multi-restaurant features.

### Goals

1. A landing page that grabs attention in the first seconds and sends people to one of two actions: **View Menu** or **Order**.
2. A public menu with real prices that anyone can read without logging in.
3. Phone number + OTP login, required only when the person chooses to order.
4. Two order types: **dine-in** (table QR) and **delivery**.
5. Online payment (Razorpay) for delivery, and pay-at-counter for dine-in.
6. An admin panel and kitchen screen that work fully on a phone and alert staff when a new order arrives.
7. A premium, food-focused look that follows `05-DESIGN.md` and the "Must avoid things" list.

### Non-goals (version 1)

- Multiple cafes or branches, marketplace features, commissions.
- Native iOS or Android apps (a PWA install is allowed).
- Rider app, live rider tracking, third-party courier dispatch.
- Loyalty points, subscriptions, table reservations, event booking.
- Takeaway/pickup (easy to add later, see OD-09).
- Hindi or other languages. English only.
- Automatic GST filing or accounting.

---

## 2. Users and roles

| Role | Who | Can do |
|---|---|---|
| Visitor | Anyone, not logged in | See landing page, full menu with prices, legal pages. Cannot add to cart or order. |
| Customer | Logged in with phone OTP | Order (dine-in or delivery), pay, track orders, see own history, manage addresses. |
| Kitchen | Cafe staff | See incoming orders, move them through preparation states. |
| Admin | Manager | Everything kitchen can do, plus menu, prices, availability, coupons, delivery settings, tables/QR, reports, refunds. |
| Owner | Cafe owner | Everything admin can do, plus staff management and sensitive settings. |

Roles are assigned by the owner in the app, never by the user themselves.

---

## 3. Core user journeys

### J1. Visitor browses the menu
Open site, see animated landing page, tap **View Menu**, scroll categories, see items with photos and prices. No login. Each item shows a clear "Order" prompt that leads to J2.

### J2. First order (login gate)
Tap **Order** on landing or menu. If not logged in, show phone number + OTP login. After login, return to exactly where they were, and the ordering experience begins (add to cart, choose order type, checkout).

### J3. Dine-in via table QR
Customer scans the permanent QR on the table. The menu opens directly with a banner such as "Table 5". They browse, tap **Order**, log in once (if needed), add items, and place the order. The table is attached automatically. They choose **Pay at counter**. Staff see "Table 5" on the order.

### J4. Delivery order
Customer logs in, picks **Delivery**, selects or adds an address (must be inside the delivery area), sees delivery fee and total, and pays through Razorpay. They watch status: placed, accepted, preparing, ready, out for delivery, delivered.

### J5. Staff handles an order
A phone or tablet beeps and shows a visual alert. Staff open the order, accept, mark preparing, ready, then served (dine-in) or out for delivery then delivered (delivery). For counter payments, staff mark the order paid when cash/UPI is received.

### J6. Admin changes the menu
Admin opens the panel on a phone, toggles an item "sold out", edits a price, or uploads a photo. The public menu reflects it without a redeploy.

---

## 4. Functional requirements

Priority: **P0** = must ship in v1, **P1** = should ship in v1, **P2** = later.

### 4.1 Landing page

| ID | Requirement | Pri |
|---|---|---|
| FR-L1 | Animated, attention-grabbing hero built around the cafe's real food and brand (see `05-DESIGN.md`). | P0 |
| FR-L2 | Two primary actions always visible without scrolling: **View Menu** and **Order**. | P0 |
| FR-L3 | Respects `prefers-reduced-motion`; animation never blocks the buttons. | P0 |
| FR-L4 | Shows cafe name, short real description, opening status (open/closed), address, phone, links to legal pages. | P0 |
| FR-L5 | Loads fast on mid-range Android over 4G (budgets in section 5). | P0 |

### 4.2 Public menu

| ID | Requirement | Pri |
|---|---|---|
| FR-M1 | Categories, items, descriptions, real photos, prices, veg/non-veg marking. | P0 |
| FR-M2 | Available/sold-out state is visible. Sold-out items cannot be ordered. | P0 |
| FR-M3 | Search and category quick-jump suited to one-thumb use. | P0 |
| FR-M4 | Item detail sheet showing customization options and price changes. | P1 |
| FR-M5 | Menu renders with skeleton loaders, never a blank screen. | P0 |
| FR-M6 | Prices shown on the public menu are always the same as the ordering menu. | P0 |

### 4.3 Authentication

| ID | Requirement | Pri |
|---|---|---|
| FR-A1 | Phone number + OTP login through Clerk. Indian numbers (+91). | P0 |
| FR-A2 | Login is triggered only when the person taps Order (or opens account/orders). Menu stays public. | P0 |
| FR-A3 | After login, return the person to where they were, with table context and cart intact. | P0 |
| FR-A4 | Clear OTP UX: resend timer, wrong-code message, number edit. Login screens follow the same design as the rest of the site. | P0 |
| FR-A5 | Admin, kitchen and owner use the same login; their role is looked up from the staff table. | P0 |

### 4.4 Cart and customization

| ID | Requirement | Pri |
|---|---|---|
| FR-C1 | Add, remove, change quantity; cart survives refresh and login. | P0 |
| FR-C2 | Item options and add-ons (for example dip choices, extra cheese) with min/max rules. | P0 |
| FR-C3 | A sticky mini-cart bar on mobile showing item count and total. | P0 |
| FR-C4 | Per-item note and an order note. | P1 |
| FR-C5 | Coupon code field with clear valid/invalid messages. | P1 |

### 4.5 Dine-in with permanent table QR

| ID | Requirement | Pri |
|---|---|---|
| FR-D1 | Each table has one **permanent** QR code. The QR never changes unless the admin deliberately rotates it. | P0 |
| FR-D2 | Scanning the QR opens the menu directly with the table shown. No manual table entry. | P0 |
| FR-D3 | The table is attached to the order server-side from a trusted source, not from user-editable fields. | P0 |
| FR-D4 | Dine-in payment method: **Pay at counter** (default). | P0 |
| FR-D5 | Admin can create tables, download a print-ready QR sheet, deactivate a table, and rotate a table's QR if it is abused. | P0 |
| FR-D6 | Staff see the table label prominently on each dine-in order. | P0 |

### 4.6 Delivery

| ID | Requirement | Pri |
|---|---|---|
| FR-V1 | Customer saves one or more addresses (name, phone, address, landmark, area, pincode). | P0 |
| FR-V2 | Delivery is allowed only inside the configured delivery area (pincode/area list). Out-of-area addresses are rejected with a clear message. | P0 |
| FR-V3 | Delivery fee, free-delivery threshold and minimum order are configurable by admin. | P0 |
| FR-V4 | Delivery orders must be paid online through Razorpay before reaching the kitchen. | P0 |
| FR-V5 | Delivery has its own statuses: out for delivery, delivered. | P0 |
| FR-V6 | Admin can switch delivery on/off independently of dine-in. | P0 |
| FR-V7 | Optional GPS "use my location" helper for the address form. | P2 |

### 4.7 Checkout and payments

| ID | Requirement | Pri |
|---|---|---|
| FR-P1 | Server recalculates every price, option, coupon, fee and tax at checkout. Client totals are never trusted. | P0 |
| FR-P2 | Razorpay Checkout for delivery (UPI, cards, netbanking as enabled on the cafe's merchant account). | P0 |
| FR-P3 | A payment is "paid" only after server-side verification plus webhook reconciliation. | P0 |
| FR-P4 | Pay at counter: order is placed with payment "pending at counter"; staff mark paid. | P0 |
| FR-P5 | Failed, abandoned and duplicate payments are handled without losing orders or double charging. | P0 |
| FR-P6 | Admin can refund a paid order (full or partial) with an audit entry. | P1 |
| FR-P7 | Order confirmation screen and a simple digital receipt. | P1 |

### 4.8 Order tracking and account

| ID | Requirement | Pri |
|---|---|---|
| FR-T1 | Live status page per order (updates without manual refresh). | P0 |
| FR-T2 | Order history, visible only to the person who placed the order. | P0 |
| FR-T3 | Cancel while the order is still "placed" (before acceptance), subject to policy OD-06. | P1 |
| FR-T4 | Address book management. | P0 |

### 4.9 Admin panel (mobile first)

| ID | Requirement | Pri |
|---|---|---|
| FR-X1 | Order queue with filters (status, type, date), order detail, and status actions. | P0 |
| FR-X2 | Menu management: categories, items, photos, prices, availability, options/add-ons. | P0 |
| FR-X3 | One-tap "sold out" toggle from the order screen or item list. | P0 |
| FR-X4 | Cafe settings: open/closed, accepting orders, delivery on/off, opening hours, delivery fee/area/minimum. | P0 |
| FR-X5 | Tables and QR management (FR-D5). | P0 |
| FR-X6 | Coupons: create, edit, activate/deactivate, usage limits and expiry. | P1 |
| FR-X7 | Sales summary: today, week, month, by order type, by payment method. | P1 |
| FR-X8 | Staff management (owner only): add/remove staff by phone number, assign role. | P0 |
| FR-X9 | Customer list with ability to block abusive numbers. | P1 |
| FR-X10 | Audit trail for sensitive actions (status changes, price edits, refunds, role changes). | P0 |

### 4.10 Kitchen screen

| ID | Requirement | Pri |
|---|---|---|
| FR-K1 | Simple large-card view of active orders, newest first, table label or delivery tag visible. | P0 |
| FR-K2 | Instant new-order alert: sound + visual + vibration where supported. Visual alert always works. | P0 |
| FR-K3 | Status buttons limited to what the role may do. | P0 |
| FR-K4 | Reconnect handling: if live updates drop, show it and refetch the current list. | P0 |
| FR-K5 | Screen stays awake while the kitchen view is open (where the browser allows). | P1 |

### 4.11 Notifications

| ID | Requirement | Pri |
|---|---|---|
| FR-N1 | New-order alert to admin and kitchen (in-app realtime). | P0 |
| FR-N2 | Web Push to installed/allowed devices so alerts arrive when the app is in the background. | P1 |
| FR-N3 | Customer status updates are shown in-app on the tracking page. | P0 |
| FR-N4 | WhatsApp/SMS order notifications. | P2 |

### 4.12 Legal and trust pages

| ID | Requirement | Pri |
|---|---|---|
| FR-G1 | Terms of Service, Privacy Policy, Refund and Cancellation Policy, Delivery Policy, Contact page. | P0 |
| FR-G2 | FSSAI license number and GST details (supplied by the owner) shown where required. | P0 |
| FR-G3 | No invented reviews, ratings, awards or claims anywhere. | P0 |

---

## 5. Non-functional requirements

| Area | Requirement |
|---|---|
| Mobile first | Designed at 360 px width first. Every screen, including admin and kitchen, fully usable one-handed on a phone. Touch targets at least 44 px. |
| Performance | Targets on a mid-range Android over simulated slow 4G: LCP at most 2.5 s, CLS at most 0.1, INP at most 200 ms. Landing initial JavaScript target at most 170 KB gzip. Images served as responsive AVIF/WebP. |
| Accessibility | WCAG 2.2 AA contrast, visible focus, labelled inputs, screen-reader friendly status changes, reduced-motion support. |
| Reliability | No lost orders on refresh, double tap, flaky network or webhook retry. |
| Security | As defined in `04-SECURITY-AND-RULES.md`. |
| Browser support | Current Chrome and Safari on Android and iOS, plus current desktop browsers. |
| Language | English only. |
| Data | Only collect what ordering needs: phone, name, addresses, orders. |

---

## 6. Order types and payment matrix

| Order type | Where it comes from | Allowed payment (default) | Notes |
|---|---|---|---|
| Dine-in | Table QR | Pay at counter | Online payment can be enabled later by a setting (OD-02). |
| Delivery | Order flow, address required | Razorpay online | COD not offered unless the client asks (OD-01). |

---

## 7. Success criteria

- A first-time visitor can reach the menu in one tap and place a dine-in order in under about two minutes on a phone.
- Staff can run a full service from phones with no missed orders.
- Every acceptance test in `02-TRD.md` section 14 passes.
- Real test payments succeed, fail, and refund correctly in Razorpay test mode before going live.
- Lighthouse mobile performance and accessibility at or above 90 on landing, menu and checkout.

---

## 8. Client inputs required

| Item | Needed by phase |
|---|---|
| Logo (vector if possible), brand colors, fonts if any | Phase 1 |
| Real food photos (high resolution), cafe interior photos | Phase 1 |
| Full menu: categories, names, descriptions, prices, veg/non-veg, add-ons | Phase 2 |
| Final domain name (QR codes depend on it) | Before printing QR |
| Number of tables and their labels | Phase 5 |
| Opening hours, delivery hours | Phase 6 |
| Delivery area (pincodes/areas), fee, minimum order | Phase 7 |
| GST number and rate, FSSAI number, registered business name and address | Phase 9 |
| Razorpay merchant account (owned by the cafe) | Phase 7 |
| Cancellation and refund rules | Phase 9 |
| Staff list with phone numbers and roles | Phase 6 |

---

## 9. Open decisions

Defaults apply until the client decides. Agents must not invent policy beyond these defaults.

| ID | Question | Default |
|---|---|---|
| OD-01 | Cash on delivery for delivery orders? | No. Delivery is Razorpay only. |
| OD-02 | Online payment for dine-in too? | No. Pay at counter only. Setting exists, off. |
| OD-03 | Delivery area method | Pincode/area allow-list, not GPS radius. |
| OD-04 | Delivery fee model | Flat fee, free above a threshold, minimum order value. |
| OD-05 | GST: prices inclusive or exclusive, rate, GSTIN | Prices inclusive; to be confirmed with accountant. |
| OD-06 | Cancellation and refund windows | Customer may cancel before acceptance; later cancellation by staff only. |
| OD-07 | Opening hours and delivery hours | Set by admin in settings. |
| OD-08 | Login required for dine-in orders | Yes (matches the client's flow). |
| OD-09 | Takeaway/pickup | Not in v1. |
| OD-10 | Final domain | Needed before QR printing. |
| OD-11 | Who delivers, and is rider phone shown to customer | Cafe's own staff; phone not shown in v1. |
| OD-12 | Clerk plan and SMS cost for India accepted | See TRD section 3 and Security section 5. |
| OD-13 | Extra login method (for example Google) as OTP fallback | None in v1. |
| OD-14 | WhatsApp notifications | Later (P2). |
