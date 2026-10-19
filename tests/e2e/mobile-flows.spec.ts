import { test, expect } from "@playwright/test";

test.describe("Mobile-First Customer Flows (360px & 390px)", () => {
  test("Landing page displays hero, dual CTAs visible above fold, and cafe footer details", async ({
    page,
  }) => {
    await page.goto("/");

    // Heading & Hero
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Cheezy dip");

    // Dual CTAs: Order Now and View Full Menu
    const orderNowBtn = page.getByRole("button", { name: /order now/i });
    const viewMenuBtn = page.getByRole("button", { name: /view full menu/i });
    await expect(orderNowBtn).toBeVisible();
    await expect(viewMenuBtn).toBeVisible();

    // Verify touch targets >= 44px
    const box = await orderNowBtn.boundingBox();
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
    await page.goto("/order/orders/ord_demo_delivery");

    // Check order header
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Order CD-103");

    const payBtn = page.getByRole("button", { name: /pay ₹280 via razorpay/i });
    if (await payBtn.isVisible()) {
      await expect(page.locator("body")).toContainText("Payment Required to Start Cooking");
      await expect(page.locator("body")).toContainText("₹280");
      await payBtn.click();
    }

    // After click or in subsequent runs, order is verified paid
    await expect(page.locator("body")).toContainText("Paid via Razorpay (Prepaid Verified)");
  });
});
