import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const DEFAULT_FILTERS = {
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom Measurement'],
  colors: ['Crimson Red', 'Royal Maroon', 'Mustard Gold', 'Emerald Green', 'Navy Blue', 'Blush Pink', 'Purple'],
  occasions: ['Wedding Day', 'Reception', 'Sangeet / Cocktails', 'Mehendi / Haldi', 'Photoshoot', 'Festival']
};

// GET /api/filters (Public Filters)
router.get('/', async (req, res) => {
  try {
    const { data: dresses, error } = await supabase
      .from('dresses')
      .select('sizes, colors, occasion')
      .eq('is_hidden', false);

    if (error || !dresses) {
      return res.json(DEFAULT_FILTERS);
    }

    const sizeSet = new Set(DEFAULT_FILTERS.sizes);
    const colorSet = new Set(DEFAULT_FILTERS.colors);
    const occasionSet = new Set(DEFAULT_FILTERS.occasions);

    dresses.forEach((d) => {
      if (Array.isArray(d.sizes)) d.sizes.forEach((s) => sizeSet.add(s));
      if (Array.isArray(d.colors)) d.colors.forEach((c) => colorSet.add(c));
      if (d.occasion) occasionSet.add(d.occasion);
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
  const { sizes, colors, occasions } = req.body;
  if (sizes) DEFAULT_FILTERS.sizes = sizes;
  if (colors) DEFAULT_FILTERS.colors = colors;
  if (occasions) DEFAULT_FILTERS.occasions = occasions;

  res.json({ message: 'Filter options updated successfully', filters: DEFAULT_FILTERS });
});

export default router;
