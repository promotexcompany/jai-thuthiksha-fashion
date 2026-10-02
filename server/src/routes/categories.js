import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

export const mapCategoryFromDb = (c) => {
  if (!c) return null;
  return {
    id: String(c.id),
    name: c.name || 'Category',
    slug: c.slug || String(c.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    tagline: c.tagline || 'Exclusive Luxury Collection',
    enabled: c.enabled !== false,
    order: Number(c.display_order) || 0,
    displayOrder: Number(c.display_order) || 0,
    image: c.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    createdAt: c.created_at
  };
};

// GET /api/categories (Public Enabled Categories)
router.get('/', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('enabled', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories from Supabase:', error);
      return res.status(500).json({ error: 'Database error fetching categories.' });
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
      return res.status(500).json({ error: 'Database error fetching categories.' });
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
      return res.status(500).json({ error: `Failed to create category: ${error.message}` });
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

    if (!id) {
      return res.status(400).json({ error: 'Category ID is required.' });
    }

    const name = body.name ? body.name.trim() : 'Category';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const updatePayload = {
      name,
      slug,
      tagline: body.tagline ? body.tagline.trim() : 'Exclusive Luxury Collection',
      image: body.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      display_order: Number(body.order ?? body.displayOrder ?? 1),
      enabled: body.enabled !== false
    };

    // Update or upsert if row is missing in DB
    const { data: updatedData, error: updateError } = await supabase
      .from('categories')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (updateError) {
      console.error('Error updating category in Supabase:', updateError);
      return res.status(500).json({ error: updateError.message });
    }

    if (updatedData) {
      return res.json({ message: 'Category updated successfully', category: mapCategoryFromDb(updatedData) });
    }

    // Upsert fallback
    const { data: upsertData, error: upsertError } = await supabase
      .from('categories')
      .upsert([{ id: String(id), ...updatePayload }])
      .select('*')
      .single();

    if (upsertError) {
      console.error('Error upserting category in Supabase:', upsertError);
      return res.status(500).json({ error: upsertError.message });
    }

    res.json({ message: 'Category updated successfully', category: mapCategoryFromDb(upsertData) });
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

    // 1. Fetch category details to get category name
    const { data: cat } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const catName = cat ? cat.name : '';

    // 2. Check if dresses are currently assigned to this category
    let dressesQuery = supabase.from('dresses').select('id, name').eq('category_id', id);
    const { data: assignedDresses } = await dressesQuery;

    if (assignedDresses && assignedDresses.length > 0) {
      const dressNames = assignedDresses.slice(0, 3).map(d => `"${d.name}"`).join(', ');
      const extraCount = assignedDresses.length > 3 ? ` and ${assignedDresses.length - 3} more` : '';
      return res.status(400).json({
        error: `Cannot delete category: ${assignedDresses.length} dress(es) (${dressNames}${extraCount}) are assigned to it. Please reassign or delete those dresses first.`
      });
    }

    // 3. Delete category from Supabase
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting category from Supabase:', deleteError);
      return res.status(500).json({ error: `Failed to delete category: ${deleteError.message}` });
    }

    res.json({ message: 'Category deleted successfully', id });
  } catch (err) {
    console.error('DELETE /admin/categories/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
