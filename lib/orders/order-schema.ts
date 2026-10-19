import { z } from "zod";

/**
 * Order Creation Validation Schema
 * Separated from server actions module so that "use server" files only export async functions.
 */
export const PlaceOrderSchema = z.object({
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
      recipientName: z.string().min(1),
      phone: z.string().min(10),
      line1: z.string().min(3),
      area: z.string().min(1),
      pincode: z.string().length(6),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      googleMapsUrl: z.string().optional(),
    })
    .optional(),
  paymentMethod: z.enum(["pay_at_counter", "razorpay"]),
  customerNote: z.string().max(300).optional(),
  idempotencyKey: z.string().min(8).max(64),
});

export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;
