import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

export const mapCategoryFromDb = (c) => {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    tagline: c.tagline || 'Exclusive Luxury Collection',
    enabled: c.enabled !== false,
    order: c.display_order || 0,
    displayOrder: c.display_order || 0,
    image: c.image || '',
    createdAt: c.created_at
  };
};

// GET /api/categories (Public Enabled Categories)
router.get('/', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('enabled', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories from Supabase:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const formatted = (categories || []).map(mapCategoryFromDb);
    res.json(formatted);
  } catch (err) {
    console.error('GET /categories error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/categories/admin/all (Admin: All Categories)
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching admin categories from Supabase:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const formatted = (categories || []).map(mapCategoryFromDb);
    res.json(formatted);
  } catch (err) {
    console.error('GET /admin/categories error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/categories/admin/add (Admin: Add Category)
router.post('/admin/add', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, tagline, image, order } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const catId = `cat-${Date.now()}`;

    const newCat = {
      id: catId,
      name,
      slug,
      tagline: tagline || 'Exclusive Luxury Collection',
      enabled: true,
      display_order: Number(order) || 1,
      image: image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'
    };

    const { data, error } = await supabase
      .from('categories')
      .insert([newCat])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating category in Supabase:', error);
      return res.status(500).json({ error: 'Failed to create category' });
    }

    res.status(201).json({ message: 'Category created successfully', category: mapCategoryFromDb(data) });
  } catch (err) {
    console.error('POST /admin/categories error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/categories/admin/:id (Admin: Edit Category)
router.put('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const updates = {};
    if (body.name !== undefined) {
      updates.name = body.name;
      updates.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (body.tagline !== undefined) updates.tagline = body.tagline;
    if (body.image !== undefined) updates.image = body.image;
    if (body.order !== undefined || body.displayOrder !== undefined) {
      updates.display_order = Number(body.order ?? body.displayOrder);
    }
    if (body.enabled !== undefined) updates.enabled = body.enabled;

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Category not found or failed to update.' });
    }

    res.json({ message: 'Category updated successfully', category: mapCategoryFromDb(data) });
  } catch (err) {
    console.error('PUT /admin/categories/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/categories/admin/:id (Admin: Delete Category Safely)
router.delete('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .select('id');

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('DELETE /admin/categories/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
