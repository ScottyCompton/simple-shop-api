// src/routes/users.ts
import express from 'express';
import prisma from '../services/prismaService.js';
import delay from 'delay';
import { User } from '../models/types.js';
import { generateToken } from '../services/jwtService.js';
import bcrypt from 'bcrypt';
import { userLoginSchema } from '../schemas/userLogin.js';
const router = express.Router();

/**
 * @route   POST /api/users/auth
 * @desc    Authenticate user with email and password
 * @access  Public
 */
router.post('/auth', async (req, res) => {
  try {
    const { email, password } = req.body;
    await delay(1000); // Simulate a delay for demonstration purposes

    const validation = userLoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid email or password format' });
    }

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Simplified query - convert email to lowercase for consistency
    const lowerCaseEmail = email.toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        email: lowerCaseEmail
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if password exists in the user record
    if (!user.password) {
      return res.status(401).json({ error: 'Password not set for this user' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if(err) {
        console.error('Authentication error:', err);
        return res.status(500).json({ error: 'Server error' });        
      }

      if(result) {
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
    });
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
    
    // Fetch auth providers and avatar for this user using Prisma client
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
    
    // Directly use Prisma model to get auth records
    let auths: AuthWithDates[] = [];
    try {
      auths = await prisma.auth.findMany({
        where: { userId: userId },
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
      console.error('Error fetching auth records:', error);
      // Keep empty array as fallback
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
