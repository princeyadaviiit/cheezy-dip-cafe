# Cheezy Dip Cafe: Production Setup & Subdomain Hosting Guide

This guide explains how to host the **Cheezy Dip Cafe** ordering platform with a completely separated **Admin & Kitchen KDS Dashboard** on a subdomain (e.g. `admin.cheezydipcafe.com`) while keeping the **Customer Ordering App** clean, fast, and accessible on the primary domain (`cheezydipcafe.com`).

---

## 1. Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │            DNS / Cloudflare          │
                      └──────────────────┬───────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
     Primary Domain:                                 Admin Subdomain:
  cheezydipcafe.com / www                         admin.cheezydipcafe.com
                 │                                               │
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │    Customer App           │                   │  Admin Gatekeeper Screen  │
   │  • Animated Landing Page  │                   │  • Master Passkey Entry   │
   │  • Public View Menu       │                   │  • 30-Day Signed Cookie   │
   │  • Table Dine-In QR Flow  │                   └─────────────┬─────────────┘
   │  • Prepaid Delivery (GPS) │                                 │ Unlocked
   │  • Live Customer Tracking │                                 ▼
   │  • Clerk Auth Profile     │                   ┌───────────────────────────┐
   └───────────────────────────┘                   │  Unified Admin & KDS Hub  │
                                                   │  • Realtime Chime Popup   │
                                                   │  • Kitchen Live KDS Queue │
                                                   │  • 1-Click Order Approval │
                                                   │  • Google Maps GPS Nav    │
                                                   │  • Staff & Admins Manager │
                                                   │  • Menu 86s Availability  │
                                                   │  • Dynamic QR Rotator     │
                                                   │  • Sales & Daily Reports  │
                                                   └───────────────────────────┘
```

---

## 2. Key Security Features

1. **Master Gatekeeper Passkey (`ADMIN_GATE_PASSKEY`)**:
   - Before any Clerk sign-in form is displayed on `admin.*`, visitors must enter the cafe entrance passkey (default: `cheezy2026`).
   - Once verified, an HMAC-SHA256 signed `httpOnly` cookie (`cd_admin_gate`) is stored for 30 days.
   - Unauthorized public users cannot view or attempt logins against the admin routes.
2. **Clerk Authentication Separation**:
   - Customer UI exposes only customer profile links and order history.
   - Staff roles (`admin`, `owner`, `kitchen`) are validated strictly from `staff_members` (via `getStaffRole()` in server actions and middleware).
3. **No-COD & Strict Cancellation Policy**:
   - All delivery orders require 100% online prepayment via Razorpay.
   - Strict no-cancellation policy notice is enforced and clearly displayed at checkout.
4. **GPS Delivery Geolocation**:
   - Customers can click "📍 Use My Current Location" to pin their coordinates.
   - Admin and delivery drivers get a direct **"🗺️ Open in Google Maps"** navigation button with pre-filled coordinates.

---

## 3. Environment Variables

Create `.env.local` for local development or enter these in your Vercel / host environment settings:

```env
# Application Base URL
NEXT_PUBLIC_APP_URL=https://cheezydipcafe.com

# Clerk Authentication (Get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/order
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/order

# Admin Gatekeeper Passkey & Cookie Secret
ADMIN_GATE_PASSKEY=cheezy2026
TABLE_COOKIE_SECRET=your_secure_random_32_character_secret_here

# Supabase (Database & Storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Razorpay (Test / Live credentials)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Cafe Support Contact
NEXT_PUBLIC_CAFE_PHONE=+919876543210
```

---

## 4. Hosting on Vercel with Subdomains (Recommended)

### Step 1: Add Both Domains to Your Vercel Project
1. Go to **Vercel Dashboard** → Select your `cheezy-dip-cafe` project → **Settings** → **Domains**.
2. Add the primary domain: `cheezydipcafe.com` (and redirect `www.cheezydipcafe.com` to it).
3. Add the admin subdomain: `admin.cheezydipcafe.com`.

### Step 2: DNS Configuration
Add the DNS records at your domain registrar (Cloudflare, GoDaddy, Namecheap, etc.):

| Type | Name | Content / Value | Proxy Status |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` (Vercel IP) | DNS Only (or Proxied) |
| **CNAME** | `www` | `cname.vercel-dns.com` | DNS Only (or Proxied) |
| **CNAME** | `admin` | `cname.vercel-dns.com` | DNS Only (or Proxied) |

### Step 3: Clerk Cookie & Multi-Domain Configuration
1. In the **Clerk Dashboard** → **Configure** → **Domains**:
   - Set the Primary Domain to: `cheezydipcafe.com`
   - If using Clerk Multi-domain feature, enable Satellite domains and add `admin.cheezydipcafe.com`.
   - Alternatively, enable **Shared Root Domain Cookies** in Clerk:
     - Set Cookie Domain to: `.cheezydipcafe.com` (leading dot).
     - This automatically shares the Clerk session between `cheezydipcafe.com` and `admin.cheezydipcafe.com` seamlessly!

---

## 5. Hosting with Nginx / Custom VPS (Docker or Node PM2)

If hosting on a Linux VPS (Ubuntu/Debian) using Node PM2 or Docker:

### Nginx Configuration File (`/etc/nginx/sites-available/cheezydipcafe.conf`)

```nginx
# 1. Customer Application (cheezydipcafe.com & www)
server {
    server_name cheezydipcafe.com www.cheezydipcafe.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 80;
}

# 2. Admin & Kitchen Dashboard Subdomain (admin.cheezydipcafe.com)
server {
    server_name admin.cheezydipcafe.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 80;
}
```

### Enable SSL with Let's Encrypt Certbot
```bash
sudo certbot --nginx -d cheezydipcafe.com -d www.cheezydipcafe.com -d admin.cheezydipcafe.com
```

---

## 6. Local Testing with Subdomains

To test subdomain routing on your local development machine:

### Option A: Using `admin.localhost:3000`
Next.js supports subdomain testing on localhost directly in modern browsers:
- Visit `http://localhost:3000` → Loads Customer Storefront.
- Visit `http://admin.localhost:3000` → Loads Admin Gatekeeper & KDS Dashboard.

### Option B: Using `hosts` file
On Windows (`C:\Windows\System32\drivers\etc\hosts`) or macOS/Linux (`/etc/hosts`), add:
```
127.0.0.1  cheezydip.local
127.0.0.1  admin.cheezydip.local
```
Then visit `http://admin.cheezydip.local:3000` in your browser.

---

## 7. How Subdomain Rewriting Works in Code

The Next.js middleware in `proxy.ts` detects the incoming request host:
```typescript
const host = req.headers.get("host") || "";
const isSubdomainAdmin = host.startsWith("admin.") || host.startsWith("admin-");

// When visiting root of admin subdomain, automatically routes to /admin
if (isSubdomainAdmin && req.nextUrl.pathname === "/") {
  const adminUrl = new URL("/admin", req.url);
  return NextResponse.rewrite(adminUrl);
}
```

When visiting `admin.cheezydipcafe.com`:
1. Middleware transparently serves `/admin`.
2. The gatekeeper checks for the signed `cd_admin_gate` cookie.
3. If not unlocked, prompts for the master passkey (`ADMIN_GATE_PASSKEY`).
4. Once verified, grants full access to the unified Admin Dashboard and Kitchen KDS with real-time order alerts.
