// src/index.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import session from 'express-session';

// Add a global error handler
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION - Shutting down...');
  console.error(error.name, error.message);
  console.error(error.stack);
  process.exit(1);
});

console.log('Core imports loaded, loading passport...');
import passport from './config/passport.js';
console.log('Passport imported successfully');

// Load environment variables
dotenv.config();

// Import routes
import productsRoutes from './routes/products.js';
import categoriesRoutes from './routes/categories.js';
import usersRoutes from './routes/users.js';
import userRoutes from './routes/user.js'
import statesRoutes from './routes/states.js';
import shippingTypeRoutes from './routes/shippingTypes.js';
import authRoutes from './routes/auth.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Session setup for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/user', userRoutes);
app.use('/api/states', statesRoutes);
app.use('/api/shippingtypes', shippingTypeRoutes);
app.use('/api/auth', authRoutes);

// Import user auth routes
import userAuthRoutes from './routes/userAuth.js';
app.use('/api/user-auth', userAuthRoutes);

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
      { path: '/api/user/billing', description: 'Update User Billing information' },
      { path: '/api/user/shipping', description: 'Update User Shipping information' },
      { path: '/api/auth/google', description: 'Authenticate with Google' },
      { path: '/api/auth/github', description: 'Authenticate with GitHub' },
      { path: '/api/auth/me', description: 'Get current user info from token' },
      { path: '/api/states', description: 'Get all states with ID, abbreviation, and full name' },
      { path: '/api/shippingtypes', description: 'Get all shipping types' }
    ]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
