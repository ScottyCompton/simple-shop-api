// src/index.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import productsRoutes from './routes/products.js';
import categoriesRoutes from './routes/categories.js';
import usersRoutes from './routes/users.js';
import statesRoutes from './routes/states.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/states', statesRoutes);

// Basic root route
app.get('/', (req, res) => {
  res.json({
    message: 'Simple Shop API',
    endpoints: [
      { path: '/api/products', description: 'Get all products' },
      { path: '/api/products/:id', description: 'Get a specific product by ID' },
      { path: '/api/products/category/:id', description: 'Get products by category' },
      { path: '/api/categories', description: 'Get all categories' },
      { path: '/api/categories/home', description: 'Get categories with display information' },
      { path: '/api/users/auth', description: 'Authenticate a user with email and password' },
      { path: '/api/users/:id', description: 'Get complete user data by ID' },
      { path: '/api/states', description: 'Get all states with ID, abbreviation, and full name' },
      { path: '/api/states/abbr', description: 'Get state abbreviations and full names' }
    ]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
