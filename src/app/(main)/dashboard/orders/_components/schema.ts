import { z } from "zod";

export const orderSchema = z.object({
  id: z.string(),
  externalOrderId: z.string(),
  provider: z.string(), // e.g., "Amazon", "eBay", etc.
  customerName: z.string(),
  productName: z.string(),
  quantity: z.number(),
  totalAmount: z.number(),
  orderDate: z.string(),
  deliveryStatus: z.enum(["delivered", "not-delivered"]),
  shippingAddress: z.string(),
  trackingNumber: z.string().optional(),
});

export type Order = z.infer<typeof orderSchema>;
