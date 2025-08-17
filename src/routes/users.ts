// src/routes/users.ts
import express from 'express';
import prisma from '../services/prismaService.js';
import delay from 'delay';
import { User } from '../models/types.js';

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
      // Return user data without sensitive information
      return res.json({
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
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

    // Find user with matching id
    const dbUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform database user to match original API format
    const user: User = {
      id: dbUser.id,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
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
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
