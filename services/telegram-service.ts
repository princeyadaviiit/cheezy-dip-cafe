import { assertValidTransition } from "@/lib/orders/state-machine";
import {
  ORDERS_STORE,
  AUDIT_LOGS_STORE,
  type OrderRecord,
  type AuditLogEntry,
} from "@/lib/orders/order-store";
import { type OrderStatus } from "@/components/ui/status-badge";

const TELEGRAM_API_BASE = "https://api.telegram.org";

export function getTelegramBotToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
}

export function getAuthorizedTelegramChatIds(): string[] {
  const raw = process.env.TELEGRAM_ADMIN_CHAT_ID || "";
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAuthorizedTelegramUser(chatOrUserId: string | number): boolean {
  const allowed = getAuthorizedTelegramChatIds();
  if (allowed.length === 0) return false;
  return allowed.includes(String(chatOrUserId).trim());
}

/**
 * Send raw request to Telegram Bot API
 */
export async function callTelegramApi(
  method: string,
  payload: Record<string, unknown>
): Promise<unknown> {
  const token = getTelegramBotToken();
  if (!token) {
    return { ok: false, description: "TELEGRAM_BOT_TOKEN not configured" };
  }

  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error(`Telegram API [${method}] failed:`, err);
    return { ok: false, error: err };
  }
}

/**
 * Build inline keyboard markup based on current order status and type
 */
export function buildOrderInlineKeyboard(order: OrderRecord) {
  const buttons: Array<Array<{ text: string; callback_data: string }>> = [];

  if (order.orderStatus === "placed") {
    buttons.push([
      { text: "🔥 Accept & Cook", callback_data: `tg_cook:${order.id}` },
      { text: "❌ Reject", callback_data: `tg_reject:${order.id}` },
    ]);
  } else if (order.orderStatus === "preparing" || order.orderStatus === "accepted") {
    buttons.push([
      { text: "✅ Mark Ready", callback_data: `tg_ready:${order.id}` },
    ]);
  } else if (order.orderStatus === "ready") {
    if (order.orderType === "dine_in") {
      buttons.push([
        { text: "🍽️ Serve to Table", callback_data: `tg_served:${order.id}` },
      ]);
    } else {
      buttons.push([
        { text: "🛵 Out for Delivery", callback_data: `tg_out:${order.id}` },
        { text: "📦 Mark Delivered", callback_data: `tg_delivered:${order.id}` },
      ]);
    }
  } else if (order.orderStatus === "out_for_delivery") {
    buttons.push([
      { text: "📦 Mark Delivered", callback_data: `tg_delivered:${order.id}` },
    ]);
  }

  return buttons.length > 0 ? { inline_keyboard: buttons } : undefined;
}

/**
 * Format order details message for Telegram
 */
export function formatTelegramOrderMessage(order: OrderRecord): string {
  const deliverySnap = order.deliveryAddressSnapshot as
    | {
        recipientName?: string;
        phone?: string;
        line1?: string;
        area?: string;
        pincode?: string;
        googleMapsUrl?: string;
      }
    | undefined;

  const itemsList = order.items
    .map((i) => `• <b>${i.quantity}x ${escapeHtml(i.nameSnapshot)}</b> (₹${Math.round(i.lineTotalMinor / 100)})`)
    .join("\n");

  const statusEmoji: Record<string, string> = {
    placed: "🆕 PLACED",
    accepted: "👍 ACCEPTED",
    preparing: "🍳 COOKING",
    ready: "🔔 READY",
    served: "🍽️ SERVED",
    out_for_delivery: "🛵 OUT FOR DELIVERY",
    delivered: "✅ DELIVERED",
    completed: "✨ COMPLETED",
    cancelled: "🚫 CANCELLED",
    rejected: "❌ REJECTED",
  };

  const statusLabel = statusEmoji[order.orderStatus] || order.orderStatus.toUpperCase();

  let details = `🔔 <b>CHEEZY DIP CAFE - NEW ORDER [${order.tableLabel || "DINE-IN"}]</b>\n\n`;
  details += `📋 <b>Order:</b> #${order.orderNumber}\n`;
  details += `📊 <b>Status:</b> ${statusLabel}\n`;
  details += `🍴 <b>Channel:</b> ${
    order.orderType === "dine_in"
      ? `🍽️ <b>DINE-IN • ${order.tableLabel || "Table"}</b>`
      : "🛵 Home Delivery"
  }\n`;
  details += `💰 <b>Total:</b> ₹${Math.round(order.totalMinor / 100)} (${
    order.paymentStatus === "paid" ? "✅ Paid" : "⏳ Pay at Counter"
  })\n`;
  details += `📞 <b>Phone:</b> ${order.contactPhone || deliverySnap?.phone || "Dine-in Guest"}\n`;

  if (order.orderType === "dine_in" && deliverySnap?.recipientName) {
    details += `👤 <b>Guest Name:</b> ${escapeHtml(deliverySnap.recipientName)}\n`;
  }

  if (order.orderType === "delivery" && deliverySnap) {
    details += `👤 <b>Customer:</b> ${escapeHtml(deliverySnap.recipientName || "Customer")}\n`;
    details += `📍 <b>Address:</b> ${escapeHtml(deliverySnap.line1 || "")}, ${escapeHtml(
      deliverySnap.area || ""
    )} (${deliverySnap.pincode || ""})\n`;
    if (deliverySnap.googleMapsUrl) {
      details += `🗺️ <a href="${deliverySnap.googleMapsUrl}">Open in Google Maps</a>\n`;
    }
  }

  if (order.customerNote) {
    details += `💬 <b>Special Note:</b> <i>${escapeHtml(order.customerNote)}</i>\n`;
  }

  details += `\n🛒 <b>Items:</b>\n${itemsList}`;

  return details;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Send interactive order notification to all configured Telegram Admin Chat IDs
 */
export async function sendTelegramOrderAlert(order: OrderRecord): Promise<void> {
  const token = getTelegramBotToken();
  const chatIds = getAuthorizedTelegramChatIds();

  if (!token || chatIds.length === 0) {
    return;
  }

  const text = formatTelegramOrderMessage(order);
  const replyMarkup = buildOrderInlineKeyboard(order);

  for (const chatId of chatIds) {
    await callTelegramApi("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
      disable_web_page_preview: false,
    });
  }
}

/**
 * Handle incoming Telegram Webhook payloads
 */
export async function handleTelegramWebhook(update: any): Promise<{ success: boolean; message: string }> {
  // 1. Handle Inline Keyboard Button Clicks (Callback Queries)
  if (update.callback_query) {
    const cq = update.callback_query;
    const fromId = cq.from?.id;
    const data = cq.data as string;
    const message = cq.message;

    if (!isAuthorizedTelegramUser(fromId)) {
      await callTelegramApi("answerCallbackQuery", {
        callback_query_id: cq.id,
        text: `⛔ Unauthorized. Your Telegram ID is ${fromId}. Add it to TELEGRAM_ADMIN_CHAT_ID.`,
        show_alert: true,
      });
      return { success: false, message: "Unauthorized user" };
    }

    if (data === "tg_kitchen:toggle") {
      const { getPublicCafeStatus, setKitchenStatusFromBot } = await import(
        "@/services/admin-service"
      );
      const current = await getPublicCafeStatus();
      const next = !current.isOpen;
      await setKitchenStatusFromBot(next, fromId);

      await callTelegramApi("answerCallbackQuery", {
        callback_query_id: cq.id,
        text: next ? "🟢 Kitchen is now OPEN!" : "🔴 Kitchen is now CLOSED!",
      });

      if (message && message.chat && message.message_id) {
        const statusIcon = next ? "🟢 OPEN" : "🔴 CLOSED";
        const buttonText = next ? "🔴 Close Kitchen" : "🟢 Open Kitchen";
        const msgText =
          `🍳 <b>Kitchen Operational Status</b>\n\n` +
          `• <b>Current Status:</b> ${statusIcon}\n` +
          `• <b>Schedule:</b> 10:00 AM - 11:00 PM daily\n` +
          `• <b>Night Rule:</b> Automatically closed after 11:00 PM\n` +
          `• <b>Updated by:</b> Admin Telegram ID <code>${fromId}</code>\n\n` +
          `Tap below to toggle kitchen operational status anytime:`;

        await callTelegramApi("editMessageText", {
          chat_id: message.chat.id,
          message_id: message.message_id,
          text: msgText,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [[{ text: buttonText, callback_data: "tg_kitchen:toggle" }]],
          },
        });
      }
      return { success: true, message: `Kitchen toggled to ${next ? "open" : "closed"}` };
    }

    if (data && data.startsWith("tg_")) {
      const parts = data.replace("tg_", "").split(":");
      const action = parts[0];
      const orderId = parts[1];

      const order = ORDERS_STORE.get(orderId);
      if (!order) {
        await callTelegramApi("answerCallbackQuery", {
          callback_query_id: cq.id,
          text: `❌ Order ${orderId} not found.`,
          show_alert: true,
        });
        return { success: false, message: "Order not found" };
      }

      let targetStatus: OrderStatus | null = null;
      if (action === "cook") targetStatus = "preparing";
      else if (action === "reject") targetStatus = "rejected";
      else if (action === "ready") targetStatus = "ready";
      else if (action === "served") targetStatus = "served";
      else if (action === "out") targetStatus = "out_for_delivery";
      else if (action === "delivered") targetStatus = "delivered";

      if (!targetStatus) {
        await callTelegramApi("answerCallbackQuery", {
          callback_query_id: cq.id,
          text: `Unknown action: ${action}`,
        });
        return { success: false, message: "Unknown action" };
      }

      try {
        assertValidTransition(order.orderStatus, targetStatus, "owner");

        const fromStatus = order.orderStatus;
        order.orderStatus = targetStatus;
        order.updatedAt = new Date().toISOString();
        ORDERS_STORE.set(orderId, order);

        // Record audit entry
        const auditEntry: AuditLogEntry = {
          id: `audit_tg_${Date.now()}`,
          entity: "order",
          entityId: orderId,
          action: "telegram_bot_status_transition",
          actorRole: "owner",
          actorUserId: `tg_${fromId}`,
          metadata: {
            fromStatus,
            toStatus: targetStatus,
            telegramFromId: fromId,
            telegramUser: cq.from?.username || cq.from?.first_name,
          },
          createdAt: new Date().toISOString(),
        };
        AUDIT_LOGS_STORE.push(auditEntry);

        // Answer callback query toast
        await callTelegramApi("answerCallbackQuery", {
          callback_query_id: cq.id,
          text: `✓ Order #${order.orderNumber} updated to ${targetStatus.toUpperCase()}!`,
        });

        // Update the message in Telegram with updated text and next action buttons
        if (message && message.chat && message.message_id) {
          const updatedText = formatTelegramOrderMessage(order);
          const nextMarkup = buildOrderInlineKeyboard(order);

          await callTelegramApi("editMessageText", {
            chat_id: message.chat.id,
            message_id: message.message_id,
            text: updatedText,
            parse_mode: "HTML",
            reply_markup: nextMarkup,
          });
        }

        return { success: true, message: `Transitioned to ${targetStatus}` };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Failed to transition order";
        await callTelegramApi("answerCallbackQuery", {
          callback_query_id: cq.id,
          text: `⚠️ Error: ${errorMsg}`,
          show_alert: true,
        });
        return { success: false, message: errorMsg };
      }
    }
  }

  // 2. Handle Text Messages & Bot Commands
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat?.id;
    const text = (msg.text || "").trim();

    if (!isAuthorizedTelegramUser(chatId)) {
      await callTelegramApi("sendMessage", {
        chat_id: chatId,
        text: `⛔ <b>Access Denied</b>\n\nYour Telegram Chat ID is: <code>${chatId}</code>\n\nTo manage Cheezy Dip Cafe from this bot, add your Chat ID to <code>TELEGRAM_ADMIN_CHAT_ID</code> in your production <code>.env</code> file.`,
        parse_mode: "HTML",
      });
      return { success: false, message: "Unauthorized chat ID" };
    }

    if (text === "/start" || text === "/help") {
      const welcome =
        `🍔 <b>Cheezy Dip Cafe Admin Bot</b>\n\n` +
        `You are authorized as Cafe Administrator.\n\n` +
        `<b>Available Commands:</b>\n` +
        `• /orders - View current active orders and update states\n` +
        `• /kitchen - View or toggle Kitchen Open/Closed status\n` +
        `• /sales - View today's total revenue & orders count\n` +
        `• /help - Display this instructions menu\n\n` +
        `⚡ Whenever a new dine-in or delivery order is placed, you will automatically receive an instant notification here with interactive action buttons!`;

      await callTelegramApi("sendMessage", {
        chat_id: chatId,
        text: welcome,
        parse_mode: "HTML",
      });
      return { success: true, message: "Sent welcome message" };
    }

    if (text === "/orders") {
      const active = Array.from(ORDERS_STORE.values())
        .filter((o) => o.orderStatus !== "cancelled" && o.orderStatus !== "completed" && o.orderStatus !== "rejected")
        .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
        .slice(0, 5);

      if (active.length === 0) {
        await callTelegramApi("sendMessage", {
          chat_id: chatId,
          text: `🎉 No active orders in queue right now! All orders are fulfilled.`,
        });
        return { success: true, message: "No active orders" };
      }

      for (const order of active) {
        await callTelegramApi("sendMessage", {
          chat_id: chatId,
          text: formatTelegramOrderMessage(order),
          parse_mode: "HTML",
          reply_markup: buildOrderInlineKeyboard(order),
        });
      }
      return { success: true, message: "Sent active orders" };
    }

    if (text === "/sales") {
      const allOrders = Array.from(ORDERS_STORE.values());
      const paidOrders = allOrders.filter((o) => o.paymentStatus === "paid");
      const totalRevenue = paidOrders.reduce((acc, o) => acc + o.totalMinor, 0);

      const msgText =
        `📊 <b>Cheezy Dip Cafe - Realtime Sales Summary</b>\n\n` +
        `• <b>Total Orders:</b> ${allOrders.length}\n` +
        `• <b>Paid Orders:</b> ${paidOrders.length}\n` +
        `• <b>Total Revenue:</b> ₹${Math.round(totalRevenue / 100)}\n\n` +
        `✨ Keep up the great work!`;

      await callTelegramApi("sendMessage", {
        chat_id: chatId,
        text: msgText,
        parse_mode: "HTML",
      });
      return { success: true, message: "Sent sales summary" };
    }

    if (text === "/kitchen") {
      const { getPublicCafeStatus } = await import("@/services/admin-service");
      const status = await getPublicCafeStatus();
      const statusIcon = status.isOpen ? "🟢 OPEN" : "🔴 CLOSED";
      const buttonText = status.isOpen ? "🔴 Close Kitchen" : "🟢 Open Kitchen";
      const msgText =
        `🍳 <b>Kitchen Operational Status</b>\n\n` +
        `• <b>Status:</b> ${statusIcon}\n` +
        `• <b>Schedule:</b> ${status.openingHours} daily\n` +
        `• <b>Night Rule:</b> Automatically closed after 11:00 PM\n` +
        `• <b>Details:</b> ${status.statusMessage}\n\n` +
        `Tap below to toggle kitchen operational status anytime:`;

      await callTelegramApi("sendMessage", {
        chat_id: chatId,
        text: msgText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: buttonText, callback_data: "tg_kitchen:toggle" }]],
        },
      });
      return { success: true, message: "Sent kitchen status" };
    }
  }

  return { success: true, message: "Unhandled update" };
}
