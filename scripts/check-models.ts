// check-models.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Log available models on the prisma client
console.log('Available models on prisma client:', Object.keys(prisma));

async function cleanup() {
  await prisma.$disconnect();
}

cleanup();
