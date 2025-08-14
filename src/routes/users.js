// src/routes/users.js
import express from 'express';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to users.json
const usersFilePath = join(__dirname, '../data/users.json');

/**
 * @route   POST /api/users/auth
 * @desc    Authenticate user with email and password
 * @access  Public
 */
router.post('/auth', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Read users from JSON file
    const usersData = await fs.readFile(usersFilePath, 'utf8');
    const { users } = JSON.parse(usersData);

    // Find user with matching email
    const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate the expected password: first initial of first name + last name, all lowercase
    const expectedPassword = (user.firstName.charAt(0) + user.lastName).toLowerCase().replace(/\s+/g, '');

    // Check if passwords match
    if (password === expectedPassword) {
      // Return user data without sensitive information
      return res.json({data: {
       user: { id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email}
      }});
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

    // Read users from JSON file
    const usersData = await fs.readFile(usersFilePath, 'utf8');
    const { users } = JSON.parse(usersData);

    // Find user with matching id
    const user = users.find(user => user.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the complete user data
    return res.json({data: {user: user}});
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
