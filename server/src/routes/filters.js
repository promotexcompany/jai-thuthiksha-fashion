import express from 'express';
import { readDb, writeDb } from '../db.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/filters (Public Filters)
router.get('/', (req, res) => {
  const db = readDb();
  res.json(db.filters || {});
});

// PUT /api/admin/filters (Admin: Update Filters)
router.put('/admin/update', verifyToken, requireAdmin, (req, res) => {
  const db = readDb();
  db.filters = {
    ...db.filters,
    ...req.body
  };
  writeDb(db);
  res.json({ message: 'Filter options updated successfully', filters: db.filters });
});

export default router;
