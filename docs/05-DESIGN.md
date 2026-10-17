# 05. Design System and UX Specification

**Project:** Cheezy dip cafe ordering platform
**Date:** 17 October 2026
**Goal:** A distinctive, premium, food-focused ordering experience that looks designed for this cafe, not like a generic AI-generated template. Mobile first.

---

## 1. Design principles

1. **Food first.** Real photography and clear prices carry the interface. Chrome and decoration stay quiet.
2. **One thumb.** Primary actions sit in the lower half of the screen. Navigation, cart and status actions are reachable on a 360 px wide phone.
3. **One identity everywhere.** Landing, menu, Clerk login screens, checkout, admin and kitchen share the same tokens, type and component behavior.
4. **Purposeful effects only.** Shadows, gradients, rounded corners, icons, cards and motion exist only when they help someone understand or act.
5. **Honest content.** No invented reviews, ratings, awards or claims. No stock food presented as the cafe's dishes.

---

## 2. Brand ingestion (do this before any UI work)

The client has the logo, colors and photos. The agent has not seen them yet, so **no brand color, font choice or imagery may be finalized until they are inspected.**

Required steps for Phase 1:
1. Place client assets in `public/brand/` (logo files, photos, any reference screenshots). If they are not in the repo, stop and ask.
2. Inspect the logo: extract its dominant colors, note shapes, line weight, and any lettering style.
3. Inspect the photos: note lighting, warmth, backgrounds and dominant food colors.
4. Write the derived palette, type decision and a short rationale into `MEMORY.md` and fill the token table in section 4.
5. Get the owner's approval on a one-screen style tile (logo, palette, type samples, one menu card, one button set) before building screens.

---

## 3. Compliance with the "Must avoid things" list

Every item must be honored. How each is handled:

| # | Avoid | Rule for this project |
|---|---|---|
| 1 | Harsh gradients | No aggressive gradients. Any gradient is subtle, uses brand colors, and serves a readability purpose (for example, a soft scrim behind text on a photo). |
| 2 | Lucide icons everywhere | Icons only where they add clarity (cart, back, close, status). Prefer text labels. One consistent, restrained icon style. |
| 3 | Pure white everywhere | Use a warm, brand-derived background and surface scale. Pure white allowed only for small elements where contrast needs it. |
| 4 | Rainbow coloring | One primary, one accent, neutrals, plus functional status colors used only for status. |
| 5 | Excessive drop shadows | Separate with spacing, borders and tone. Shadow only on floating layers (bottom sheet, sticky cart bar). |
| 6 | Three feature cards in a row | No template feature rows. Landing uses a single focused composition, then real dishes. |
| 7 | Emojis as decoration | No emojis in the UI. |
| 8 | Liquid glass | No glassmorphism or blur-translucent panels. |
| 9 | Excessive em dashes | Copy uses plain sentences. Avoid em dashes in user-facing text. |
| 10 | Inter, Geist, Space Grotesk | Not used. Pick a pairing that suits the logo (shortlist in section 5). |
| 11 | Colored left-border stripes | Not used on cards or alerts. Use full borders or tone changes. |
| 12 | Fake testimonials | None. No placeholder reviews or ratings. Add reviews only if the cafe supplies real ones. |
| 13 | Bento grids | Not used. Simple lists and single-column mobile layouts. |
| 14 | Decorative terminal windows | None. |
| 15 | "It's not X, it's Y" slogans | Copy is concrete: what the dish is, what it costs, how ordering works. |
| 16 | Checkmark bullets everywhere | Plain text or numbered steps where order matters. |
| 17 | Three pricing tiers | No pricing tiers. |
| 18 | Missing real product demos | Real dishes, real prices, working ordering flow. Placeholder images are marked as placeholders in dev and never ship. |
| 19 | Excessive rounded corners | Defined radius scale (section 4). Different components use different radii. |
| 20 | Purple-and-black default | Palette comes from the cafe's logo and food photography. |
| 21 | Missing skeleton loaders | Skeletons for menu, orders, admin tables, kitchen list. |
| 22 | Decorative radial orbs | None. |
| 23 | Decorative dot grids | None. |
| 24 | Sparkle icons | None. |
| 25 | Animated arrows everywhere | Arrows do not animate. |
| 26 | Missing Terms of Service | Page required (PRD FR-G1). |
| 27 | Missing Privacy Policy | Page required (PRD FR-G1). |
| 28 | Unnecessary hover animations | Interaction feedback is restrained: pressed states for touch, focus rings, small state changes only. |
| 29 | Neon colors | None. |
| 30 | Generic pastel defaults | Colors come from the brand, not from a pastel preset. |

Keep useful functionality even when it resembles a trend: skeleton loaders, accessible icons and meaningful feedback are encouraged.

---

## 4. Design tokens

Fill the values after brand ingestion. Names are fixed so code and docs stay aligned. Use CSS variables and map them in Tailwind.

| Token group | Tokens | Notes |
|---|---|---|
| Color, brand | `--brand-primary`, `--brand-primary-strong`, `--brand-accent` | Derived from logo |
| Color, surface | `--bg`, `--bg-raised`, `--bg-inset`, `--border`, `--border-strong` | Warm neutrals, not pure white |
| Color, text | `--text`, `--text-muted`, `--text-on-brand` | Verify contrast |
| Color, status | `--status-new`, `--status-progress`, `--status-ready`, `--status-done`, `--status-problem` | Used only for order status and validation |
| Type | `--font-display`, `--font-body`, size scale 12, 14, 16, 18, 22, 28, 36, 48 | Body at least 16 px on mobile inputs to avoid iOS zoom |
| Space | 4 px base: 4, 8, 12, 16, 24, 32, 48, 64 | |
| Radius | `--r-input: 8px`, `--r-card: 12px`, `--r-sheet: 20px`, `--r-pill: 999px` for chips only | Do not use one big radius for everything |
| Shadow | `--shadow-float` only | For floating layers |
| Motion | `--dur-fast: 120ms`, `--dur-base: 220ms`, `--ease-out` | Reduced-motion override sets durations near zero |

Dark mode is not required in v1.

---

## 5. Typography

Do not use Inter, Geist or Space Grotesk. Choose after seeing the logo's lettering.

Starting shortlist, all available as free Google Fonts and self-hosted through `next/font`:
- Display options: Fraunces (warm, soft serif), Young Serif, Bricolage Grotesque
- Body options: Figtree, Instrument Sans, Public Sans

Rules: at most two families. Set at most three weights. Prices use tabular numerals. Verify the chosen fonts support the Rupee sign. Record the final pairing and reason in `MEMORY.md`.

---

## 6. Layout rules (mobile first)

- Design at 360 px width. Scale up to tablet and desktop with a centered content column; admin may use a two-column layout from tablet width.
- Minimum touch target 44 by 44 px. Minimum 8 px between targets.
- Bottom area is the action zone: sticky mini-cart bar on menu and ordering, primary action on checkout, status actions on kitchen cards.
- Use a bottom navigation for the admin and kitchen apps (Orders, Menu, Settings, More). Customer app uses a simple top bar plus the sticky cart bar.
- Use bottom sheets for item detail and options on mobile, centered dialogs on desktop.
- Respect safe areas (notches, home indicator). Avoid fixed elements that cover form fields when the keyboard opens.
- Inputs use the correct `inputmode` and `autocomplete` (for example `tel`, `one-time-code` for OTP).
- Use spacing and type scale for hierarchy rather than boxing everything in cards.

---

## 7. Landing page

**Purpose:** Make a strong first impression in seconds, then get the visitor to View Menu or Order.

### Structure (single scroll, mobile first)
1. **Hero (first screen):** Cafe logo or wordmark, one concrete line about what the cafe serves, and the two actions: **View Menu** (secondary style) and **Order** (primary style), both visible without scrolling and reachable by thumb.
2. **Signature dishes:** A short sequence of real dishes with real prices, horizontally or vertically stacked, linking into the menu. Content and photos come from the client.
3. **How ordering works:** Two short columns or steps: Dine-in (scan the table QR) and Delivery (log in, choose address, pay online). Plain text, no checkmark list.
4. **Visit and contact:** Address, hours, phone, open/closed state, map link.
5. **Footer:** Legal links, FSSAI/GST details, social links if supplied.

### Animated, attention-grabbing, within the rules
The animation should come from the food and brand, not from decorative effects. Suggested concept for the agent to prototype and the owner to approve:
- A "dip" moment built from real photography or a short looping video of the cafe's cheesy dip, with the headline and buttons arriving in a staggered reveal. The motion explains the product (cheese, dipping, pulling) instead of floating shapes.
- Use CSS transforms and opacity, or a very small animation helper. Heavier libraries need justification and measured cost in `MEMORY.md`.
- Video if used: short, muted, looped, compressed, with a poster image, `playsinline`, not autoplayed when the user has data-saver or reduced-motion enabled.
- Buttons are interactive from the first paint; animation never delays them.
- `prefers-reduced-motion`: show the final static composition.
- Budgets: LCP at most 2.5 s on mid-range Android over slow 4G, CLS at most 0.1, initial JS target at most 170 KB gzip.
- Forbidden: glowing orbs, mesh gradients, glass cards, animated arrows, sparkle icons, dot grids, neon.

If the client does not yet have a usable "dip" photo or clip, use a still hero photograph with a restrained reveal and flag the gap in `MEMORY.md`.

---

## 7a. Public menu and ordering menu

- Sticky category chips for quick jump, search field, optional veg/non-veg filter.
- Item row: photo (square or 4:3 consistently), name, short description (two lines max), price in Rupees, veg/non-veg marker, availability.
- Sold-out items stay visible but muted with a clear label and no add control.
- Public menu: each item has an "Order" prompt that starts login. Ordering menu: an "Add" control.
- Item sheet: larger photo, options with required/optional labels and min/max messages, live price change, quantity, Add button showing the line total.
- Prices use tabular numerals and always show the currency symbol.

## 7b. Cart and checkout

- Cart lists items with options and quantity steppers, remove action, and a clear summary (subtotal, discount, delivery fee, tax per OD-05, total).
- Checkout is one scrolling screen with clear sections: order type (dine-in shows the table label from the QR and no selection needed), address (delivery), coupon, payment method, notes, final total, primary action.
- Delivery shows the fee and minimum order before the pay step; out-of-area addresses show a specific message.
- Errors are inline and specific. Never clear the cart on error.
- After payment or placement: a confirmation page with order number, status and a link to tracking.

## 7c. Order tracking

- Status shown as an ordered list of steps with the current step emphasized (text first, color second). Dine-in and delivery have their own step sets.
- Updates arrive live; a short "last updated" text and a manual refresh fallback.

## 7d. Login screens

- Clerk components themed with the same tokens and fonts. Large phone field with +91 prefix, clear OTP entry with resend timer and edit-number action.
- Copy states why login is needed: to place and track the order.

## 7e. Admin and kitchen (phone first)

**Kitchen**
- One column of large order cards, newest at top. Each card: order number, big table label or "Delivery", time since placed, item list with options and notes, one prominent next-status button.
- Alert controls at the top: "Enable alerts" button (needed to unlock sound), connection state, and a visible counter of new orders.
- High contrast, readable at arm's length, usable with wet or gloved fingers (large targets).

**Admin**
- Home: live orders summary, today's totals, quick toggles (accepting orders, delivery on/off, mark item sold out).
- Lists use rows, not wide tables, on mobile. Filters collapse into a sheet.
- Menu editor: item list with search, availability switch inline, edit in a sheet or full screen form, image upload with preview.
- Destructive actions (delete item, refund, rotate QR) require confirmation with clear consequences.
- Tables screen: list of tables with QR preview, download print sheet, rotate token, deactivate.

---

## 8. States and feedback

Every async screen defines: loading (skeleton matching the final layout), empty (helpful message and next action), error (what happened, what to do, retry), offline/reconnecting (banner). Success feedback is quiet and specific (for example "Item marked sold out").

## 9. Images

- Real photography supplied by the client. Never present stock or generated images as the cafe's own dishes.
- Store originals, serve resized AVIF/WebP with explicit width and height and a blur or tone placeholder.
- Alt text for every meaningful image (dish name and short description).
- Define one aspect ratio for menu thumbnails and one for hero imagery to keep layout stable.

## 10. Accessibility

- WCAG 2.2 AA contrast for text and controls (check brand colors, fix tokens if needed).
- Visible keyboard focus. Logical tab order. Labels for every input.
- Status changes announced to screen readers (live regions for new orders and order status).
- Do not rely on color alone for status.
- Reduced-motion and larger-text support.

## 11. Copywriting rules

- Plain, specific, friendly. Short sentences. Use real dish names and real prices.
- Avoid contrast slogans ("It's not X, it's Y"), hype words and em-dash-heavy copy.
- Errors and empty states tell the person what to do next.
- English only.

## 12. Definition of done for any screen

- Matches tokens, type and radius scale.
- Works at 360 px, 390 px and 768 px widths.
- Has loading, empty and error states.
- Passes keyboard and contrast checks.
- Honors the section 3 table, with no banned pattern present.
- Looks right with real content, not lorem ipsum.
