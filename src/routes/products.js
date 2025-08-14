// src/routes/products.js
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

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const data = await getProductsData();
    
    // Add a small delay to simulate network latency (like the Next.js API)
    setTimeout(() => {
      res.json({ data });
    }, 1000);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/category/:id - Get products by category
// This specific route must be defined BEFORE the generic /:id route
router.get('/category/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getProductsData();
    
    const filteredProducts = id === '' 
      ? data.products 
      : data.products.filter(product => product.category.toLowerCase() === id.toLowerCase());
    
    res.json({ data: { products: filteredProducts } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// GET /api/products/:id - Get a specific product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getProductsData();
    
    const product = data.products.find(product => product.id === parseInt(id));
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ data: { product } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
