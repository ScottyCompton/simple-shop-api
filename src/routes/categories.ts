// src/routes/categories.ts
import express from 'express';
import prisma from '../services/prismaService.js';

const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: { category: true }
    });
    
    // Extract unique categories
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    
    // Add a small delay to simulate network latency
    setTimeout(() => {
      res.json({ data: { categories: uniqueCategories } });
    }, 500);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/categories/home - Get categories with display information
router.get('/home', async (req, res) => {
  try {
    // Get all products to organize by category
    const products = await prisma.product.findMany();
    
    // Group products by category
    const categoryMap = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          name: product.category,
          imgUrl: product.imgUrl, // First product's image
          productCount: 1
        };
      } else {
        acc[product.category].productCount++;
      }
      return acc;
    }, {} as Record<string, { name: string; imgUrl: string; productCount: number }>);
    
    // Convert map to array and sort alphabetically
    const categories = Object.values(categoryMap).sort((a, b) => 
      a.name < b.name ? -1 : 1
    );
    
    // Add a small delay to simulate network latency
    setTimeout(() => {
      res.json({ data: { categories } });
    }, 1000);
  } catch (err) {
    console.error('Error fetching home categories:', err);
    res.status(500).json({ error: 'Failed to fetch home categories' });
  }
});

export default router;
