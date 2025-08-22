// src/types/express.d.ts

import { Express } from 'express';
import { ExtendedUser } from './prisma';

// Augment the Express Request type
declare global {
  namespace Express {
    interface User {
      id: number;
      firstName?: string;
      lastName?: string;
      email?: string;
      [key: string]: any;
    }
  }
}
