// src/services/prismaService.ts
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Check environment configuration
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in environment variables');
}

// Create a singleton instance of Prisma with more careful initialization
let prisma: PrismaClient;

try {
  console.log('Creating PrismaClient instance...');
  
  // Create the client with detailed logging
  prisma = new PrismaClient({
    log: ['info','warn', 'error'],
    errorFormat: 'pretty',
  });
  
  console.log('PrismaClient instance created successfully');
  
  // Test connection
  console.log('Testing database connection...');
  void prisma.$connect()
    .then(() => console.log('Database connection established successfully'))
    .catch(err => console.error('Failed to establish database connection:', err));
    
} catch (error) {
  console.error('CRITICAL ERROR initializing Prisma client:');
  if (error instanceof Error) {
    console.error(`Type: ${error.constructor.name}`);
    console.error(`Message: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
  } else {
    console.error('Unknown error type:', error);
  }
  
  // Create a fallback client with minimal configuration
  console.log('Creating fallback PrismaClient...');
  prisma = new PrismaClient();
}

export default prisma;
