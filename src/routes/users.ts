// src/routes/users.ts
import express from 'express';
import prisma from '../services/prismaService.js';
import delay from 'delay';
import { User, Auth } from '../models/types.js';
import { generateToken } from '../services/jwtService.js';

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

    // Simplified query - convert email to lowercase for consistency
    const lowerCaseEmail = email.toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        email: lowerCaseEmail
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate the expected password: first initial of first name + last name, all lowercase
    const expectedPassword = (user.firstName.charAt(0) + user.lastName).toLowerCase().replace(/\s+/g, '');

    // Check if passwords match
    if (password === expectedPassword) {
      // Generate JWT token
    const token = generateToken(user.id);
    
    // Return user data with token
    return res.json({
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        token
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

    const dbUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Fetch auth providers and avatar for this user
    let authResults;
    
    try {
      // Try to use Prisma raw query, which might be more reliable
      authResults = await prisma.$queryRaw`
        SELECT id, provider, providerId, avatar, userId, createdAt, lastUsedAt 
        FROM auth 
        WHERE userId = ${userId}
        ORDER BY lastUsedAt DESC
      `;
    } catch (error) {
      console.error('Error executing raw query:', error);
      // Fallback to empty array if query fails
      authResults = [];
    }
    
    // Define Auth type for consistency
    type AuthWithDates = {
      id: number;
      provider: string;
      providerId: string;
      avatar: string | null;
      userId: number;
      createdAt: Date;
      lastUsedAt: Date;
    };

    // Process the auth results and handle possible data types from raw query
    let auths: AuthWithDates[] = [];
    if (Array.isArray(authResults)) {
      auths = authResults.map((auth: any) => {
        return {
          id: Number(auth.id),
          provider: String(auth.provider),
          providerId: String(auth.providerId),
          avatar: auth.avatar ? String(auth.avatar) : null,
          userId: Number(auth.userId),
          // Handle date serialization carefully
          createdAt: new Date(auth.createdAt),
          lastUsedAt: new Date(auth.lastUsedAt)
        };
      });
    } else {
      console.warn('Auth results is not an array:', typeof authResults);
    }
    
    const authProviders = auths.map((auth) => auth.provider);
    
    // Get the most recent avatar from auth providers
    const mostRecentAuthWithAvatar = auths.find((auth) => auth.avatar);
    const avatar = mostRecentAuthWithAvatar?.avatar || null;

    // Convert auths to plain objects to prevent Date serialization issues
    const plainAuths = auths.map(auth => ({
      ...auth,
      createdAt: auth.createdAt.toISOString(),
      lastUsedAt: auth.lastUsedAt.toISOString()
    }));
    
    const user: User = {
      id: dbUser.id,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      auths: plainAuths as any, // Use type assertion to avoid TS errors
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
    // More detailed error logging
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, Message: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);
      
      // Return a more specific error message for debugging
      return res.status(500).json({ 
        error: 'Server error', 
        message: error.message,
        name: error.name
      });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
