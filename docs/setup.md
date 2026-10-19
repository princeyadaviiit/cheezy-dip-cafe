# Cheezy Dip Cafe - Production Deployment & Client Handover Guide

This comprehensive guide details the exact steps to deploy **Cheezy Dip Cafe** to production, set up custom subdomains, configure the Telegram Admin Bot with authorized chat IDs, print physical table QR codes, and hand over the live platform to the cafe owner.

---

## 1. Architecture & Domain Structure

The application supports unified single-domain hosting or subdomain isolation:

- **Customer Web App:** `https://cheezydipcafe.com` (or `https://yourdomain.com`)
  - Animated landing page, visual digital menu, category filters, cart, and Razorpay prepaid checkout.
  - Strictly **Home Delivery** for online visitors (no unauthorized Dine-In option).
  - **Dine-In Mode** is cryptographically unlocked *only* when a customer physically scans a table's QR sticker (`/t/[token]`).
- **Admin & Kitchen KDS Portal:** `https://admin.cheezydipcafe.com` (or `/admin`)
  - Protected by a Master Gatekeeper Passkey.
  - Live incoming order chimes & pop-up modal.
  - Kitchen Display System (Incoming, In Prep, Ready, All Active).
  - Staff management, Menu 86'ing (stock toggles), Sales reports, and Table QR code generator.
- **Telegram Bot Assistant:**
  - Realtime order notifications pushed directly to authorized cafe managers.
  - Inline buttons to accept, cook, mark ready, serve, or dispatch orders in 1 tap.
  - Strict allowlist authorization: only approved Telegram User/Chat IDs can view data or trigger buttons.

---

## 2. Environment Variables Reference

Create a `.env.production` file on your host (e.g. Vercel / Railway / AWS) populated with the following keys:

```bash
# ==============================================================================
# CLERK AUTHENTICATION (https://clerk.com)
# ==============================================================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# ==============================================================================
# SUPABASE DATABASE & REALTIME (https://supabase.com)
# ==============================================================================
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ==============================================================================
# RAZORPAY PAYMENTS (https://dashboard.razorpay.com)
# ==============================================================================
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# ==============================================================================
# APP CORE & SECURITY
# ==============================================================================
NEXT_PUBLIC_SITE_URL=https://your-cafe-domain.com
TABLE_COOKIE_SECRET=
CRON_SECRET=

# ==============================================================================
# ADMIN SUBDOMAIN & PORTAL GATEKEEPER
# ==============================================================================
ADMIN_GATE_PASSKEY=
ADMIN_GATE_SECRET=

# ==============================================================================
# TELEGRAM BOT INTEGRATION
# ==============================================================================
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID=

# ==============================================================================
# WEB PUSH NOTIFICATIONS (Optional)
# ==============================================================================
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@your-cafe-domain.com
```

> [!IMPORTANT]
> To generate high-entropy secrets for `TABLE_COOKIE_SECRET`, `ADMIN_GATE_SECRET`, and `CRON_SECRET`, run:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## 3. Subdomain Setup (e.g. `admin.cheezydipcafe.com`)

To host the admin portal on an isolated subdomain:

### Step 3.1: DNS Configuration
In your DNS provider (Cloudflare, GoDaddy, Namecheap):
1. Add an `A` or `CNAME` record for `@` pointing to `cname.vercel-dns.com` (or your host IP).
2. Add a `CNAME` record for `admin` pointing to `cname.vercel-dns.com`.

### Step 3.2: Vercel Domain Linking
1. Open your project on Vercel -> **Settings** -> **Domains**.
2. Add `cheezydipcafe.com`.
3. Add `admin.cheezydipcafe.com`.
Both domains point to the same deployment. The built-in middleware routes traffic seamlessly, while the Master Passkey protects the `/admin` portal on any device.

---

## 4. Telegram Admin Bot Setup (Order Alerts & Control)

### Step 4.1: Create your Telegram Bot with BotFather
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot`.
3. Provide a friendly name (e.g., `Cheezy Dip Cafe Alert Bot`).
4. Choose a unique username ending in `bot` (e.g., `CheezyDipCafe_bot`).
5. Copy the generated **HTTP API Token** and set it as `TELEGRAM_BOT_TOKEN` in your environment.

### Step 4.2: Retrieve Authorized Telegram Chat IDs
For security, the bot only responds to and accepts button actions from allowlisted Telegram accounts:
1. Search for `@userinfobot` on Telegram and click **Start**.
2. Note your **Id** (e.g., `123456789`).
3. If multiple owners/managers need access, separate their IDs with a comma:
   ```bash
   TELEGRAM_ADMIN_CHAT_ID=YOUR_CHAT_ID_1,YOUR_CHAT_ID_2
   ```

### Step 4.3: Register Telegram Webhook
To enable Telegram to deliver button taps ("Accept & Cook", "Mark Ready", "Served", "Delivered") back to your server, execute this curl command in your terminal:

```bash
curl -F "url=https://cheezydipcafe.com/api/telegram/webhook" https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook
```

You will receive:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### Step 4.4: Verify the Bot
1. Open your new bot in Telegram and send `/start`.
2. The bot will recognize you as an authorized administrator and display the commands list:
   - `/orders`: Shows active kitchen orders with interactive inline buttons.
   - `/sales`: Realtime count of orders and gross revenue today.
   - When any customer places a dine-in or delivery order, an instant alert will chime in your chat with 1-tap action buttons!

---

## 5. Physical Table QR Codes (Printing & Setup)

1. Open the Admin Portal (`https://cheezydipcafe.com/admin` or `https://admin.cheezydipcafe.com`).
2. Enter your `ADMIN_GATE_PASSKEY` to unlock the dashboard.
3. Click on the **Table QRs** tab.
4. Each cafe table (Table 1 through Table 6) features:
   - High-contrast scannable QR code.
   - **Print** button: Prints a clean, branded standalone table sticker with cut lines.
   - **Download PNG** button: Saves a high-res image for custom graphic printing.
   - **Print All (Sheet)**: Opens an A4 sticker sheet layout with all 6 table stickers ready to print on label sticker paper.
   - **Rotate Token**: In case a QR sticker is photographed or damaged, click rotate to instantly cycle its cryptographic token without affecting other tables.

---

## 6. Razorpay Payments Setup (Delivery Orders)

1. Sign up or log into [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Complete KYC and activate live mode.
3. Go to **Settings** -> **API Keys** -> Generate **Key ID** and **Key Secret**.
4. Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
5. Go to **Settings** -> **Webhooks** -> **Add New Webhook**:
   - URL: `https://cheezydipcafe.com/api/webhooks/razorpay`
   - Secret: Enter your chosen `RAZORPAY_WEBHOOK_SECRET`.
   - Active Events: Check `payment.captured` and `payment.failed`.

---

## 7. Thermal Billing & Invoicing

- Cheezy Dip Cafe's bill generator is built specifically for cafe operations:
  - Accessible from the **Admin & KDS** dashboard and the **All Orders** list via the **Bill** button.
  - Automatically formats for standard 58mm / 80mm thermal receipt printers.
  - Clean layout showing cafe branding, table/customer contact details, items breakdown, and grand total without confusing taxes or GST numbers.

---

## 8. Client Handover Checklist

Before handing over the live platform to the client:

- [ ] Confirm all production environment variables are configured on the hosting platform.
- [ ] Test the Admin Master Passkey login on a mobile phone (ensure full dashboard unlocks seamlessly).
- [ ] Test a live test transaction via Razorpay for a delivery order.
- [ ] Scan Table 1 QR code with a phone camera, confirm it routes to `/order?table=Table%201` and enables Pay-at-Counter dine-in mode.
- [ ] Send `/start` to the Telegram bot from the owner's phone to verify authorization.
- [ ] Print table QR sticker sheet from the **Table QRs** tab and affix stickers to cafe tables.
- [ ] Train cafe staff on using the mobile KDS display to tap **Approve & Cook** and **Mark Ready**.
