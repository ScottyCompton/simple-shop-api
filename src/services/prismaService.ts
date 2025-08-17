// src/services/prismaService.ts
import { PrismaClient } from '@prisma/client';

// Create a singleton instance of Prisma
const prisma = new PrismaClient();

export default prisma;
