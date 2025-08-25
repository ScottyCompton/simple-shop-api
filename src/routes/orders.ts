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
    const {orderProducts, shippingTypeId} = orderData;

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

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    let orderSubTotal = 0;
    for (const item of orderProducts) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      orderSubTotal += (product?.price ?? 0) * item.qty;
    }

    const orderTax = orderSubTotal * 0.07875;

    const orderShippingType = await prisma.shippingType.findUnique({
      where: { id: shippingTypeId }
    });

    const orderShippingCost = orderShippingType?.price ?? 0;

    try {
      if(user) {
        // If user exists, use their information
        const newOrder = await prisma.order.create({
          data: {
            // Connect the user relation
            user: { connect: { id: userId } },
              // Default billing information
              billingFirstName: user?.billingFirstName,
              billingLastName: user?.billingLastName,
              billingAddress1: user?.billingAddress1,
              billingCity: user?.billingCity,
              billingState: user?.billingState,
              billingZip: user?.billingZip,
              billingPhone: user?.billingPhone,
              // Default shipping information
              shippingFirstName: user?.shippingFirstName,
              shippingLastName: user?.shippingLastName,
              shippingAddress1: user?.shippingAddress1,
              shippingCity: user?.shippingCity,
              shippingState: user?.shippingState,
              shippingZip: user?.shippingZip,
              shippingPhone: user?.shippingPhone,
              // Required fields
              orderSubTotal,
              orderTax,
              orderShippingCost,
              // Connect the shippingType relation using shippingTypeId
              shippingType: { connect: { id: orderData.shippingTypeId } }
            }
          });
        const orderId = newOrder.id;
        // insert orderProducts into the orderProducts table
        
        const orderProductsData = await Promise.all(orderProducts.map(async item => {
          const product = await prisma.product.findUnique({ 
            where: { id: item.productId }
          });
          return {
            orderId,
            productId: item.productId,
            qty: item.qty,
            unitPrice: product?.price || 0
          };
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
      }
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

export default router;