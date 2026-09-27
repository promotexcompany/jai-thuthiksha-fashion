import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

export const mapDressFromDb = (d) => {
  if (!d) return null;
  const p = Number(d.rental_price_4_days) || Number(d.retail_price) || 0;
  return {
    id: String(d.id),
    name: d.name || 'Designer Outfit',
    price: p,
    rentalPrice4Days: p,
    retailPrice: p,
    rentalPrice8Days: Number(d.rental_price_8_days) || p,
    advanceAmount: Number(d.advance_amount) || 0,
    categoryId: d.category_id || 'cat-1',
    categoryName: d.category_name || 'Photoshoot',
    category: d.category_id || 'photoshoot',
    categoryLabel: d.category_name || 'Photoshoot',
    designer: d.designer || 'Jai Thuthiksha Couture',
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
      price,
      rentalPrice4Days,
      retailPrice,
      categoryId,
      categoryName,
      designer,
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

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Dress name is required.' });
    }

    const dressId = `jtf-${Date.now()}`;
    const allImages = Array.isArray(images) && images.length > 0 ? images : (primaryImage ? [primaryImage] : []);
    const primary = primaryImage || allImages[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800';
    if (allImages.length === 0) allImages.push(primary);

    const priceNum = Number(price ?? rentalPrice4Days ?? retailPrice ?? 0);

    const newDress = {
      id: dressId,
      name: name.trim(),
      category_id: categoryId || 'cat-1',
      category_name: categoryName || 'Photoshoot',
      designer: designer || 'Jai Thuthiksha Couture',
      retail_price: priceNum,
      rental_price_4_days: priceNum,
      rental_price_8_days: priceNum,
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
      is_hidden: isHidden === true
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

    const priceNum = Number(body.price ?? body.rentalPrice4Days ?? body.retailPrice ?? 0);

    const updatePayload = {
      id: String(id),
      name: body.name ? body.name.trim() : 'Designer Dress',
      category_id: body.categoryId || 'cat-1',
      category_name: body.categoryName || 'Photoshoot',
      designer: body.designer || 'Jai Thuthiksha Couture',
      retail_price: priceNum,
      rental_price_4_days: priceNum,
      rental_price_8_days: priceNum,
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
      is_hidden: body.isHidden === true
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

    // Upsert fallback
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

// PATCH /api/dresses/admin/:id/toggle (Admin: Toggle Status/Visibility)
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

// DELETE /api/dresses/admin/:id (Admin: Safe Dress Deletion Handling)
router.delete('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Dress ID is required.' });
    }

    // 1. Check if dress is referenced in bookings table
    const { data: bookingRefs, error: bkgErr } = await supabase
      .from('bookings')
      .select('id')
      .eq('dress_id', id);

    if (bkgErr) {
      console.warn('Booking reference check error:', bkgErr);
    }

    // 2. IF booking history exists: Hide dress instead of hard deleting
    if (bookingRefs && bookingRefs.length > 0) {
      const { data: hideData, error: hideError } = await supabase
        .from('dresses')
        .update({ is_hidden: true })
        .eq('id', id)
        .select('*')
        .maybeSingle();

      if (hideError) {
        console.error('Error hiding dress with bookings in Supabase:', hideError);
        return res.status(500).json({ error: `Failed to archive dress: ${hideError.message}` });
      }

      return res.json({
        message: 'Cannot permanently delete this dress because it has booking history. It has been hidden from the public catalogue instead.',
        isArchived: true,
        dress: mapDressFromDb(hideData || { id, is_hidden: true })
      });
    }

    // 3. IF NO booking history exists: Perform permanent deletion safely
    const { error: deleteError } = await supabase
      .from('dresses')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting dress from Supabase:', deleteError);
      return res.status(500).json({ error: `Failed to delete dress: ${deleteError.message}` });
    }

    res.json({ message: 'Dress deleted successfully', isDeleted: true, id });
  } catch (err) {
    console.error('DELETE /admin/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
