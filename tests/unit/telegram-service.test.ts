import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isAuthorizedTelegramUser,
  getAuthorizedTelegramChatIds,
  formatTelegramOrderMessage,
  buildOrderInlineKeyboard,
  handleTelegramWebhook,
} from "@/services/telegram-service";
import { ORDERS_STORE, type OrderRecord } from "@/lib/orders/order-store";

describe("Telegram Service & Authorization Allowlist", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.TELEGRAM_BOT_TOKEN = "test_bot_token_12345";
    process.env.TELEGRAM_ADMIN_CHAT_ID = "123456789, 987654321";
    ORDERS_STORE.clear();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("correctly parses comma-separated authorized chat IDs", () => {
    const ids = getAuthorizedTelegramChatIds();
    expect(ids).toEqual(["123456789", "987654321"]);
  });

  it("strictly authorizes allowlisted chat IDs and rejects unauthorized IDs", () => {
    expect(isAuthorizedTelegramUser("123456789")).toBe(true);
    expect(isAuthorizedTelegramUser(123456789)).toBe(true);
    expect(isAuthorizedTelegramUser("987654321")).toBe(true);
    expect(isAuthorizedTelegramUser("999999999")).toBe(false);
    expect(isAuthorizedTelegramUser(555555555)).toBe(false);
  });

  it("formats dine-in order alert message with items and table label", () => {
    const mockOrder: OrderRecord = {
      id: "ord_dine_test",
      orderNumber: "101",
      customerClerkId: "user_test",
      contactPhone: "+919876543210",
      orderType: "dine_in",
      orderStatus: "placed",
      paymentMethod: "pay_at_counter",
      paymentStatus: "pending",
      tableLabel: "Table 3",
      subtotalMinor: 25000,
      discountMinor: 0,
      deliveryFeeMinor: 0,
      taxMinor: 0,
      totalMinor: 25000,
      idempotencyKey: "idem_1",
      items: [
        {
          menuItemId: "item_burger",
          nameSnapshot: "Crispy Veg Burger",
          unitPriceMinor: 12000,
          quantity: 2,
          modifiersSnapshot: [],
          lineTotalMinor: 24000,
        },
      ],
      placedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const text = formatTelegramOrderMessage(mockOrder);
    expect(text).toContain("#101");
    expect(text).toContain("Table 3");
    expect(text).toContain("Crispy Veg Burger");
    expect(text).toContain("₹250");
    expect(text).toContain("Pay at Counter");
  });

  it("formats delivery order alert message with address and customer contact", () => {
    const mockOrder: OrderRecord = {
      id: "ord_del_test",
      orderNumber: "102",
      customerClerkId: "user_test",
      contactPhone: "+919123456789",
      orderType: "delivery",
      orderStatus: "placed",
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      deliveryAddressSnapshot: {
        recipientName: "Aditya Sharma",
        phone: "+919123456789",
        line1: "Flat 402, Sunshine Heights",
        area: "Raja Park",
        pincode: "302004",
        googleMapsUrl: "https://maps.google.com/?q=26.9,75.8",
      },
      subtotalMinor: 40000,
      discountMinor: 0,
      deliveryFeeMinor: 3000,
      taxMinor: 0,
      totalMinor: 43000,
      idempotencyKey: "idem_2",
      items: [
        {
          menuItemId: "item_pizza",
          nameSnapshot: "Margherita Pizza",
          unitPriceMinor: 25000,
          quantity: 1,
          modifiersSnapshot: [],
          lineTotalMinor: 25000,
        },
      ],
      placedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const text = formatTelegramOrderMessage(mockOrder);
    expect(text).toContain("#102");
    expect(text).toContain("Home Delivery");
    expect(text).toContain("Aditya Sharma");
    expect(text).toContain("Flat 402, Sunshine Heights");
    expect(text).toContain("https://maps.google.com/?q=26.9,75.8");
    expect(text).toContain("₹430");
    expect(text).toContain("Paid");
  });

  it("builds correct action keyboard for placed, preparing, ready, and delivery states", () => {
    const baseOrder: OrderRecord = {
      id: "ord_kb_test",
      orderNumber: "103",
      customerClerkId: "user_test",
      contactPhone: "+919876543210",
      orderType: "dine_in",
      orderStatus: "placed",
      paymentMethod: "pay_at_counter",
      paymentStatus: "pending",
      subtotalMinor: 10000,
      discountMinor: 0,
      deliveryFeeMinor: 0,
      taxMinor: 0,
      totalMinor: 10000,
      idempotencyKey: "idem_3",
      items: [],
      placedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Placed
    const kbPlaced = buildOrderInlineKeyboard(baseOrder);
    expect(kbPlaced?.inline_keyboard[0][0].text).toContain("Accept & Cook");
    expect(kbPlaced?.inline_keyboard[0][0].callback_data).toBe("tg_cook:ord_kb_test");

    // Preparing
    baseOrder.orderStatus = "preparing";
    const kbPrep = buildOrderInlineKeyboard(baseOrder);
    expect(kbPrep?.inline_keyboard[0][0].text).toContain("Mark Ready");

    // Ready (dine_in)
    baseOrder.orderStatus = "ready";
    const kbReadyDine = buildOrderInlineKeyboard(baseOrder);
    expect(kbReadyDine?.inline_keyboard[0][0].text).toContain("Serve to Table");

    // Ready (delivery)
    baseOrder.orderType = "delivery";
    const kbReadyDel = buildOrderInlineKeyboard(baseOrder);
    expect(kbReadyDel?.inline_keyboard[0][0].text).toContain("Out for Delivery");
  });

  it("rejects unauthorized webhook callback query", async () => {
    const result = await handleTelegramWebhook({
      callback_query: {
        id: "cq_unauth",
        from: { id: 999999999 }, // Unauthorized user
        data: "tg_cook:some_order",
      },
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Unauthorized user");
  });

  it("executes valid order transition on authorized callback query", async () => {
    const testOrder: OrderRecord = {
      id: "ord_trans_test",
      orderNumber: "104",
      customerClerkId: "user_test",
      contactPhone: "+919876543210",
      orderType: "dine_in",
      orderStatus: "placed",
      paymentMethod: "pay_at_counter",
      paymentStatus: "pending",
      subtotalMinor: 10000,
      discountMinor: 0,
      deliveryFeeMinor: 0,
      taxMinor: 0,
      totalMinor: 10000,
      idempotencyKey: "idem_4",
      items: [],
      placedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    ORDERS_STORE.set(testOrder.id, testOrder);

    // Mock fetch for Telegram API calls
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ ok: true }),
    });

    const result = await handleTelegramWebhook({
      callback_query: {
        id: "cq_auth",
        from: { id: 123456789, first_name: "Owner" },
        data: `tg_cook:${testOrder.id}`,
      },
    });

    expect(result.success).toBe(true);
    expect(ORDERS_STORE.get(testOrder.id)?.orderStatus).toBe("preparing");
  });
});
