import express from 'express';
import { readDb, writeDb } from '../db.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/settings (Public Settings)
router.get('/', (req, res) => {
  const db = readDb();
  res.json(db.settings || {});
});

// PUT /api/admin/settings (Admin: Update Website Content & Shop Info)
router.put('/admin/update', verifyToken, requireAdmin, (req, res) => {
  const db = readDb();
  db.settings = {
    ...db.settings,
    ...req.body
  };
  writeDb(db);
  res.json({ message: 'Website content & shop settings updated successfully', settings: db.settings });
});

export default router;
