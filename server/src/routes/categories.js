import express from 'express';
import { readDb, writeDb } from '../db.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/categories (Public Enabled Categories)
router.get('/', (req, res) => {
  const db = readDb();
  const activeCategories = db.categories
    .filter(c => c.enabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(activeCategories);
});

// GET /api/admin/categories (Admin: All Categories)
router.get('/admin/all', verifyToken, requireAdmin, (req, res) => {
  const db = readDb();
  res.json(db.categories);
});

// POST /api/admin/categories (Admin: Add Category)
router.post('/admin/add', verifyToken, requireAdmin, (req, res) => {
  const { name, tagline, image, order } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  const db = readDb();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCat = {
    id: `cat-${Date.now()}`,
    name,
    slug,
    tagline: tagline || 'Exclusive Luxury Collection',
    enabled: true,
    order: Number(order) || db.categories.length + 1,
    image: image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'
  };

  db.categories.push(newCat);
  writeDb(db);

  res.status(201).json({ message: 'Category created successfully', category: newCat });
});

// PUT /api/admin/categories/:id (Admin: Edit Category)
router.put('/admin/:id', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.categories.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Category not found.' });
  }

  db.categories[index] = {
    ...db.categories[index],
    ...req.body
  };

  writeDb(db);
  res.json({ message: 'Category updated successfully', category: db.categories[index] });
});

// DELETE /api/admin/categories/:id (Admin: Delete Category Safely)
router.delete('/admin/:id', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.categories = db.categories.filter(c => c.id !== id);
  writeDb(db);
  res.json({ message: 'Category deleted successfully' });
});

export default router;
