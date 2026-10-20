import { test, expect } from "@playwright/test";

test.describe("Mobile-First Customer Flows (360px & 390px)", () => {
  test("Landing page displays hero, dual CTAs visible above fold, and cafe footer details", async ({
    page,
  }) => {
    await page.goto("/");

    // Heading & Hero
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Cheezy dip");

    // Dual CTAs: Primary Action (Order Now or Browse Menu if closed) and View Full Menu
    const primaryCtaBtn = page.getByRole("button", { name: /order now|browse menu/i });
    const viewMenuBtn = page.getByRole("button", { name: /view full menu/i });
    await expect(primaryCtaBtn).toBeVisible();
    await expect(viewMenuBtn).toBeVisible();

    // Verify touch targets >= 44px
    const box = await primaryCtaBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);

    // Footer contains pure veg and location details
    await expect(page.locator("body")).toContainText("100% Pure Vegetarian Cafe");
    await expect(page.locator("body")).toContainText("Raja Park, Jaipur");
  });

  test("Public menu displays categories, search, and dish items with prices", async ({
    page,
  }) => {
    await page.goto("/menu");

    // Check menu title and category tabs
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Cafe Menu");
    await expect(page.getByRole("button", { name: /all/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /burgers/i })).toBeVisible();

    // Verify prices are visible (public menu with prices)
    await expect(page.locator("body")).toContainText("₹");
    await expect(page.locator("body")).toContainText("100% Pure Veg");
  });

  test("Legal pages load with authentic policies and contact helpline", async ({
    page,
  }) => {
    // Terms
    await page.goto("/terms");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Terms of Service");
    await expect(page.locator("body")).toContainText("Pure Vegetarian");

    // Privacy
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Privacy Policy");
    await expect(page.locator("body")).toContainText("Razorpay");

    // Refund Policy
    await page.goto("/refund-policy");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Refund & Cancellation Policy");
    await expect(page.locator("body")).toContainText("5 to 7 business days");

    // Delivery Policy
    await page.goto("/delivery-policy");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Delivery Policy");
    await expect(page.locator("body")).toContainText("302001");

    // Contact Us
    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Contact Us");
    await expect(page.locator("body")).toContainText("Raja Park, Jaipur");
  });

  test("Style tile verifies typography and >=44px touch targets", async ({ page }) => {
    await page.goto("/dev/style-tile");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Cheezy dip cafe");

    const primaryButton = page.getByRole("button", { name: /order now/i }).first();
    await expect(primaryButton).toBeVisible();
    const btnBox = await primaryButton.boundingBox();
    expect(btnBox?.height).toBeGreaterThanOrEqual(44);
  });

  test("Admin portal enforces master gatekeeper, >=44px targets, and Clerk auth flow", async ({
    page,
  }) => {
    await page.goto("/admin");

    // Must show Master Passkey gate first
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Admin & Operations Gate");
    const unlockBtn = page.getByRole("button", { name: /unlock admin portal/i });
    await expect(unlockBtn).toBeVisible();

    // Verify touch target >= 44px
    const unlockBox = await unlockBtn.boundingBox();
    expect(unlockBox?.height).toBeGreaterThanOrEqual(44);

    // Enter incorrect passkey
    await page.getByPlaceholder(/enter admin master passkey/i).fill("wrongpass");
    await unlockBtn.click();
    await expect(page.locator("body")).toContainText(/invalid admin passkey/i);

    // Enter correct passkey
    await page.getByPlaceholder(/enter admin master passkey/i).fill("cheezy2026");
    await unlockBtn.click();

    // Entering passkey immediately unlocks Admin & KDS operations dashboard without unauthorized errors
    await expect(page.locator("body")).toContainText("Cheezy Dip Cafe");
    await expect(page.locator("body")).toContainText("Admin & KDS");
  });

  test("Razorpay payment page loads for delivery order, processes payment, and verifies paid status", async ({
    page,
  }) => {
    // 1. Visit menu and add item to cart for delivery
    await page.goto("/order");
    const addBtn = page.getByRole("button", { name: "ADD +" }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    const addToOrderBtn = page.getByRole("button", { name: /add to order/i });
    await expect(addToOrderBtn).toBeVisible();
    await addToOrderBtn.click();

    // 2. Proceed to checkout
    await page.goto("/order/checkout");
    await expect(page.locator("body")).toContainText("Delivery Details");

    // 3. Fill mandatory delivery details
    await page.locator("#recipient-name").fill("Rahul Sharma");
    await page.locator("#delivery-phone").fill("9876543210");
    await page.locator("#delivery-address").fill("House 42, Lane 3");
    await page.locator("#delivery-area").fill("Raja Park");
    await page.locator("#delivery-pincode").fill("302004");

    // 4. Submit order
    const placeOrderBtn = page.getByRole("button", { name: /place delivery order/i });
    await expect(placeOrderBtn).toBeVisible();
    await placeOrderBtn.click();

    // 5. Must redirect to tracking page with payment pending
    await expect(page).toHaveURL(/\/order\/orders\/ord_/);
    await expect(page.locator("body")).toContainText("Payment Required to Start Cooking");

    // 6. Click Razorpay Pay button
    const payBtn = page.getByRole("button", { name: /pay .* via razorpay/i });
    await expect(payBtn).toBeVisible();
    await payBtn.click();

    // 7. Order is verified paid
    await expect(page.locator("body")).toContainText("Paid via Razorpay (Prepaid Verified)");
  });

  test("Scanning table QR directly activates dine-in without asking for login and allows ordering", async ({
    page,
  }) => {
    // 1. Visit table QR route (Table 2)
    await page.goto("/t/cd_tbl_tok_02y8b");

    // 2. Must redirect to /order with Table 2 active WITHOUT asking for login
    await expect(page).toHaveURL(/\/order/);
    await expect(page.locator("body")).toContainText("Dine-In Session");
    await expect(page.locator("body")).toContainText("Table 2");
    await expect(page.locator("body")).toContainText("Pay at Counter");

    // 3. Open modifier modal and add item to cart
    const addBtn = page.getByRole("button", { name: "ADD +" }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    const addToOrderBtn = page.getByRole("button", { name: /add to order/i });
    await expect(addToOrderBtn).toBeVisible();
    await addToOrderBtn.click();

    // 4. Navigate to cart - verify no login required
    await page.goto("/order/cart");
    await expect(page.locator("body")).toContainText("Table 2");
    await expect(page.locator("body")).toContainText("FREE (Dine-in)");

    // 5. Navigate to checkout - verify table context & pay at counter
    await page.goto("/order/checkout");
    await expect(page.locator("body")).toContainText("Dine-In • Table 2");
    await expect(page.locator("body")).toContainText("Pay at counter");
  });
});
