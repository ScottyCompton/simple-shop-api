// src/routes/products.ts
import express from 'express';
import prisma from '../services/prismaService.js';

const router = express.Router();

// GET /api/products/page/:page - Get all products with pagination
router.get('/page/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const pageSize = parseInt(process.env.LIST_PAGE_SIZE || "10"); // Number of products per page
    const currentPage = parseInt(page || "1");
    const skip = (currentPage - 1) * pageSize;

    // Get total count for pagination info
    const totalCount = await prisma.product.count();

    // Get paginated products
    const products = await prisma.product.findMany({
      skip: skip,
      take: pageSize,
      orderBy: { id: 'asc' }
    });

    res.json({ 
      data: { 
        products,
        pagination: {
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
          currentPage: currentPage,
          pageSize: pageSize
        } 
      }
    });

  } catch (err) {
    console.error('Error fetching products with pagination:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products - Get all products (non-paginated)
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

// GET /api/products/category/:id/:page - Get products by category with pagination
router.get('/category/:id/:page', async (req, res) => {
  try {
    const { id, page } = req.params;
    const pageSize = parseInt(process.env.LIST_PAGE_SIZE || "10"); // Number of products per page
    const currentPage = parseInt(page || "1");
    const skip = (currentPage - 1) * pageSize;

    // Get total count for pagination info
    const totalCount = await prisma.product.count({
      where: { category: id }
    });

    // Get paginated products
    const products = await prisma.product.findMany({
      where: { category: id },
      skip: skip,
      take: pageSize,
      orderBy: { id: 'asc' }
    });
    
    res.json({ 
      data: { 
        products, 
        pagination: {
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
          currentPage: currentPage,
          pageSize: pageSize
        } 
      } 
    });
  } catch (err) {
    console.error('Error fetching products by category with pagination:', err);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// GET /api/products/category/:id - Get all products by category
router.get('/category/:id', async (req, res) => {
  try {
    const { id } = req.params;

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
