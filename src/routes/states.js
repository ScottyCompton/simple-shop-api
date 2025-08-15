// src/routes/states.js
import express from 'express';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();

// Get file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, '..', 'data', 'states.json');

// Helper function to read states data
const getStatesData = async () => {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
    //{ data: { product } }
  } catch (err) {
    console.error('Error reading states data:', err);
    throw err;
  }
};

// GET /api/states - Get all states
router.get('/', async (req, res) => {
  try {
    const states = await getStatesData();
    
    // Add a small delay to simulate network latency
    setTimeout(() => {
      res.json({data: {states}});
    }, 300);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

// GET /api/states/abbr - Get only state abbreviations and names
router.get('/abbr', async (req, res) => {
  try {
    const data = await getStatesData();
    const states = data.states.map(state => ({
      abbr: state.abbr,
      state: state.state
    }));
    
    // Add a small delay to simulate network latency
    setTimeout(() => {
      res.json({data: {states}});
    }, 300);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch state abbreviations' });
  }
});

export default router;
