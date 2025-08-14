// src/routes/categories.js
import express from 'express';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();

// Get file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, '..', 'data', 'products.json');

// Helper function to read products data
const getProductsData = async () => {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading products data:', err);
    throw err;
  }
};

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const data = await getProductsData();
    const uniqueCategories = new Set(data.products.map(product => product.category));
    
    // Add a small delay to simulate network latency (like the Next.js API)
    setTimeout(() => {
      res.json({ data: { categories: Array.from(uniqueCategories) } });
    }, 500);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/categories/home - Get categories with display information
router.get('/home', async (req, res) => {
  try {
    const data = await getProductsData();
    const uniqueCategories = new Set(data.products.map(product => product.category));
    
    const categories = Array.from(uniqueCategories).map(category => {
      const productsInCategory = data.products.filter(product => product.category === category);
      return {
        name: category,
        imgUrl: productsInCategory[0]?.imgUrl || '',
        productCount: productsInCategory.length
      };
    });
    
    categories.sort((a, b) => a.name < b.name ? -1 : 1);
    
    // Add a small delay to simulate network latency (like the Next.js API)
    setTimeout(() => {
      res.json({ data: { categories } });
    }, 1000);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch home categories' });
  }
});

export default router;
