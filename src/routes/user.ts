// src/routes/users.ts
import express from 'express';
import prisma from '../services/prismaService.js';
import { billingInfoSchema } from '../schemas/billingInfo.js';
import { shippingInfoSchema } from '../schemas/shippingInfo.js';


const router = express.Router();

/**
 * @route   POST /api/user/billing
 * @desc    Update the user billing information
 * @access  Public
 */

router.post('/billing', async (req, res) => {
  try {
    const userId = req.body.userId;
    const billingData = req.body.billing;

    // Validate request body
    if (!userId || !billingData) {
      console.log('MISSING USER ID OR BILLING DATA')
      return res.status(400).json({ error: 'User ID and billing data are required' });
    }

    const validation = billingInfoSchema.safeParse(billingData);
    if (!validation.success) {
      console.log('VALIDATION FAILED!', billingData)
      return res.status(400).json({ error: 'Invalid billing information format' });
    }

    // Update billing information in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        billingFirstName: billingData.firstName,
        billingLastName: billingData.lastName,
        billingAddress1: billingData.address1,
        billingAddress2: billingData.address2,
        billingCity: billingData.city,
        billingState: billingData.state,
        billingZip: billingData.zip,
        billingPhone: billingData.phone
      }
    });

    return res.json({ data: { user: updatedUser } });
  } catch (error) {
    console.error('Error updating billing information:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/user/shipping
 * @desc    Update the user shipping information
 * @access  Public
 */

router.post('/shipping', async (req, res) => {
  try {
    const userId = req.body.userId;
    const shippingData = req.body.shipping;

    // Validate request body
    if (!userId || !shippingData) {
      return res.status(400).json({ error: 'User ID and shipping data are required' });
    }

    const validation = shippingInfoSchema.safeParse(shippingData);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid shipping information format' });
    }

    // Update shipping information in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        shippingFirstName: shippingData.firstName,
        shippingLastName: shippingData.lastName,
        shippingAddress1: shippingData.address1,
        shippingAddress2: shippingData.address2,
        shippingCity: shippingData.city,
        shippingState: shippingData.state,
        shippingZip: shippingData.zip,
        shippingPhone: shippingData.phone
      }
    });

    return res.json({ data: { user: updatedUser } });
  } catch (error) {
    console.error('Error updating shipping information:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});


export default router;
