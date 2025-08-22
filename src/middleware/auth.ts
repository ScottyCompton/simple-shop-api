// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwtService.js';

// Define a custom interface to extend Express Request
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      authProvider?: string;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Get the token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Access denied. No token provided.' 
    });
  }
  
  try {
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token.' 
      });
    }
    
    // Add user ID to request for use in protected routes
    req.userId = decoded.id;
    
    // Check if auth provider is specified in headers
    const authProvider = req.headers['x-auth-provider'] as string;
    if (authProvider) {
      req.authProvider = authProvider;
    }
    
    next();
  } catch (error) {
    console.error('Error authenticating token:', error);
    return res.status(401).json({ 
      success: false,
      error: 'Invalid token.' 
    });
  }
};
