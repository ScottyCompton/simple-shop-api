// src/types/prisma.ts
import { User as PrismaUser } from '@prisma/client';

// Auth type based on our schema
export interface PrismaAuth {
  id: number;
  provider: string;
  providerId: string;
  avatar?: string | null;
  userId: number;
  createdAt: Date;
  lastUsedAt: Date;
  user?: PrismaUser;
}

// Extended Prisma User type with related auths
export interface ExtendedUser extends PrismaUser {
  auths?: PrismaAuth[];
}
