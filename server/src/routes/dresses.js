import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { readDb, writeDb } from '../db.js';

const router = express.Router();

export const resolveValidCategoryId = async (submittedId, submittedName) => {
  let categories = [];
  try {
    const { data: sbCats, error } = await supabase.from('categories').select('*');
    if (!error && sbCats && sbCats.length > 0) {
      categories = sbCats;
    }
  } catch (e) {}

  if (categories.length === 0) {
    const db = readDb();
    categories = db.categories || [];
  }

  if (categories.length === 0) {
    return { categoryId: 'cat-1', categoryName: 'Photoshoot' };
  }

  // 1. Direct ID match
  const exactCat = categories.find(c => String(c.id) === String(submittedId));
  if (exactCat) {
    return { categoryId: String(exactCat.id), categoryName: exactCat.name };
  }

  // 2. Name or Slug match
  const cleanSubmittedId = String(submittedId || '').toLowerCase().replace(/^cat-/, '');
  const cleanSubmittedName = String(submittedName || '').toLowerCase();

  const matchedCat = categories.find(c => {
    const cName = String(c.name || '').toLowerCase();
    const cSlug = String(c.slug || '').toLowerCase();
    return cName === cleanSubmittedId || cSlug === cleanSubmittedId || (cleanSubmittedName && cName === cleanSubmittedName);
  });

  if (matchedCat) {
    return { categoryId: String(matchedCat.id), categoryName: matchedCat.name };
  }

  // 3. Fallback to first category
  return { categoryId: String(categories[0].id), categoryName: categories[0].name };
};

export const mapDressFromDb = (d) => {
  if (!d) return null;
  const p = Number(d.rental_price_4_days) || Number(d.rentalPrice4Days) || Number(d.retail_price) || Number(d.retailPrice) || Number(d.price) || 0;
  const catId = d.category_id || d.categoryId || 'cat-1';
  const catName = d.category_name || d.categoryName || 'Photoshoot';
  const imgs = Array.isArray(d.images) && d.images.length > 0 ? d.images : (d.primary_image || d.primaryImage ? [d.primary_image || d.primaryImage] : (d.image ? [d.image] : []));
  const primary = d.primary_image || d.primaryImage || d.image || imgs[0] || '';

  return {
    id: String(d.id),
    name: d.name || 'Designer Outfit',
    price: p,
    rentalPrice4Days: p,
    retailPrice: p,
    rentalPrice8Days: Number(d.rental_price_8_days) || Number(d.rentalPrice8Days) || p,
    advanceAmount: Number(d.advance_amount) || Number(d.advanceAmount) || 0,
    categoryId: catId,
    categoryName: catName,
    category: catId,
    categoryLabel: catName,
    designer: d.designer || 'Jai Thuthiksha Couture',
    images: imgs,
    image: primary,
    primaryImage: primary,
    galleryImages: imgs,
    description: d.description || '',
    fabric: d.fabric || '',
    workType: d.work_type || d.workType || '',
    sizes: Array.isArray(d.sizes) ? d.sizes : [],
    colors: Array.isArray(d.colors) ? d.colors : [],
    rating: Number(d.rating) || 5.0,
    reviewCount: Number(d.review_count) || Number(d.reviewCount) || 0,
    occasion: d.occasion || '',
    isAvailable: d.is_available !== undefined ? Boolean(d.is_available) : (d.isAvailable !== undefined ? Boolean(d.isAvailable) : true),
    isHidden: d.is_hidden !== undefined ? Boolean(d.is_hidden) : Boolean(d.isHidden),
    createdAt: d.created_at || d.createdAt || new Date().toISOString()
  };
};

// GET /api/dresses (Public Catalogue - Non Hidden)
router.get('/', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Try Supabase first
    try {
      const { data: supabaseDresses, error } = await supabase
        .from('dresses')
        .select('*')
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

      if (!error && supabaseDresses && supabaseDresses.length > 0) {
        return res.json(supabaseDresses.map(mapDressFromDb));
      }
    } catch (sbErr) {
      // Supabase unavailable
    }

    // File DB fallback
    const db = readDb();
    const dresses = (db.dresses || [])
      .filter((d) => !d.isHidden && d.is_hidden !== true)
      .map(mapDressFromDb);

    res.json(dresses);
  } catch (err) {
    console.error('GET /dresses error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dresses/admin/all (Admin: All Dresses including Hidden)
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    // Try Supabase
    try {
      const { data: supabaseDresses, error } = await supabase
        .from('dresses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && supabaseDresses && supabaseDresses.length > 0) {
        return res.json(supabaseDresses.map(mapDressFromDb));
      }
    } catch (sbErr) {
      // Supabase unavailable
    }

    // File DB fallback
    const db = readDb();
    const dresses = (db.dresses || []).map(mapDressFromDb);
    res.json(dresses);
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
      rentalPrice8Days,
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

    const { categoryId: validCatId, categoryName: validCatName } = await resolveValidCategoryId(categoryId, categoryName);

    const dressId = `jtf-${Date.now()}`;
    const allImages = Array.isArray(images) && images.length > 0 ? images : (primaryImage ? [primaryImage] : []);
    const primary = primaryImage || allImages[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800';
    if (allImages.length === 0) allImages.push(primary);

    const priceNum = Number(price ?? rentalPrice4Days ?? retailPrice ?? 0);
    const retailPriceNum = Number(retailPrice ?? priceNum);
    const rentalPrice4DaysNum = Number(rentalPrice4Days ?? priceNum);
    const rentalPrice8DaysNum = Number(rentalPrice8Days ?? priceNum);

    const newDressRecord = {
      id: dressId,
      name: name.trim(),
      categoryId: validCatId,
      categoryName: validCatName,
      designer: designer || 'Jai Thuthiksha Couture',
      retailPrice: retailPriceNum,
      rentalPrice4Days: rentalPrice4DaysNum,
      rentalPrice8Days: rentalPrice8DaysNum,
      advanceAmount: Number(advanceAmount) || 0,
      images: allImages,
      primaryImage: primary,
      description: description || 'Designer fashion dress',
      fabric: fabric || 'Premium Fabric',
      workType: workType || 'Handcraft',
      sizes: Array.isArray(sizes) ? sizes : (typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L']),
      colors: Array.isArray(colors) ? colors : (typeof colors === 'string' ? colors.split(',').map(c => c.trim()) : ['Multi']),
      rating: 5.0,
      reviewCount: 1,
      occasion: occasion || validCatName,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      isHidden: isHidden === true,
      createdAt: new Date().toISOString()
    };

    // 1. Guaranteed File DB write
    const db = readDb();
    if (!db.dresses) db.dresses = [];
    db.dresses.unshift(newDressRecord);
    writeDb(db);

    // 2. Supabase sync with explicit error handling
    try {
      const { data: sbData, error: sbErr } = await supabase.from('dresses').insert([{
        id: dressId,
        name: newDressRecord.name,
        category_id: validCatId,
        category_name: validCatName,
        designer: newDressRecord.designer,
        retail_price: newDressRecord.retailPrice,
        rental_price_4_days: newDressRecord.rentalPrice4Days,
        rental_price_8_days: newDressRecord.rentalPrice8Days,
        advance_amount: newDressRecord.advanceAmount,
        images: newDressRecord.images,
        primary_image: newDressRecord.primaryImage,
        description: newDressRecord.description,
        fabric: newDressRecord.fabric,
        work_type: newDressRecord.workType,
        sizes: newDressRecord.sizes,
        colors: newDressRecord.colors,
        rating: 5.0,
        review_count: 1,
        occasion: newDressRecord.occasion,
        is_available: newDressRecord.isAvailable,
        is_hidden: newDressRecord.isHidden,
        created_at: newDressRecord.createdAt
      }]).select();

      if (sbErr) {
        console.error('[Dresses API] Supabase insert error:', sbErr);
      } else {
        console.log('[Dresses API] Supabase insert successful for dress:', dressId);
      }
    } catch (sbErr) {
      console.error('[Dresses API] Supabase insert exception:', sbErr);
    }

    res.status(201).json({ message: 'Dress created successfully', dress: mapDressFromDb(newDressRecord) });
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

    const db = readDb();
    if (!db.dresses) db.dresses = [];
    const existingIndex = db.dresses.findIndex(d => d.id === id);
    const existingDress = existingIndex !== -1 ? db.dresses[existingIndex] : {};

    const { categoryId: validCatId, categoryName: validCatName } = await resolveValidCategoryId(
      body.categoryId || existingDress.categoryId || body.category,
      body.categoryName || existingDress.categoryName || body.categoryLabel
    );

    const allImages = Array.isArray(body.images) && body.images.length > 0
      ? body.images
      : (body.primaryImage ? [body.primaryImage] : (existingDress.images || []));
    const primary = body.primaryImage || allImages[0] || existingDress.primaryImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800';
    if (allImages.length === 0) allImages.push(primary);

    const priceNum = Number(body.price ?? body.rentalPrice4Days ?? body.retailPrice ?? existingDress.rentalPrice4Days ?? 0);
    const retailPriceNum = Number(body.retailPrice ?? priceNum);
    const rentalPrice4DaysNum = Number(body.rentalPrice4Days ?? priceNum);
    const rentalPrice8DaysNum = Number(body.rentalPrice8Days ?? priceNum);

    const updatedFields = {
      ...existingDress,
      id: String(id),
      name: body.name ? body.name.trim() : (existingDress.name || 'Designer Dress'),
      categoryId: validCatId,
      categoryName: validCatName,
      designer: body.designer || existingDress.designer || 'Jai Thuthiksha Couture',
      retailPrice: retailPriceNum,
      rentalPrice4Days: rentalPrice4DaysNum,
      rentalPrice8Days: rentalPrice8DaysNum,
      advanceAmount: body.advanceAmount !== undefined ? Number(body.advanceAmount) : (existingDress.advanceAmount || 0),
      images: allImages,
      primaryImage: primary,
      description: body.description || existingDress.description || 'Designer fashion dress',
      fabric: body.fabric || existingDress.fabric || 'Premium Fabric',
      workType: body.workType || existingDress.workType || 'Handcraft',
      sizes: Array.isArray(body.sizes) ? body.sizes : (typeof body.sizes === 'string' ? body.sizes.split(',').map(s => s.trim()) : (existingDress.sizes || ['S', 'M', 'L'])),
      colors: Array.isArray(body.colors) ? body.colors : (typeof body.colors === 'string' ? body.colors.split(',').map(c => c.trim()) : (existingDress.colors || ['Multi'])),
      occasion: body.occasion || existingDress.occasion || validCatName,
      isAvailable: body.isAvailable !== undefined ? Boolean(body.isAvailable) : (existingDress.isAvailable !== undefined ? Boolean(existingDress.isAvailable) : true),
      isHidden: body.isHidden !== undefined ? Boolean(body.isHidden) : Boolean(existingDress.isHidden)
    };

    if (existingIndex !== -1) {
      db.dresses[existingIndex] = updatedFields;
    } else {
      db.dresses.unshift(updatedFields);
    }
    writeDb(db);

    // Sync to Supabase with explicit error handling
    try {
      const { data: sbData, error: sbErr } = await supabase.from('dresses').upsert([{
        id: String(id),
        name: updatedFields.name,
        category_id: validCatId,
        category_name: validCatName,
        designer: updatedFields.designer,
        retail_price: updatedFields.retailPrice,
        rental_price_4_days: updatedFields.rentalPrice4Days,
        rental_price_8_days: updatedFields.rentalPrice8Days,
        advance_amount: updatedFields.advanceAmount,
        images: updatedFields.images,
        primary_image: updatedFields.primaryImage,
        description: updatedFields.description,
        fabric: updatedFields.fabric,
        work_type: updatedFields.workType,
        sizes: updatedFields.sizes,
        colors: updatedFields.colors,
        occasion: updatedFields.occasion,
        is_available: updatedFields.isAvailable,
        is_hidden: updatedFields.isHidden
      }]).select();

      if (sbErr) {
        console.error('[Dresses API] Supabase upsert error:', sbErr);
      } else {
        console.log('[Dresses API] Supabase upsert successful for dress:', id);
      }
    } catch (sbErr) {
      console.error('[Dresses API] Supabase update exception:', sbErr);
    }

    res.json({ message: 'Dress updated successfully', dress: mapDressFromDb(updatedFields) });
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

    const db = readDb();
    if (!db.dresses) db.dresses = [];
    const idx = db.dresses.findIndex(d => d.id === id);

    let updatedRecord = { id };
    if (idx !== -1) {
      if (isAvailable !== undefined) db.dresses[idx].isAvailable = Boolean(isAvailable);
      if (isHidden !== undefined) db.dresses[idx].isHidden = Boolean(isHidden);
      updatedRecord = db.dresses[idx];
      writeDb(db);
    }

    // Sync to Supabase with error logging
    try {
      const updates = {};
      if (isAvailable !== undefined) updates.is_available = Boolean(isAvailable);
      if (isHidden !== undefined) updates.is_hidden = Boolean(isHidden);

      const { error: sbErr } = await supabase.from('dresses').update(updates).eq('id', id);
      if (sbErr) {
        console.error('[Dresses API] Supabase toggle update error:', sbErr);
      }
    } catch (sbErr) {
      console.error('[Dresses API] Supabase toggle update exception:', sbErr);
    }

    res.json({ message: 'Dress status updated', dress: mapDressFromDb(updatedRecord) });
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

    const db = readDb();
    if (!db.dresses) db.dresses = [];
    const bookings = db.bookings || [];

    // Check if bookings reference this dress
    const hasBookingHistory = bookings.some(b => b.dressId === id || b.dress_id === id);

    if (hasBookingHistory) {
      // Hide dress instead of deleting
      const idx = db.dresses.findIndex(d => d.id === id);
      if (idx !== -1) {
        db.dresses[idx].isHidden = true;
        writeDb(db);
      }
      try {
        const { error: sbErr } = await supabase.from('dresses').update({ is_hidden: true }).eq('id', id);
        if (sbErr) console.error('[Dresses API] Supabase hide update error:', sbErr);
      } catch (e) {}

      return res.json({
        message: 'Cannot permanently delete this dress because it has booking history. It has been hidden from the public catalogue instead.',
        isArchived: true,
        dress: mapDressFromDb(db.dresses[idx] || { id, isHidden: true })
      });
    }

    // Perform permanent deletion
    db.dresses = db.dresses.filter(d => d.id !== id);
    writeDb(db);

    try {
      const { error: sbErr } = await supabase.from('dresses').delete().eq('id', id);
      if (sbErr) {
        console.error('[Dresses API] Supabase delete error:', sbErr);
      } else {
        console.log('[Dresses API] Supabase dress deleted successfully:', id);
      }
    } catch (e) {
      console.error('[Dresses API] Supabase delete exception:', e);
    }

    res.json({ message: 'Dress deleted successfully', isDeleted: true, id });
  } catch (err) {
    console.error('DELETE /admin/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
