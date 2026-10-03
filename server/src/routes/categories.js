import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { readDb, writeDb } from '../db.js';

const router = express.Router();

export const mapCategoryFromDb = (c) => {
  if (!c) return null;
  const dispOrder = Number(c.display_order ?? c.displayOrder ?? c.order ?? 0);
  return {
    id: String(c.id),
    name: c.name || 'Category',
    slug: c.slug || String(c.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    tagline: c.tagline || 'Exclusive Luxury Collection',
    enabled: c.enabled !== false,
    order: dispOrder,
    displayOrder: dispOrder,
    image: c.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    createdAt: c.created_at || c.createdAt || new Date().toISOString()
  };
};

// GET /api/categories (Public Enabled Categories)
router.get('/', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Try Supabase first
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('enabled', true)
        .order('display_order', { ascending: true });

      if (!error && categories && categories.length > 0) {
        return res.json(categories.map(mapCategoryFromDb));
      }
    } catch (sbErr) {}

    // File DB fallback
    const db = readDb();
    const categories = (db.categories || [])
      .filter((c) => c.enabled !== false)
      .map(mapCategoryFromDb);

    res.json(categories);
  } catch (err) {
    console.error('GET /categories error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/categories/admin/all (Admin: All Categories)
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && categories && categories.length > 0) {
        return res.json(categories.map(mapCategoryFromDb));
      }
    } catch (sbErr) {}

    const db = readDb();
    const categories = (db.categories || []).map(mapCategoryFromDb);
    res.json(categories);
  } catch (err) {
    console.error('GET /admin/categories error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/categories/admin/add (Admin: Add Category)
router.post('/admin/add', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, tagline, image, order } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const catId = `cat-${Date.now()}`;

    const newCat = {
      id: catId,
      name: cleanName,
      slug,
      tagline: tagline ? tagline.trim() : 'Exclusive Luxury Collection',
      enabled: true,
      order: Number(order) || 1,
      image: image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'
    };

    // Save to File DB
    const db = readDb();
    if (!db.categories) db.categories = [];
    db.categories.push(newCat);
    writeDb(db);

    // Sync to Supabase if available
    try {
      const { error: sbErr } = await supabase.from('categories').insert([{
        id: catId,
        name: cleanName,
        slug,
        tagline: newCat.tagline,
        enabled: true,
        display_order: newCat.order,
        image: newCat.image
      }]);
      if (sbErr) console.error('[Categories API] Supabase insert error:', sbErr);
    } catch (e) {
      console.error('[Categories API] Supabase insert exception:', e);
    }

    res.status(201).json({ message: 'Category created successfully', category: mapCategoryFromDb(newCat) });
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

    if (!id) {
      return res.status(400).json({ error: 'Category ID is required.' });
    }

    const name = body.name ? body.name.trim() : 'Category';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const orderVal = Number(body.order ?? body.displayOrder ?? 1);

    const updatePayload = {
      id: String(id),
      name,
      slug,
      tagline: body.tagline ? body.tagline.trim() : 'Exclusive Luxury Collection',
      image: body.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      order: orderVal,
      enabled: body.enabled !== false
    };

    // Update File DB
    const db = readDb();
    if (!db.categories) db.categories = [];
    const idx = db.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      db.categories[idx] = { ...db.categories[idx], ...updatePayload };
    } else {
      db.categories.push(updatePayload);
    }
    writeDb(db);

    // Sync to Supabase if available
    try {
      const { error: sbErr } = await supabase.from('categories').upsert([{
        id: String(id),
        name,
        slug,
        tagline: updatePayload.tagline,
        image: updatePayload.image,
        display_order: orderVal,
        enabled: updatePayload.enabled
      }]);
      if (sbErr) console.error('[Categories API] Supabase upsert error:', sbErr);
    } catch (e) {
      console.error('[Categories API] Supabase upsert exception:', e);
    }

    res.json({ message: 'Category updated successfully', category: mapCategoryFromDb(updatePayload) });
  } catch (err) {
    console.error('PUT /admin/categories/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/categories/admin/:id (Admin: Delete Category Safely)
router.delete('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Category ID is required.' });
    }

    const db = readDb();
    const dresses = db.dresses || [];

    // Find target category name
    const cat = (db.categories || []).find(c => String(c.id) === String(id));
    const catNameLower = cat ? String(cat.name).toLowerCase() : '';

    // Check if dresses are currently assigned to this category in Supabase
    try {
      const { data: sbDresses } = await supabase
        .from('dresses')
        .select('id, name')
        .eq('category_id', id);
      if (sbDresses && sbDresses.length > 0) {
        const dressNames = sbDresses.slice(0, 3).map(d => `"${d.name}"`).join(', ');
        const extraCount = sbDresses.length > 3 ? ` and ${sbDresses.length - 3} more` : '';
        return res.status(400).json({
          error: `Cannot delete category: ${sbDresses.length} dress(es) (${dressNames}${extraCount}) are assigned to it. Please reassign or delete those dresses first.`
        });
      }
    } catch (sbErr) {}

    // Check if dresses are currently assigned to this category in File DB
    const assignedDresses = dresses.filter(d => {
      const cId = String(d.categoryId || d.category_id || d.category || '');
      const cLabel = String(d.categoryLabel || d.categoryName || d.category_name || '').toLowerCase();
      return cId === String(id) || (catNameLower && cLabel === catNameLower);
    });

    if (assignedDresses.length > 0) {
      const dressNames = assignedDresses.slice(0, 3).map(d => `"${d.name}"`).join(', ');
      const extraCount = assignedDresses.length > 3 ? ` and ${assignedDresses.length - 3} more` : '';
      return res.status(400).json({
        error: `Cannot delete category: ${assignedDresses.length} dress(es) (${dressNames}${extraCount}) are assigned to it. Please reassign or delete those dresses first.`
      });
    }

    // Delete from File DB
    db.categories = (db.categories || []).filter(c => c.id !== id);
    writeDb(db);

    // Sync to Supabase
    try {
      const { error: sbErr } = await supabase.from('categories').delete().eq('id', id);
      if (sbErr) console.error('[Categories API] Supabase delete error:', sbErr);
    } catch (e) {}

    res.json({ message: 'Category deleted successfully', id });
  } catch (err) {
    console.error('DELETE /admin/categories/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
