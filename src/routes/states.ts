// src/routes/states.ts
import express from 'express';
import prisma from '../services/prismaService.js';

const router = express.Router();

// GET /api/states - Get all states
router.get('/', async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      select: {
        abbr: true,
        state: true
      }
    });

    res.json({ result: states });

  } catch (err) {
    console.error('Error fetching states:', err);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

// GET /api/states/abbr - Get only state abbreviations and names
router.get('/abbr', async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      select: {
        abbr: true,
        state: true
      }
    });
    
    // Add a small delay to simulate network latency
    setTimeout(() => {
      res.json({ result: states });
    }, 300);
  } catch (err) {
    console.error('Error fetching state abbreviations:', err);
    res.status(500).json({ error: 'Failed to fetch state abbreviations' });
  }
});

export default router;
