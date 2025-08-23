// src/routes/auth.ts
import express from 'express';
import passport from '../config/passport.js';
import prisma from '../services/prismaService.js';
import { generateToken, verifyToken } from '../services/jwtService.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  (req, res, next) => {
    // Custom error handling middleware
    passport.authenticate('google', { 
      session: false, 
      failureRedirect: `${CLIENT_URL}/login?error=true`
    })(req, res, next);
  },
  (req, res) => {
        // Add proper type checking for req.user
    if (!req.user || typeof req.user === 'undefined') {
      console.error('User authentication failed: user object is undefined');
      return res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
    }
    
    // Safely access the user id with proper typing
    const user = req.user as { id: number };
    if (!user.id || typeof user.id !== 'number') {
      console.error('User authentication failed: invalid user ID');
      return res.redirect(`${CLIENT_URL}/login?error=invalid_user`);
    }
    
    // Generate token with valid user ID
    const token = generateToken(user.id);
    // Include provider information in the callback
    res.redirect(`${CLIENT_URL}/auth/callback?token=${token}&provider=google`);
  }
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${CLIENT_URL}/login?error=true` }),
  (req, res) => {
    // Add proper type checking for req.user
    if (!req.user || typeof req.user === 'undefined') {
      console.error('User authentication failed: user object is undefined');
      return res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
    }
    
    // Safely access the user id with proper typing
    const user = req.user as { id: number };
    if (!user.id || typeof user.id !== 'number') {
      console.error('User authentication failed: invalid user ID');
      return res.redirect(`${CLIENT_URL}/login?error=invalid_user`);
    }
    
    // Generate token with valid user ID
    const token = generateToken(user.id);
    // Include provider information in the callback
    res.redirect(`${CLIENT_URL}/auth/callback?token=${token}&provider=github`);
  }
);

// Get user info from token
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided' 
      });
    }

    // Verify and decode the token using the imported function
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token' 
      });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    // Fetch auth methods for the user directly with Prisma
    let auths: {
      id: number;
      provider: string;
      providerId: string;
      avatar: string | null;
      userId: number;
      createdAt: Date;
      lastUsedAt: Date;
    }[] = [];
    
    try {
      // Get all auth methods for the user with their avatar information
      auths = await prisma.auth.findMany({
        where: { userId: decoded.id },
        orderBy: { lastUsedAt: 'desc' },
        select: {
          id: true,
          provider: true,
          providerId: true,
          avatar: true,
          userId: true,
          createdAt: true,
          lastUsedAt: true
        }
      });
    } catch (error) {
      console.error('Error fetching auth methods:', error);
      // Keep empty array as fallback
    }
    
    // Extract providers from the result
    const authProviders = auths.map(auth => auth.provider);
    
    // Get most recent avatar from auth providers
    const mostRecentAuthWithAvatar = auths.find(auth => auth.avatar);
    const avatar = mostRecentAuthWithAvatar?.avatar || null;
    
    // Return user data with their auth providers list and avatar
    return res.json({
      isValid: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar,
        authProviders: authProviders,
        hasBilling: user.billingAddress1 !== '',
        hasShipping: user.shippingAddress1 !== ''
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

// Diagnostic route for OAuth configuration
router.get('/oauth-config', (req, res) => {
  // Only show in development mode
  if (process.env.NODE_ENV !== 'production') {
    const googleCallbackUrl = `${process.env.API_URL}/api/auth/google/callback`;
    const githubCallbackUrl = `${process.env.API_URL}/api/auth/github/callback`;

    return res.json({
      message: 'OAuth Configuration (DEVELOPMENT ONLY)',
      googleConfig: {
        clientIDConfigured: !!process.env.GOOGLE_CLIENT_ID,
        clientSecretConfigured: !!process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: googleCallbackUrl
      },
      githubConfig: {
        clientIDConfigured: !!process.env.GITHUB_CLIENT_ID,
        clientSecretConfigured: !!process.env.GITHUB_CLIENT_SECRET,
        callbackUrl: githubCallbackUrl
      },
      apiUrl: process.env.API_URL,
      clientUrl: process.env.CLIENT_URL,
      note: 'Make sure these callback URLs match exactly what you have configured in the Google/GitHub developer console'
    });
  } else {
    return res.status(403).json({
      message: 'This route is only available in development mode'
    });
  }
});

export default router;
