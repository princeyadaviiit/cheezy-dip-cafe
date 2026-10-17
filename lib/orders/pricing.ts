import { MENU_ITEMS, type MenuItem } from "@/lib/menu-data";

export interface OrderItemRequest {
  menuItemId: string;
  quantity: number;
  optionChoiceLabels?: string[];
  note?: string;
}

export interface CalculatedOrderItem {
  menuItemId: string;
  nameSnapshot: string;
  unitPriceMinor: number;
  quantity: number;
  modifiersSnapshot: { label: string; priceDeltaMinor: number }[];
  lineTotalMinor: number;
  note?: string;
}

export interface PricingResult {
  items: CalculatedOrderItem[];
  subtotalMinor: number;
  discountMinor: number;
  deliveryFeeMinor: number;
  taxMinor: number;
  totalMinor: number;
}

export interface CalculateOrderPricingParams {
  items: OrderItemRequest[];
  orderType: "dine_in" | "delivery";
  deliveryFeeMinor?: number;
  couponDiscountMinor?: number;
}

/**
 * Server-Side Pricing Engine
 * Recomputes all prices, option add-ons, and totals strictly from trusted catalog data.
 * Client-submitted prices and totals are strictly ignored.
 */
export function calculateOrderPricing({
  items,
  orderType,
  deliveryFeeMinor = 0,
  couponDiscountMinor = 0,
}: CalculateOrderPricingParams): PricingResult {
  if (!items || items.length === 0) {
    throw new Error("VALIDATION_ERROR: Order must contain at least one item.");
  }

  const calculatedItems: CalculatedOrderItem[] = [];
  let subtotalMinor = 0;

  for (const itemReq of items) {
    if (!Number.isInteger(itemReq.quantity) || itemReq.quantity <= 0 || itemReq.quantity > 50) {
      throw new Error(`VALIDATION_ERROR: Invalid quantity ${itemReq.quantity} for item ${itemReq.menuItemId}.`);
    }

    const catalogItem = MENU_ITEMS.find((m) => m.id === itemReq.menuItemId);
    if (!catalogItem) {
      throw new Error(`VALIDATION_ERROR: Item '${itemReq.menuItemId}' does not exist in catalog.`);
    }

    if (!catalogItem.isAvailable) {
      throw new Error(`VALIDATION_ERROR: Item '${catalogItem.name}' is currently sold out.`);
    }

    // Calculate modifiers
    let optionsDelta = 0;
    const modifiersSnapshot: { label: string; priceDeltaMinor: number }[] = [];

    if (itemReq.optionChoiceLabels && itemReq.optionChoiceLabels.length > 0 && catalogItem.options) {
      for (const choiceLabel of itemReq.optionChoiceLabels) {
        let matchedChoice = false;
        for (const optGroup of catalogItem.options) {
          const match = optGroup.choices.find((c) => c.label === choiceLabel);
          if (match) {
            matchedChoice = true;
            optionsDelta += match.priceDeltaMinor;
            modifiersSnapshot.push({
              label: match.label,
              priceDeltaMinor: match.priceDeltaMinor,
            });
            break;
          }
        }
        if (!matchedChoice) {
          throw new Error(`VALIDATION_ERROR: Invalid option '${choiceLabel}' for item '${catalogItem.name}'.`);
        }
      }
    }

    const unitPriceMinor = catalogItem.priceMinor;
    const itemTotalMinor = (unitPriceMinor + optionsDelta) * itemReq.quantity;

    calculatedItems.push({
      menuItemId: catalogItem.id,
      nameSnapshot: catalogItem.name,
      unitPriceMinor,
      quantity: itemReq.quantity,
      modifiersSnapshot,
      lineTotalMinor: itemTotalMinor,
      note: itemReq.note?.trim() || undefined,
    });

    subtotalMinor += itemTotalMinor;
  }

  // Enforce zero delivery fee for dine-in
  const finalDeliveryFeeMinor = orderType === "dine_in" ? 0 : Math.max(0, deliveryFeeMinor);
  const finalDiscountMinor = Math.min(subtotalMinor, Math.max(0, couponDiscountMinor));
  const taxMinor = 0; // Prices are tax-inclusive per OD-05

  const totalMinor = subtotalMinor - finalDiscountMinor + finalDeliveryFeeMinor + taxMinor;

  return {
    items: calculatedItems,
    subtotalMinor,
    discountMinor: finalDiscountMinor,
    deliveryFeeMinor: finalDeliveryFeeMinor,
    taxMinor,
    totalMinor,
  };
}
