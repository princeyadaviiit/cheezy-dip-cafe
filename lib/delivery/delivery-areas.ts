export interface DeliveryArea {
  pincode: string;
  areaName: string;
  minOrderMinor: number;
  deliveryFeeMinor: number;
  isActive: boolean;
}

export const AUTHORIZED_DELIVERY_AREAS: DeliveryArea[] = [
  { pincode: "302001", areaName: "MI Road / C-Scheme", minOrderMinor: 15000, deliveryFeeMinor: 3000, isActive: true },
  { pincode: "302002", areaName: "Bapu Bazar / Johari Bazar", minOrderMinor: 15000, deliveryFeeMinor: 3000, isActive: true },
  { pincode: "302003", areaName: "Adarsh Nagar / Sethi Colony", minOrderMinor: 15000, deliveryFeeMinor: 3000, isActive: true },
  { pincode: "302004", areaName: "Raja Park / Tilak Nagar", minOrderMinor: 15000, deliveryFeeMinor: 3000, isActive: true },
];

export function getDeliveryAreaByPincode(pincode: string): DeliveryArea | null {
  const clean = pincode.trim();
  const area = AUTHORIZED_DELIVERY_AREAS.find((a) => a.pincode === clean && a.isActive);
  return area || null;
}

export function validateDeliveryOrderPincode(pincode: string, subtotalMinor: number): {
  isValid: boolean;
  error?: string;
  area?: DeliveryArea;
} {
  const area = getDeliveryAreaByPincode(pincode);
  if (!area) {
    return {
      isValid: false,
      error: `Sorry, we do not deliver to pincode ${pincode}. We currently deliver exclusively to 302001, 302002, 302003, and 302004.`,
    };
  }

  if (subtotalMinor < area.minOrderMinor) {
    return {
      isValid: false,
      error: `Minimum order amount for delivery is ₹${Math.round(area.minOrderMinor / 100)}. Your items subtotal is ₹${Math.round(subtotalMinor / 100)}.`,
      area,
    };
  }

  return { isValid: true, area };
}
