import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

export const mapDressFromDb = (d) => {
  if (!d) return null;
  return {
    id: d.id,
    name: d.name,
    categoryId: d.category_id,
    categoryName: d.category_name,
    category: d.category_id || 'bridal',
    categoryLabel: d.category_name || 'Bridal Wear',
    designer: d.designer || 'Jai Thuthiksha Couture',
    retailPrice: Number(d.retail_price) || 0,
    rentalPrice4Days: Number(d.rental_price_4_days) || 0,
    rentalPrice8Days: Number(d.rental_price_8_days) || 0,
    advanceAmount: Number(d.advance_amount) || 0,
    images: d.images || [],
    image: d.primary_image || (d.images && d.images[0]) || '',
    primaryImage: d.primary_image || (d.images && d.images[0]) || '',
    galleryImages: d.images || [],
    description: d.description || '',
    fabric: d.fabric || '',
    workType: d.work_type || '',
    sizes: d.sizes || [],
    colors: d.colors || [],
    rating: Number(d.rating) || 5.0,
    reviewCount: Number(d.review_count) || 0,
    occasion: d.occasion || '',
    isAvailable: d.is_available !== false,
    isHidden: d.is_hidden === true,
    createdAt: d.created_at
  };
};

// GET /api/dresses (Public Catalogue)
router.get('/', async (req, res) => {
  try {
    const { data: dresses, error } = await supabase
      .from('dresses')
      .select('*')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public dresses from Supabase:', error);
      return res.status(500).json({ error: 'Database error fetching dresses' });
    }

    const formatted = (dresses || []).map(mapDressFromDb);
    res.json(formatted);
  } catch (err) {
    console.error('GET /dresses error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dresses/admin/all (Admin: All Dresses including Hidden)
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: dresses, error } = await supabase
      .from('dresses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin dresses from Supabase:', error);
      return res.status(500).json({ error: 'Database error fetching admin dresses' });
    }

    const formatted = (dresses || []).map(mapDressFromDb);
    res.json(formatted);
  } catch (err) {
    console.error('GET /admin/all dresses error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/dresses/admin/add (Admin: Add Dress)
router.post('/admin/add', verifyToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      categoryId,
      categoryName,
      designer,
      retailPrice,
      rentalPrice4Days,
      rentalPrice8Days,
      advanceAmount,
      images,
      primaryImage,
      description,
      fabric,
      workType,
      sizes,
      colors,
      occasion,
      isAvailable,
      isHidden
    } = req.body;

    if (!name || (!rentalPrice4Days && rentalPrice4Days !== 0)) {
      return res.status(400).json({ error: 'Dress name and rental price are required.' });
    }

    const dressId = `jtf-${Date.now()}`;
    const primary = primaryImage || (images && images[0]) || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800';
    const allImages = images && images.length > 0 ? images : [primary];

    const newDress = {
      id: dressId,
      name,
      category_id: categoryId || 'cat-1',
      category_name: categoryName || 'Bride Dresses',
      designer: designer || 'Jai Thuthiksha Couture',
      retail_price: Number(retailPrice) || 50000,
      rental_price_4_days: Number(rentalPrice4Days) || 3999,
      rental_price_8_days: Number(rentalPrice8Days) || 6499,
      advance_amount: Number(advanceAmount) || 1500,
      images: allImages,
      primary_image: primary,
      description: description || 'Luxury designer dress for special occasions.',
      fabric: fabric || 'Silk & Embroidery',
      work_type: workType || 'Hand Crafted',
      sizes: sizes || ['S', 'M', 'L'],
      colors: colors || ['Red'],
      rating: 5.0,
      review_count: 1,
      occasion: occasion || 'Wedding Day',
      is_available: isAvailable !== undefined ? isAvailable : true,
      is_hidden: isHidden !== undefined ? isHidden : false
    };

    const { data, error } = await supabase
      .from('dresses')
      .insert([newDress])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating dress in Supabase:', error);
      return res.status(500).json({ error: 'Failed to create dress in database' });
    }

    res.status(201).json({ message: 'Dress created successfully', dress: mapDressFromDb(data) });
  } catch (err) {
    console.error('POST /admin/add dress error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/dresses/admin/:id (Admin: Edit Dress)
router.put('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const updates = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.categoryId !== undefined) updates.category_id = body.categoryId;
    if (body.categoryName !== undefined) updates.category_name = body.categoryName;
    if (body.designer !== undefined) updates.designer = body.designer;
    if (body.retailPrice !== undefined) updates.retail_price = Number(body.retailPrice);
    if (body.rentalPrice4Days !== undefined) updates.rental_price_4_days = Number(body.rentalPrice4Days);
    if (body.rentalPrice8Days !== undefined) updates.rental_price_8_days = Number(body.rentalPrice8Days);
    if (body.advanceAmount !== undefined) updates.advance_amount = Number(body.advanceAmount);
    if (body.images !== undefined) updates.images = body.images;
    if (body.primaryImage !== undefined) updates.primary_image = body.primaryImage;
    if (body.description !== undefined) updates.description = body.description;
    if (body.fabric !== undefined) updates.fabric = body.fabric;
    if (body.workType !== undefined) updates.work_type = body.workType;
    if (body.sizes !== undefined) updates.sizes = body.sizes;
    if (body.colors !== undefined) updates.colors = body.colors;
    if (body.occasion !== undefined) updates.occasion = body.occasion;
    if (body.isAvailable !== undefined) updates.is_available = body.isAvailable;
    if (body.isHidden !== undefined) updates.is_hidden = body.isHidden;

    const { data, error } = await supabase
      .from('dresses')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      console.error('Error updating dress in Supabase:', error);
      return res.status(404).json({ error: 'Dress not found or failed to update.' });
    }

    res.json({ message: 'Dress updated successfully', dress: mapDressFromDb(data) });
  } catch (err) {
    console.error('PUT /admin/:id dress error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/dresses/admin/:id/toggle (Admin: Enable/Disable or Hide)
router.patch('/admin/:id/toggle', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable, isHidden } = req.body;

    const updates = {};
    if (isAvailable !== undefined) updates.is_available = isAvailable;
    if (isHidden !== undefined) updates.is_hidden = isHidden;

    const { data, error } = await supabase
      .from('dresses')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Dress not found.' });
    }

    res.json({ message: 'Dress status updated', dress: mapDressFromDb(data) });
  } catch (err) {
    console.error('PATCH /admin/:id/toggle error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/dresses/admin/:id (Admin: Delete Dress)
router.delete('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('dresses')
      .delete()
      .eq('id', id)
      .select('id');

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'Dress not found.' });
    }

    res.json({ message: 'Dress deleted successfully' });
  } catch (err) {
    console.error('DELETE /admin/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
