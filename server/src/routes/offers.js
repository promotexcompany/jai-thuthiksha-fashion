import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { readDb, writeDb } from '../db.js';

const router = express.Router();

export const mapOfferFromDb = (o) => {
  if (!o) return null;
  return {
    id: o.id,
    name: o.name,
    categoryId: o.category_id || o.categoryId,
    categoryName: o.category_name || o.categoryName,
    discountPercentage: Number(o.discount_percentage || o.discountPercentage) || 0,
    isActive: o.is_active !== undefined ? Boolean(o.is_active) : Boolean(o.isActive),
    createdAt: o.created_at || o.createdAt,
    updatedAt: o.updated_at || o.updatedAt,
  };
};

// GET /api/offers (Public: Fetch active category offers)
router.get('/', async (req, res) => {
  try {
    const { data: supabaseOffers, error } = await supabase
      .from('offers')
      .select('*')
      .eq('is_active', true);

    if (!error && supabaseOffers) {
      return res.json(supabaseOffers.map(mapOfferFromDb));
    }

    // File DB fallback
    const db = readDb();
    const activeOffers = (db.offers || [])
      .filter((o) => o.isActive)
      .map(mapOfferFromDb);
    return res.json(activeOffers);
  } catch (err) {
    console.error('GET /api/offers error, returning file DB:', err);
    const db = readDb();
    const activeOffers = (db.offers || [])
      .filter((o) => o.isActive)
      .map(mapOfferFromDb);
    return res.json(activeOffers);
  }
});

// GET /api/offers/admin/all (Admin: Fetch all offers)
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: supabaseOffers, error } = await supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && supabaseOffers) {
      return res.json(supabaseOffers.map(mapOfferFromDb));
    }

    const db = readDb();
    return res.json((db.offers || []).map(mapOfferFromDb));
  } catch (err) {
    console.error('GET /api/offers/admin/all error:', err);
    const db = readDb();
    return res.json((db.offers || []).map(mapOfferFromDb));
  }
});

// POST /api/offers/admin/add (Admin: Create new category offer)
router.post('/admin/add', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, categoryId, categoryName, discountPercentage, isActive } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Offer Name is required (minimum 2 characters).' });
    }

    if (!categoryId) {
      return res.status(400).json({ error: 'Category selection is required.' });
    }

    const discountNum = Number(discountPercentage);
    if (isNaN(discountNum) || discountNum < 1 || discountNum > 100) {
      return res.status(400).json({ error: 'Discount Percentage must be between 1% and 100%.' });
    }

    const offerIsActive = Boolean(isActive);

    // Check for existing active offer in the same category
    if (offerIsActive) {
      const db = readDb();
      let allOffers = [];

      try {
        const { data } = await supabase.from('offers').select('*');
        if (data) allOffers = data.map(mapOfferFromDb);
        else allOffers = (db.offers || []).map(mapOfferFromDb);
      } catch {
        allOffers = (db.offers || []).map(mapOfferFromDb);
      }

      const existingActive = allOffers.find(
        (o) => o.categoryId === categoryId && o.isActive
      );

      if (existingActive) {
        return res.status(400).json({
          error: `Category '${categoryName || categoryId}' already has an active offer ('${existingActive.name}' - ${existingActive.discountPercentage}% OFF). Please deactivate it first before activating a new offer for this category.`,
        });
      }
    }

    const newOffer = {
      id: `off-${Date.now()}`,
      name: name.trim(),
      categoryId: categoryId,
      categoryName: categoryName || 'Category',
      discountPercentage: discountNum,
      isActive: offerIsActive,
      createdAt: new Date().toISOString(),
    };

    // Try Supabase insert
    try {
      await supabase.from('offers').insert([
        {
          id: newOffer.id,
          name: newOffer.name,
          category_id: newOffer.categoryId,
          category_name: newOffer.categoryName,
          discount_percentage: newOffer.discountPercentage,
          is_active: newOffer.isActive,
          created_at: newOffer.createdAt,
        },
      ]);
    } catch (dbErr) {
      console.log('[Offers API] Supabase insert skipped, using file DB:', dbErr.message);
    }

    // Always update file DB for guaranteed local persistence
    const db = readDb();
    if (!db.offers) db.offers = [];
    db.offers.unshift(newOffer);
    writeDb(db);

    return res.json({ message: 'Offer created successfully', offer: newOffer });
  } catch (err) {
    console.error('POST /api/offers/admin/add error:', err);
    return res.status(500).json({ error: 'Failed to create offer.' });
  }
});

// PUT /api/offers/admin/:id (Admin: Edit offer)
router.put('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, categoryName, discountPercentage, isActive } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Offer Name is required.' });
    }

    const discountNum = Number(discountPercentage);
    if (isNaN(discountNum) || discountNum < 1 || discountNum > 100) {
      return res.status(400).json({ error: 'Discount Percentage must be between 1% and 100%.' });
    }

    const offerIsActive = Boolean(isActive);

    const db = readDb();
    let allOffers = (db.offers || []).map(mapOfferFromDb);

    try {
      const { data } = await supabase.from('offers').select('*');
      if (data && data.length > 0) allOffers = data.map(mapOfferFromDb);
    } catch (e) {
      // Use file DB
    }

    // Check duplicate active offer in category
    if (offerIsActive) {
      const existingActive = allOffers.find(
        (o) => o.id !== id && o.categoryId === categoryId && o.isActive
      );
      if (existingActive) {
        return res.status(400).json({
          error: `Category '${categoryName || categoryId}' already has another active offer ('${existingActive.name}' - ${existingActive.discountPercentage}% OFF). Deactivate it first.`,
        });
      }
    }

    const updatedOffer = {
      id,
      name: name.trim(),
      categoryId,
      categoryName: categoryName || 'Category',
      discountPercentage: discountNum,
      isActive: offerIsActive,
      updatedAt: new Date().toISOString(),
    };

    // Update Supabase if available
    try {
      await supabase
        .from('offers')
        .update({
          name: updatedOffer.name,
          category_id: updatedOffer.categoryId,
          category_name: updatedOffer.categoryName,
          discount_percentage: updatedOffer.discountPercentage,
          is_active: updatedOffer.isActive,
          updated_at: updatedOffer.updatedAt,
        })
        .eq('id', id);
    } catch (e) {
      console.log('[Offers API] Supabase update skipped');
    }

    // Update File DB
    if (!db.offers) db.offers = [];
    const idx = db.offers.findIndex((o) => o.id === id);
    if (idx !== -1) {
      db.offers[idx] = { ...db.offers[idx], ...updatedOffer };
    } else {
      db.offers.unshift(updatedOffer);
    }
    writeDb(db);

    return res.json({ message: 'Offer updated successfully', offer: updatedOffer });
  } catch (err) {
    console.error('PUT /api/offers/admin/:id error:', err);
    return res.status(500).json({ error: 'Failed to update offer.' });
  }
});

// PATCH /api/offers/admin/:id/toggle (Admin: Toggle Active Status)
router.patch('/admin/:id/toggle', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body || {};

    const db = readDb();
    if (!db.offers) db.offers = [];

    const existingIndex = db.offers.findIndex((o) => o.id === id);
    if (existingIndex === -1) {
      return res.status(404).json({ error: 'Offer not found.' });
    }

    const currentOffer = db.offers[existingIndex];
    const newIsActive = isActive !== undefined ? Boolean(isActive) : !currentOffer.isActive;

    // Check duplicate active offer in category if enabling
    if (newIsActive) {
      const activeDuplicate = db.offers.find(
        (o) => o.id !== id && o.categoryId === currentOffer.categoryId && o.isActive
      );
      if (activeDuplicate) {
        return res.status(400).json({
          error: `Category '${currentOffer.categoryName}' already has an active offer ('${activeDuplicate.name}'). Deactivate it first before activating this offer.`,
        });
      }
    }

    db.offers[existingIndex].isActive = newIsActive;
    db.offers[existingIndex].updatedAt = new Date().toISOString();
    writeDb(db);

    try {
      await supabase
        .from('offers')
        .update({ is_active: newIsActive, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (e) {
      // Fallback handled
    }

    return res.json({
      message: `Offer ${newIsActive ? 'activated' : 'deactivated'} successfully`,
      offer: mapOfferFromDb(db.offers[existingIndex]),
    });
  } catch (err) {
    console.error('PATCH /api/offers/admin/:id/toggle error:', err);
    return res.status(500).json({ error: 'Failed to toggle offer status.' });
  }
});

// DELETE /api/offers/admin/:id (Admin: Delete Offer)
router.delete('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = readDb();
    if (!db.offers) db.offers = [];

    db.offers = db.offers.filter((o) => o.id !== id);
    writeDb(db);

    try {
      await supabase.from('offers').delete().eq('id', id);
    } catch (e) {
      // Fallback
    }

    return res.json({ message: 'Offer deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/offers/admin/:id error:', err);
    return res.status(500).json({ error: 'Failed to delete offer.' });
  }
});

export default router;
