// src/routes/states.ts
import express from 'express';
import prisma from '../services/prismaService.js';

const router = express.Router();

// GET /api/shippingTypes - Get all shipping types
router.get('/', async (req, res) => {
  try {
    const shippingTypes = await prisma.shippingType.findMany();
    // If your model is named 'ShippingTypes' in schema.prisma, use:
    // const shippingTypes = await prisma.shippingTypes.findMany();

    // Add a small delay to simulate network latency
     res.json({ data: { shippingTypes } });
  } catch (err) {
    console.error('Error fetching shipping types:', err);
    res.status(500).json({ error: 'Failed to fetch shipping types' });
  }
});


export default router;
