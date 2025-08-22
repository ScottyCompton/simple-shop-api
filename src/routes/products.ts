// src/routes/products.ts
import express from 'express';
import prisma from '../services/prismaService.js';

const router = express.Router();

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    
    // Add a small delay to simulate network latency (like the Next.js API)
    // setTimeout(() => {
    //   res.json({ data: { products } });
    // }, 1000);
      res.json({ data: { products } });

  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/category/:id - Get products by category
router.get('/category/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === '') {
      const products = await prisma.product.findMany();
      return res.json({ data: { products } });
    }

    // Simplified query - convert both to lowercase for comparison
    const products = await prisma.product.findMany({
      where: {
        category: id
      }
    });
    
    res.json({ data: { products } });
  } catch (err) {
    console.error('Error fetching products by category:', err);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// GET /api/products/:id - Get a specific product by ID
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
