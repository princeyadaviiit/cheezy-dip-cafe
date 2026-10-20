# 🧀 Cheezy Dip Cafe - Online Ordering & Kitchen Operations Platform

A modern, mobile-first, high-performance web application for **Cheezy Dip Cafe**. Features a seamless customer ordering flow for **Dine-In (Table QR)** and **Prepaid Delivery (with live GPS detection)**, paired with a unified **Admin & Kitchen Display System (KDS)** on a dedicated subdomain with master passkey security.

---

## 🌟 Key Features

### 👤 Customer Experience (Primary Domain: `cheezydipcafe.com`)
- **Animated Landing Page**: Showcase brand story, signature dips, opening hours, and location.
- **Public Menu Browsing**: Instant access to prices, dietary badges (100% Pure Veg), and dish categories without mandatory login.
- **Clerk Authentication**: Clean sign-in and sign-up with email/password and social login. Customer navigation is strictly customer-focused (no staff links).
- **Dine-In Table QR Sessions**: Cryptographically signed table tokens (`/t/[token]`) setting secure session cookies. Customers order directly from their phone and pay at the counter.
- **100% Prepaid Delivery with Live GPS**:
  - Direct **"📍 Use My Current Location"** button detecting exact HTML5 GPS coordinates (`lat`, `lng`).
  - No Cash on Delivery (COD) allowed; 100% prepaid via Razorpay.
  - Transparent **Strict No-Cancellation Policy** notice.
- **Real-Time Order Tracking**: 5-step dynamic live tracking stepper (`Placed` → `Accepted` → `Cooking` → `Ready/On Way` → `Served/Delivered`) with direct Google Maps location view.
- **Theme Switcher**: Crisp Light Mode by default, with smooth Dark Mode toggle.

### 🛡️ Admin & Kitchen Operations Hub (Subdomain: `admin.cheezydipcafe.com`)
- **Gatekeeper Master Passkey Protection**:
  - One-time passkey entrance (`ADMIN_GATE_PASSKEY`, default: `cheezy2026`) before accessing the admin dashboard or Clerk admin login.
  - Generates an HMAC-SHA256 signed `httpOnly` cookie (`cd_admin_gate`) valid for 30 days.
- **Real-Time New Order Pop-up & Chime Alert**:
  - Prominent modal pops up instantly when a new order arrives.
  - Plays a cheerful two-tone cafe chime via Web Audio API.
  - Displays customer mobile number (`tel:...`), full item breakdown, and **"🗺️ Open in Google Maps"** GPS navigation link.
  - 1-click **"Approve & Cook"** button immediately transitions order to `preparing` and updates customer live tracking.
- **Unified Kitchen KDS**:
  - Live order queue with elapsed timers (e.g. `4m ago`), sub-status filters (`Incoming`, `In Prep`, `Ready`, `All Active`).
  - Status transition controls and "Mark Paid at Counter" for dine-in tables.
- **Staff & Admin Management**:
  - View all registered Admins, Owners, and Kitchen staff.
  - Register new staff and admin accounts (Name, Phone, Email, Role).
  - Toggle staff status (Active / Inactive).
- **Menu 86s / Availability**: Toggle any dish in or out of stock in real-time.
- **Cryptographic Table QR Rotator**: Rotate table QR tokens on the fly if physical stickers are compromised.
- **Sales & Business Analytics**: Today, weekly, and monthly revenue, order volume, and average order value.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router & Turbopack)
- **Language**: TypeScript Strict Mode
- **Styling**: Tailwind CSS with semantic CSS-variable design tokens
- **Auth**: Clerk (Free Tier compatible, Email/Password & Social OAuth)
- **Database**: Supabase Postgres with Row Level Security (RLS)
- **Payments**: Razorpay (Prepaid Delivery)
- **Validation**: Zod (Type-safe schemas)
- **Audio & Alerts**: Web Audio API oscillator chime + Vibration API
- **Testing**: Vitest (68 unit/integration tests) + Playwright (Mobile E2E)
- **Linting**: ESLint with React Compiler rules

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Clerk, Supabase, and Razorpay keys:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
ADMIN_GATE_PASSKEY=cheezy2026
TABLE_COOKIE_SECRET=your_32_byte_secret_key_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret_here
NEXT_PUBLIC_CAFE_PHONE=+918696321018
```

### 3. Run Development Server
```bash
npm run dev
```

- Customer App: [http://localhost:3000](http://localhost:3000)
- Admin & KDS Portal: [http://localhost:3000/admin](http://localhost:3000/admin) or [http://admin.localhost:3000](http://admin.localhost:3000)

---

## 🧪 Verification Commands

```bash
# Typecheck TypeScript
npm run typecheck

# Lint Codebase
npm run lint

# Run Unit and Integration Tests
npm test

# Build for Production
npm run build
```

---

## 📖 Subdomain & Production Deployment Guide

For full instructions on configuring DNS, Vercel, Nginx, Clerk cookies, and subdomains, see:
👉 **[docs/setup.md](docs/setup.md)**

---

## 📄 License
Private & Proprietary © Cheezy Dip Cafe. All rights reserved.
