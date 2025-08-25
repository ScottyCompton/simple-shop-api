// src/routes/userAuth.ts
import express from 'express';
import prisma from '../services/prismaService.js';
import { verifyToken } from '../services/jwtService.js';
import { orderInfoSchema } from '../schemas/orderInfo.js';


const router = express.Router();

/**
 * @route   POST /api/orders/create
 * @desc    Inserts a new order into the orders and orderproducts tables
 * @access  Public
 */
router.post('/create', async (req, res) => {
    const userId = req.body.userId;
    const orderData = req.body.order;
    const {billing, shipping, orderProducts} = orderData;

    if (!userId || !orderData || !Array.isArray(orderProducts) || orderProducts.length === 0) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided' 
      });
    }

    // Verify and decode the token using the imported function
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token' 
      });
    }

    // verify the data is legit
     try {
      const validation = orderInfoSchema.safeParse(req.body);
      
      if (!validation.success) {
        validation.error.issues.forEach((issue) => {
            console.log('\n\n');
            console.log(`- Path: ${issue.path.join(".") || "root"}`);
            console.log(`  Message: ${issue.message}`);
            console.log(`  Code: ${issue.code}`);
        });

        console.log('validation failed...', req.body);
        return res.status(400).json({ 
          success: false,
          error: 'Invalid order information format',
          details: validation.error.issues 
        });
      }

    } catch (error) {
      console.error('Error validating order information:', error);
      return res.status(400).json({ error: 'Invalid order information format' });
    }

    try {
          const newOrder = await prisma.order.create({
            data: {
              // Connect the user relation
              user: { connect: { id: userId } },
              // Default billing information
              billingFirstName: billing.firstName,
              billingLastName: billing.lastName,
              billingAddress1: billing.address1,
              billingCity: billing.city,
              billingState: billing.state,
              billingZip: billing.zip,
              billingPhone: billing.phone,
              // Default shipping information
              shippingFirstName: shipping.firstName,
              shippingLastName: shipping.lastName,
              shippingAddress1: shipping.address1,
              shippingCity: shipping.city,
              shippingState: shipping.state,
              shippingZip: shipping.zip,
              shippingPhone: shipping.phone,
              // Required fields
              orderSubTotal: orderData.orderSubTotal ?? 0,
              orderTax: orderData.orderTax ?? 0,
              orderShippingCost: orderData.orderShippingCost ?? 0,
              // Connect the shippingType relation using shippingTypeId
              shippingType: { connect: { id: orderData.shippingTypeId } }
            }
          });
      const orderId = newOrder.id;
      // insert orderProducts into the orderProducts table
      
      const orderProductsData = orderProducts.map(item => ({
        orderId,
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice
      }));
      
      const newOrderProducts = await prisma.orderProduct.createMany({
        data: orderProductsData
      });

      res.status(201).json({ 
        success: true, 
        data: { 
          order: newOrder, 
          productsAdded: newOrderProducts.count 
        } 
      });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

export default router;