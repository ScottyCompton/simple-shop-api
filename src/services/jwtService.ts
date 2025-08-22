// src/services/jwtService.ts
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

// Original code that's known to work - but using seconds for JWT_EXPIRES_IN
// Let's set a reasonable expiration time (7 days = 604800 seconds)
const JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN || '604800', 10);

export const generateToken = (userId: number): string => {
  // Going back to the original approach but with proper expiration calculation
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const exp = now + JWT_EXPIRES_IN; // Expiration time
  
  try {
    return jwt.sign({ 
      id: userId,
      iat: now,   // Issued at
      exp: exp    // Expires at
    }, JWT_SECRET);
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new Error('Failed to generate authentication token');
  }
};

export const verifyToken = (token: string): { id: number } | null => {
  try {
    return jwt.verify(token, JWT_SECRET!) as { id: number };
  } catch (error) {
    return null;
  }
};

export default {
  generateToken,
  verifyToken,
};
