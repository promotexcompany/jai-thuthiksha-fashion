import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

export const mapDressFromDb = (d) => {
  if (!d) return null;
  return {
    id: String(d.id),
    name: d.name || 'Designer Outfit',
    categoryId: d.category_id || 'cat-1',
    categoryName: d.category_name || 'Photoshoot',
    category: d.category_id || 'photoshoot',
    categoryLabel: d.category_name || 'Photoshoot',
    designer: d.designer || 'Jai Thuthiksha Couture',
    retailPrice: Number(d.retail_price) || 0,
    rentalPrice4Days: Number(d.rental_price_4_days) || 0,
    rentalPrice8Days: Number(d.rental_price_8_days) || 0,
    advanceAmount: Number(d.advance_amount) || 0,
    images: Array.isArray(d.images) && d.images.length > 0 ? d.images : (d.primary_image ? [d.primary_image] : []),
    image: d.primary_image || (Array.isArray(d.images) && d.images[0]) || '',
    primaryImage: d.primary_image || (Array.isArray(d.images) && d.images[0]) || '',
    galleryImages: Array.isArray(d.images) && d.images.length > 0 ? d.images : (d.primary_image ? [d.primary_image] : []),
    description: d.description || '',
    fabric: d.fabric || '',
    workType: d.work_type || '',
    sizes: Array.isArray(d.sizes) ? d.sizes : [],
    colors: Array.isArray(d.colors) ? d.colors : [],
    rating: Number(d.rating) || 5.0,
    reviewCount: Number(d.review_count) || 0,
    occasion: d.occasion || '',
    isAvailable: d.is_available !== false,
    isHidden: d.is_hidden === true,
    isTrending: d.is_trending === true,
    isNewArrival: d.is_new_arrival === true,
    showOnHomepage: d.show_on_homepage !== false,
    displayOrder: Number(d.display_order) || 0,
    createdAt: d.created_at
  };
};

// GET /api/dresses (Public Catalogue - Non Hidden)
router.get('/', async (req, res) => {
  try {
    const { data: dresses, error } = await supabase
      .from('dresses')
      .select('*')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public dresses from Supabase:', error);
      return res.status(500).json({ error: 'Database error fetching dresses.' });
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
      return res.status(500).json({ error: 'Database error fetching admin dresses.' });
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
      isHidden,
      isTrending,
      isNewArrival,
      showOnHomepage,
      displayOrder
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Dress name is required.' });
    }

    const dressId = `jtf-${Date.now()}`;
    const allImages = Array.isArray(images) && images.length > 0 ? images : (primaryImage ? [primaryImage] : []);
    const primary = primaryImage || allImages[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800';
    if (allImages.length === 0) allImages.push(primary);

    const newDress = {
      id: dressId,
      name: name.trim(),
      category_id: categoryId || 'cat-1',
      category_name: categoryName || 'Photoshoot',
      designer: designer || 'Jai Thuthiksha Couture',
      retail_price: Number(retailPrice) || 1,
      rental_price_4_days: Number(rentalPrice4Days) || 1,
      rental_price_8_days: Number(rentalPrice8Days) || 1,
      advance_amount: Number(advanceAmount) || 0,
      images: allImages,
      primary_image: primary,
      description: description || 'Designer fashion dress',
      fabric: fabric || 'Premium Fabric',
      work_type: workType || 'Handcraft',
      sizes: Array.isArray(sizes) ? sizes : ['S', 'M', 'L'],
      colors: Array.isArray(colors) ? colors : ['Multi'],
      rating: 5.0,
      review_count: 1,
      occasion: occasion || 'Special Occasion',
      is_available: isAvailable !== undefined ? isAvailable : true,
      is_hidden: isHidden === true,
      is_trending: isTrending === true,
      is_new_arrival: isNewArrival === true,
      show_on_homepage: showOnHomepage !== false,
      display_order: Number(displayOrder) || 0
    };

    const { data, error } = await supabase
      .from('dresses')
      .insert([newDress])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating dress in Supabase:', error);
      return res.status(500).json({ error: `Database error: ${error.message || 'Failed to create dress'}` });
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

    if (!id) {
      return res.status(400).json({ error: 'Dress ID is required.' });
    }

    const allImages = Array.isArray(body.images) ? body.images : (body.primaryImage ? [body.primaryImage] : []);
    const primary = body.primaryImage || allImages[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800';
    if (allImages.length === 0) allImages.push(primary);

    const updatePayload = {
      id: String(id),
      name: body.name ? body.name.trim() : 'Designer Dress',
      category_id: body.categoryId || 'cat-1',
      category_name: body.categoryName || 'Photoshoot',
      designer: body.designer || 'Jai Thuthiksha Couture',
      retail_price: Number(body.retailPrice) || 1,
      rental_price_4_days: Number(body.rentalPrice4Days) || 1,
      rental_price_8_days: Number(body.rentalPrice8Days) || 1,
      advance_amount: Number(body.advanceAmount) || 0,
      images: allImages,
      primary_image: primary,
      description: body.description || 'Designer fashion dress',
      fabric: body.fabric || 'Premium Fabric',
      work_type: body.workType || 'Handcraft',
      sizes: Array.isArray(body.sizes) ? body.sizes : ['S', 'M', 'L'],
      colors: Array.isArray(body.colors) ? body.colors : ['Multi'],
      occasion: body.occasion || 'Special Occasion',
      is_available: body.isAvailable !== undefined ? body.isAvailable : true,
      is_hidden: body.isHidden === true,
      is_trending: body.isTrending === true,
      is_new_arrival: body.isNewArrival === true,
      show_on_homepage: body.showOnHomepage !== false,
      display_order: Number(body.displayOrder) || 0
    };

    // Try update first
    const { data: updatedData, error: updateError } = await supabase
      .from('dresses')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (updateError) {
      console.error('Error updating dress in Supabase:', updateError);
      return res.status(500).json({ error: `Database update error: ${updateError.message}` });
    }

    if (updatedData) {
      return res.json({ message: 'Dress updated successfully', dress: mapDressFromDb(updatedData) });
    }

    // If update returned null (row was not found in Supabase), perform upsert
    const { data: upsertData, error: upsertError } = await supabase
      .from('dresses')
      .upsert([updatePayload])
      .select('*')
      .single();

    if (upsertError) {
      console.error('Error upserting dress in Supabase:', upsertError);
      return res.status(500).json({ error: `Database upsert error: ${upsertError.message}` });
    }

    res.json({ message: 'Dress updated successfully', dress: mapDressFromDb(upsertData) });
  } catch (err) {
    console.error('PUT /admin/:id dress error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// PATCH /api/dresses/admin/:id/toggle (Admin: Toggle Status)
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
      .maybeSingle();

    if (error) {
      console.error('Error toggling dress status in Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Dress status updated', dress: mapDressFromDb(data || { id, is_hidden: isHidden }) });
  } catch (err) {
    console.error('PATCH /admin/:id/toggle error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/dresses/admin/:id (Admin: Delete Dress)
router.delete('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Dress ID is required.' });
    }

    const { error } = await supabase
      .from('dresses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dress from Supabase:', error);
      return res.status(500).json({ error: `Failed to delete dress: ${error.message}` });
    }

    res.json({ message: 'Dress deleted successfully', id });
  } catch (err) {
    console.error('DELETE /admin/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
