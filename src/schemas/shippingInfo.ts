import { z } from "zod"

export const shippingInfoSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  address1: z.string().min(5).max(200),
  address2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  zip: z.string().min(5).max(20),
  phone: z.string().min(10).max(15)
});
