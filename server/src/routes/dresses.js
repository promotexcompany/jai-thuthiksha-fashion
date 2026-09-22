import express from 'express';
import { readDb, writeDb } from '../db.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/dresses (Public Catalogue)
router.get('/', (req, res) => {
  const db = readDb();
  const publicDresses = db.dresses.filter(d => !d.isHidden);
  res.json(publicDresses);
});

// GET /api/admin/dresses (Admin: All Dresses including Hidden)
router.get('/admin/all', verifyToken, requireAdmin, (req, res) => {
  const db = readDb();
  res.json(db.dresses);
});

// POST /api/admin/dresses (Admin: Add Dress)
router.post('/admin/add', verifyToken, requireAdmin, (req, res) => {
  const db = readDb();
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

  if (!name || !rentalPrice4Days) {
    return res.status(400).json({ error: 'Dress name and rental price are required.' });
  }

  const newDress = {
    id: `jtf-${Date.now()}`,
    name,
    categoryId: categoryId || 'cat-1',
    categoryName: categoryName || 'Bride Dresses',
    designer: designer || 'Jai Thuthiksha Couture',
    retailPrice: Number(retailPrice) || 50000,
    rentalPrice4Days: Number(rentalPrice4Days) || 3999,
    rentalPrice8Days: Number(rentalPrice8Days) || 6499,
    advanceAmount: Number(advanceAmount) || 1500,
    images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'],
    primaryImage: primaryImage || (images && images[0]) || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    description: description || 'Luxury designer dress for special occasions.',
    fabric: fabric || 'Silk & Embroidery',
    workType: workType || 'Hand Crafted',
    sizes: sizes || ['S', 'M', 'L'],
    colors: colors || ['Red'],
    rating: 5.0,
    reviewCount: 1,
    occasion: occasion || 'Wedding Day',
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    isHidden: isHidden !== undefined ? isHidden : false,
    createdAt: new Date().toISOString()
  };

  db.dresses.unshift(newDress);
  writeDb(db);

  res.status(201).json({ message: 'Dress created successfully', dress: newDress });
});

// PUT /api/admin/dresses/:id (Admin: Edit Dress)
router.put('/admin/:id', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.dresses.findIndex(d => d.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Dress not found.' });
  }

  db.dresses[index] = {
    ...db.dresses[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  writeDb(db);
  res.json({ message: 'Dress updated successfully', dress: db.dresses[index] });
});

// PATCH /api/admin/dresses/:id/toggle (Admin: Enable/Disable or Hide)
router.patch('/admin/:id/toggle', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { isAvailable, isHidden } = req.body;
  const db = readDb();
  const dress = db.dresses.find(d => d.id === id);

  if (!dress) {
    return res.status(404).json({ error: 'Dress not found.' });
  }

  if (isAvailable !== undefined) dress.isAvailable = isAvailable;
  if (isHidden !== undefined) dress.isHidden = isHidden;

  writeDb(db);
  res.json({ message: 'Dress status updated', dress });
});

// DELETE /api/admin/dresses/:id (Admin: Delete Dress)
router.delete('/admin/:id', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const initialLength = db.dresses.length;
  db.dresses = db.dresses.filter(d => d.id !== id);

  if (db.dresses.length === initialLength) {
    return res.status(404).json({ error: 'Dress not found.' });
  }

  writeDb(db);
  res.json({ message: 'Dress deleted successfully' });
});

export default router;
