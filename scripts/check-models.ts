// check-models.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  await prisma.$disconnect();
}

cleanup();
