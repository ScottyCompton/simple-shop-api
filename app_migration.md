# Simple Shop API Migration Plan
## JSON### 2.1. Initialize Prisma

```bash
# Initialize Prisma in the project (will use the existing .env file)
npx prisma init
```

This will create:
- `prisma/schema.prisma` file
- Will use the existing `.env` file with DATABASE_URL that points to the MySQL databaseMySQL with Prisma ORM

This document outlines the step-by-step plan to migrate the existing simple-shop-api from using local JSON files to a MySQL database with Prisma ORM, while also converting the codebase to TypeScript.

## Project Overview

The current API reads data from JSON files:
- Products (products.json)
- Users (users.json)
- States (states.json)

We need to migrate this data to MySQL tables and refactor the API to use Prisma for database access.

## Phase 1: Package Installation and Setup

### 1.1. Install Required Packages

First, we'll install all necessary packages required for the migration:

```bash
# Install Prisma and client
npm install @prisma/client
npm install --save-dev prisma

# Install TypeScript and type definitions
npm install --save-dev typescript @types/node @types/express @types/cors @types/morgan

# Install ts-node and nodemon for development
npm install --save-dev ts-node nodemon

# Ensure all existing dependencies are up to date
npm install
```

### 1.2. Configure TypeScript

Ensure the TypeScript configuration in tsconfig.json is properly set up (already exists).

## Phase 2: Database Schema Setup and Migrations

### 1.1. Initialize Prisma

```bash
# Initialize Prisma in the project
npx prisma init
```

This will create:
- `prisma/schema.prisma` file
- `.env` file with DATABASE_URL (which already exists with MySQL connection string)

### 1.2. Create Prisma Schema

Create the database schema in `prisma/schema.prisma` based on the existing JSON structure:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Product {
  id        Int      @id @default(autoincrement())
  name      String
  price     Float
  category  String
  inStock   Boolean  @default(true)
  shortDesc String   @db.Text
  imgUrl    String   @db.Text
  mfgName   String
  longDesc  String   @db.LongText
  
  @@map("products")
}

model User {
  id        Int      @id @default(autoincrement())
  firstName String
  lastName  String
  email     String   @unique
  
  // Billing information
  billingFirstName String
  billingLastName  String
  billingAddress1  String
  billingAddress2  String?
  billingCity      String
  billingState     String
  billingZip       String
  billingPhone     String
  
  // Shipping information
  shippingFirstName String
  shippingLastName  String
  shippingAddress1  String
  shippingAddress2  String?
  shippingCity      String
  shippingState     String
  shippingZip       String
  shippingPhone     String
  
  @@map("users")
}

model State {
  id    Int    @id @default(autoincrement())
  abbr  String @unique
  state String
  
  @@map("states")
}
```

### 1.3. Generate Migrations

```bash
# Generate the migration files
npx prisma migrate dev --name init
```

This will:
- Create the migration files in `prisma/migrations/`
- Apply the migration to the database
- Generate the Prisma client

## Phase 3: Data Migration Scripts

### 3.1. Create Migration Scripts

#### 3.1.1. Create TypeScript Migration Script for Products

```typescript
// scripts/migrate-products.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    // Read products data from JSON file
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const { products } = JSON.parse(data);
    
    console.log(`Migrating ${products.length} products to the database...`);
    
    // Insert products into database
    for (const product of products) {
      await prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          inStock: product.inStock,
          shortDesc: product.shortDesc,
          imgUrl: product.imgUrl,
          mfgName: product.mfgName,
          longDesc: product.longDesc,
        },
      });
    }
    
    console.log('Products migration completed successfully!');
  } catch (error) {
    console.error('Error migrating products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

#### 2.1.2. Create TypeScript Migration Script for Users

```typescript
// scripts/migrate-users.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    // Read users data from JSON file
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'users.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const { users } = JSON.parse(data);
    
    console.log(`Migrating ${users.length} users to the database...`);
    
    // Insert users into database
    for (const user of users) {
      await prisma.user.create({
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          
          // Billing information
          billingFirstName: user.billing.firstName,
          billingLastName: user.billing.lastName,
          billingAddress1: user.billing.address1,
          billingAddress2: user.billing.address2 || '',
          billingCity: user.billing.city,
          billingState: user.billing.state,
          billingZip: user.billing.zip,
          billingPhone: user.billing.phone,
          
          // Shipping information
          shippingFirstName: user.shipping.firstName,
          shippingLastName: user.shipping.lastName,
          shippingAddress1: user.shipping.address1,
          shippingAddress2: user.shipping.address2 || '',
          shippingCity: user.shipping.city,
          shippingState: user.shipping.state,
          shippingZip: user.shipping.zip,
          shippingPhone: user.shipping.phone,
        },
      });
    }
    
    console.log('Users migration completed successfully!');
  } catch (error) {
    console.error('Error migrating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

#### 2.1.3. Create TypeScript Migration Script for States

```typescript
// scripts/migrate-states.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    // Read states data from JSON file
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'states.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const { states } = JSON.parse(data);
    
    console.log(`Migrating ${states.length} states to the database...`);
    
    // Insert states into database
    for (const state of states) {
      await prisma.state.create({
        data: {
          id: state.id,
          abbr: state.abbr,
          state: state.state,
        },
      });
    }
    
    console.log('States migration completed successfully!');
  } catch (error) {
    console.error('Error migrating states:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

### 3.2. Add Script Commands to package.json

Add the following scripts to `package.json`:

```json
"scripts": {
  "migrate:products": "ts-node scripts/migrate-products.ts",
  "migrate:users": "ts-node scripts/migrate-users.ts",
  "migrate:states": "ts-node scripts/migrate-states.ts",
  "migrate:all": "npm run migrate:products && npm run migrate:users && npm run migrate:states"
}
```

### 3.3. Execute Data Migration

```bash
# Install ts-node to run TypeScript files directly
npm install --save-dev ts-node

# Run all migrations
npm run migrate:all

# Or run individual migrations
npm run migrate:products
npm run migrate:users
npm run migrate:states
```

## Phase 4: API Refactoring with TypeScript and Prisma

### 4.1. Setup Project Structure for TypeScript

Update the directory structure to support TypeScript:

```
src/
├── controllers/     # Controller logic
├── data/           # Original JSON files (for reference)
├── models/         # TypeScript interfaces/types
├── routes/         # Route definitions
└── index.ts        # Main application file
```

### 4.2. Create TypeScript Types/Interfaces

```typescript
// src/models/types.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  shortDesc: string;
  imgUrl: string;
  mfgName: string;
  longDesc: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  billing: Address;
  shipping: Address;
}

export interface State {
  id: number;
  abbr: string;
  state: string;
}
```

### 4.3. Create Prisma Service

```typescript
// src/services/prismaService.ts
import { PrismaClient } from '@prisma/client';

// Create a singleton instance of Prisma
const prisma = new PrismaClient();

export default prisma;
```

### 4.4. Refactor Routes to TypeScript with Prisma

#### 4.4.1. Products Routes

```typescript
// src/routes/products.ts
import express from 'express';
import prisma from '../services/prismaService';

const router = express.Router();

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    
    // Add a small delay to simulate network latency (like the Next.js API)
    setTimeout(() => {
      res.json({ data: { products } });
    }, 1000);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/category/:id - Get products by category
router.get('/category/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const products = id === '' 
      ? await prisma.product.findMany()
      : await prisma.product.findMany({
          where: {
            category: {
              equals: id,
              mode: 'insensitive' // Case-insensitive search
            }
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
```

#### 4.4.2. Categories Routes

```typescript
// src/routes/categories.ts
import express from 'express';
import prisma from '../services/prismaService';

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
```

#### 4.4.3. Users Routes

```typescript
// src/routes/users.ts
import express from 'express';
import prisma from '../services/prismaService';
import delay from 'delay';
import { User } from '../models/types';

const router = express.Router();

/**
 * @route   POST /api/users/auth
 * @desc    Authenticate user with email and password
 * @access  Public
 */
router.post('/auth', async (req, res) => {
  try {
    const { email, password } = req.body;
    await delay(3000); // Simulate a delay for demonstration purposes

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user with matching email
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive' // Case-insensitive search
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate the expected password: first initial of first name + last name, all lowercase
    const expectedPassword = (user.firstName.charAt(0) + user.lastName).toLowerCase().replace(/\s+/g, '');

    // Check if passwords match
    if (password === expectedPassword) {
      // Return user data without sensitive information
      return res.json({
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        }
      });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get a user by ID with complete profile data
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Validate userId is a number
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'User ID must be a number' });
    }

    // Find user with matching id
    const dbUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform database user to match original API format
    const user: User = {
      id: dbUser.id,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      billing: {
        firstName: dbUser.billingFirstName,
        lastName: dbUser.billingLastName,
        address1: dbUser.billingAddress1,
        address2: dbUser.billingAddress2 || undefined,
        city: dbUser.billingCity,
        state: dbUser.billingState,
        zip: dbUser.billingZip,
        phone: dbUser.billingPhone
      },
      shipping: {
        firstName: dbUser.shippingFirstName,
        lastName: dbUser.shippingLastName,
        address1: dbUser.shippingAddress1,
        address2: dbUser.shippingAddress2 || undefined,
        city: dbUser.shippingCity,
        state: dbUser.shippingState,
        zip: dbUser.shippingZip,
        phone: dbUser.shippingPhone
      }
    };

    // Return the complete user data
    return res.json({ data: { user } });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
```

#### 4.4.4. States Routes

```typescript
// src/routes/states.ts
import express from 'express';
import prisma from '../services/prismaService';

const router = express.Router();

// GET /api/states - Get all states
router.get('/', async (req, res) => {
  try {
    const states = await prisma.state.findMany();
    
    // Add a small delay to simulate network latency
    setTimeout(() => {
      res.json({ data: { states } });
    }, 300);
  } catch (err) {
    console.error('Error fetching states:', err);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

// GET /api/states/abbr - Get only state abbreviations and names
router.get('/abbr', async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      select: {
        abbr: true,
        state: true
      }
    });
    
    // Add a small delay to simulate network latency
    setTimeout(() => {
      res.json({ data: { states } });
    }, 300);
  } catch (err) {
    console.error('Error fetching state abbreviations:', err);
    res.status(500).json({ error: 'Failed to fetch state abbreviations' });
  }
});

export default router;
```

### 4.5. Refactor Main Application File

```typescript
// src/index.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import productsRoutes from './routes/products';
import categoriesRoutes from './routes/categories';
import usersRoutes from './routes/users';
import statesRoutes from './routes/states';

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
```

### 4.6. Update Package.json Scripts

Update the scripts section in package.json:

```json
"scripts": {
  "start": "node dist/index.js",
  "dev": "nodemon --exec ts-node src/index.ts",
  "build": "tsc",
  "migrate:products": "ts-node scripts/migrate-products.ts",
  "migrate:users": "ts-node scripts/migrate-users.ts",
  "migrate:states": "ts-node scripts/migrate-states.ts",
  "migrate:all": "npm run migrate:products && npm run migrate:users && npm run migrate:states"
}
```

## Phase 5: Final Testing and Verification

### 5.1. Final Testing

1. Build the TypeScript code:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

3. Test all endpoints to ensure they work as expected:
   - GET /api/products
   - GET /api/products/:id
   - GET /api/products/category/:id
   - GET /api/categories
   - GET /api/categories/home
   - POST /api/users/auth
   - GET /api/users/:id
   - GET /api/states
   - GET /api/states/abbr

## Conclusion

This migration plan provides a structured approach to refactoring the simple-shop-api from JSON files to MySQL with Prisma ORM and TypeScript. By following this plan step by step, we'll ensure that the API maintains its existing functionality while modernizing the codebase and data storage approach.
