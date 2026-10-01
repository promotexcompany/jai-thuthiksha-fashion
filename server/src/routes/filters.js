import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { readDb, writeDb } from '../db.js';

const router = express.Router();

const DEFAULT_FILTERS = {
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom Measurement'],
  colors: ['Crimson Red', 'Royal Maroon', 'Mustard Gold', 'Emerald Green', 'Navy Blue', 'Blush Pink', 'Purple'],
  occasions: ['Wedding Day', 'Reception', 'Sangeet / Cocktails', 'Mehendi / Haldi', 'Photoshoot', 'Festival']
};

// GET /api/filters (Public Filters)
router.get('/', async (req, res) => {
  try {
    const db = readDb();
    const dbFilters = db.filters || DEFAULT_FILTERS;
    const dresses = db.dresses || [];

    const sizeSet = new Set(dbFilters.sizes || DEFAULT_FILTERS.sizes);
    const colorSet = new Set(dbFilters.colors || DEFAULT_FILTERS.colors);
    const occasionSet = new Set(dbFilters.occasions || DEFAULT_FILTERS.occasions);

    dresses.forEach((d) => {
      if (!d.isHidden) {
        if (Array.isArray(d.sizes)) d.sizes.forEach((s) => sizeSet.add(s));
        if (Array.isArray(d.colors)) d.colors.forEach((c) => colorSet.add(c));
        if (d.occasion) occasionSet.add(d.occasion);
      }
    });

    res.json({
      sizes: Array.from(sizeSet),
      colors: Array.from(colorSet),
      occasions: Array.from(occasionSet)
    });
  } catch (err) {
    console.error('GET /filters error:', err);
    res.json(DEFAULT_FILTERS);
  }
});

// PUT /api/admin/filters (Admin: Update Filters)
router.put('/admin/update', verifyToken, requireAdmin, (req, res) => {
  try {
    const { sizes, colors, occasions } = req.body;
    const db = readDb();
    if (!db.filters) db.filters = { ...DEFAULT_FILTERS };

    if (sizes) db.filters.sizes = sizes;
    if (colors) db.filters.colors = colors;
    if (occasions) db.filters.occasions = occasions;

    writeDb(db);
    res.json({ message: 'Filter options updated successfully', filters: db.filters });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update filters' });
  }
});

export default router;
