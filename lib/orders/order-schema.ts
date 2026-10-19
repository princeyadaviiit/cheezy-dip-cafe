import { z } from "zod";

/**
 * Order Creation Validation Schema
 * Separated from server actions module so that "use server" files only export async functions.
 */
export const PlaceOrderSchema = z
  .object({
    orderType: z.enum(["dine_in", "delivery"]),
    items: z
      .array(
        z.object({
          menuItemId: z.string().min(1),
          quantity: z.number().int().min(1).max(50),
          optionChoiceLabels: z.array(z.string()).optional(),
          note: z.string().max(200).optional(),
        })
      )
      .min(1, "Order must contain at least one item"),
    couponCode: z.string().max(20).optional(),
    addressId: z.string().uuid().optional(),
    customerName: z.string().max(100).optional(),
    customerPhone: z.string().max(20).optional(),
    deliveryAddressSnapshot: z
      .object({
        recipientName: z.string().min(1, "Recipient name is required"),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
        line1: z.string().min(3, "Delivery street address is required"),
        area: z.string().min(1, "Area / locality is required"),
        pincode: z.string().length(6, "Pincode must be exactly 6 digits"),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        googleMapsUrl: z.string().optional(),
      })
      .optional(),
    paymentMethod: z.enum(["pay_at_counter", "razorpay"]),
    customerNote: z.string().max(300).optional(),
    idempotencyKey: z.string().min(8).max(64),
  })
  .refine(
    (data) => {
      if (data.orderType === "delivery") {
        if (!data.deliveryAddressSnapshot) return false;
        const snap = data.deliveryAddressSnapshot;
        const cleanPhone = snap.phone.replace(/\D/g, "");
        return (
          snap.recipientName.trim().length >= 2 &&
          cleanPhone.length >= 10 &&
          snap.line1.trim().length >= 3 &&
          snap.area.trim().length >= 2 &&
          /^\d{6}$/.test(snap.pincode.trim())
        );
      }
      return true;
    },
    {
      message:
        "DELIVERY_ERROR: Full delivery details (recipient name, 10-digit phone, street address, area, and 6-digit pincode) are mandatory for doorstep delivery.",
      path: ["deliveryAddressSnapshot"],
    }
  );

export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;

