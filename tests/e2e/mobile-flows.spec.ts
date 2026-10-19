import { test, expect } from "@playwright/test";

test.describe("Mobile-First Customer Flows (360px & 390px)", () => {
  test("Landing page displays hero, dual CTAs visible above fold, and FSSAI details", async ({
    page,
  }) => {
    await page.goto("/");

    // Heading & Hero
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Cheezy dip");

    // Dual CTAs: View Menu and Order Now
    const viewMenuBtn = page.getByRole("link", { name: /view menu/i });
    const orderNowBtn = page.getByRole("link", { name: /order/i }).first();
    await expect(viewMenuBtn).toBeVisible();
    await expect(orderNowBtn).toBeVisible();

    // Verify touch targets >= 44px
    const box = await viewMenuBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);

    // Legal footer contains FSSAI & GST details
    await expect(page.locator("body")).toContainText("22224074000123");
    await expect(page.locator("body")).toContainText("08AABCC1234D1Z5");
  });

  test("Public menu displays categories, search, and dish items with prices", async ({
    page,
  }) => {
    await page.goto("/menu");

    // Check menu title and category tabs
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Our Menu");
    await expect(page.getByRole("button", { name: /all/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /burgers/i })).toBeVisible();

    // Verify prices are visible (public menu with prices)
    await expect(page.locator("body")).toContainText("₹");
    await expect(page.locator("body")).toContainText("100% Pure Veg");
  });

  test("Legal pages load with authentic policies, FSSAI and contact helpline", async ({
    page,
  }) => {
    // Terms
    await page.goto("/terms");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Terms of Service");
    await expect(page.locator("body")).toContainText("FSSAI");

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
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Cheezy Dip Cafe Design System");

    const primaryButton = page.getByRole("button", { name: /primary action/i });
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

    // After entering passkey, it must NOT log straight into operations, but show Clerk Staff Login!
    await expect(page.locator("body")).toContainText("Gate Passkey Verified");
    await expect(page.locator("body")).toContainText("Staff & Admin Login");
  });
});
