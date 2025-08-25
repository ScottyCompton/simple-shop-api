import { boolean, z } from "zod"
import { billingInfoSchema } from "./billingInfo.js"
import { shippingInfoSchema } from "./shippingInfo.js"

const productSchema = z.object({
    productId: z.number().min(1),
    qty: z.number().min(1),
    unitPrice: z.number().min(1)
})


export const orderInfoSchema = z.object({
    userId: z.number().min(1),
    order: z.object({
        billing: billingInfoSchema,
        shipping: shippingInfoSchema,
        shippingTypeId: z.number().min(1),
        orderSubTotal: z.number().min(0),
        orderTax: z.number().min(0),
        orderShippingCost: z.number().min(0),
        orderProducts: z.array(productSchema)        
    })
})
