// src/routes/userAuth.ts
import express from 'express';
import prisma from '../services/prismaService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/user-auth
 * @desc    Get all auth providers for the current user
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'User ID not found in request' });
    }
    
    // First check if avatar column exists to avoid errors
    const columnCheck = await prisma.$queryRaw`SHOW COLUMNS FROM auth LIKE 'avatar'`;
    const avatarExists = Array.isArray(columnCheck) && columnCheck.length > 0;
    
    // Get all auth entries for this user with appropriate columns
    let authEntries;
    if (avatarExists) {
      authEntries = await prisma.$queryRaw`
        SELECT id, provider, providerId, avatar, lastUsedAt
        FROM auth 
        WHERE userId = ${req.userId}
        ORDER BY lastUsedAt DESC
      `;
    } else {
      console.warn('Avatar column not found in auth table, using fallback query');
      authEntries = await prisma.$queryRaw`
        SELECT id, provider, providerId, lastUsedAt
        FROM auth 
        WHERE userId = ${req.userId}
        ORDER BY lastUsedAt DESC
      `;
      
      // Add null avatar property if it doesn't exist
      authEntries = Array.isArray(authEntries) ? 
        authEntries.map(entry => ({ ...entry, avatar: null })) : 
        [];
    }
    
    return res.json({ 
      success: true,
      data: { 
        authProviders: authEntries || [] 
      } 
    });
  } catch (error) {
    console.error('Error fetching auth providers:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

/**
 * @route   DELETE /api/user-auth/:id
 * @desc    Remove an auth provider connection
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const authId = parseInt(req.params.id);
    
    // Validate authId is a number
    if (isNaN(authId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid auth ID' 
      });
    }
    
    // Check if the auth entry belongs to the requesting user
    const authEntry = await prisma.$queryRaw`
      SELECT * FROM auth WHERE id = ${authId} AND userId = ${req.userId} LIMIT 1
    `;
    
    if (!Array.isArray(authEntry) || authEntry.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Auth provider not found or not authorized' 
      });
    }
    
    // Check that user has at least one other auth method before removing this one
    const authCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM auth WHERE userId = ${req.userId}
    `;
    
    const count = Array.isArray(authCount) && authCount.length > 0 
      ? (authCount[0] as any).count 
      : 0;
    
    if (count <= 1) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot remove last authentication method. Add another method first.' 
      });
    }
    
    // Remove the auth entry
    await prisma.$executeRaw`DELETE FROM auth WHERE id = ${authId}`;
    
    return res.json({ 
      success: true,
      data: { 
        message: 'Authentication provider removed successfully' 
      } 
    });
  } catch (error) {
    console.error('Error removing auth provider:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

export default router;
