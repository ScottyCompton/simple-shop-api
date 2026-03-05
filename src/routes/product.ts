// src/routes/products.ts
import express from 'express';
import prisma from '../services/prismaService.js';

const router = express.Router();

// GET /api/product/:id - Get a specific product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ data: { product } });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
