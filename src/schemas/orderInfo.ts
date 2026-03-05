import { z } from "zod"

const productSchema = z.object({
    id: z.number().min(1),
    qty: z.number().min(1),
})


export const orderInfoSchema = z.object({
    userId: z.number().min(1),
    order: z.object({
        shippingTypeId: z.number().min(1),
        orderProducts: z.array(productSchema),
        paymentReference: z.string().min(1)     
    })
})
