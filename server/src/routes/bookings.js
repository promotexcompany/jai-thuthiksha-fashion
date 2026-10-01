import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { readDb, writeDb } from '../db.js';

const router = express.Router();

export const mapBookingFromDb = (b) => {
  if (!b) return null;
  return {
    id: String(b.id),
    customerName: b.customer_name || b.customerName || 'WhatsApp Customer',
    customerPhone: b.customer_phone || b.customerPhone || 'Via WhatsApp',
    dressId: b.dress_id || b.dressId || '',
    dressName: b.dress_name || b.dressName || 'Designer Dress',
    category: b.category || 'General',
    startDate: b.start_date || b.startDate || '',
    returnDate: b.return_date || b.returnDate || '',
    durationDays: Number(b.duration_days || b.durationDays) || 4,
    rentalPrice: Number(b.rental_price || b.rentalPrice) || 0,
    status: b.status || 'Pending',
    internalNotes: b.internal_notes || b.internalNotes || '',
    createdAt: b.created_at || b.createdAt || new Date().toISOString()
  };
};

// Helper to check if rental dates overlap
const checkDateOverlap = async (dressId, newStart, newReturn, ignoreBookingId = null) => {
  try {
    const db = readDb();
    const bookings = db.bookings || [];
    const start = new Date(newStart).getTime();
    const ret = new Date(newReturn).getTime();

    return bookings.some(b => {
      const bDressId = b.dress_id || b.dressId;
      if (bDressId !== dressId) return false;
      if (b.id === ignoreBookingId) return false;
      if (b.status === 'Cancelled' || b.status === 'Returned') return false;

      const bStart = new Date(b.start_date || b.startDate).getTime();
      const bReturn = new Date(b.return_date || b.returnDate).getTime();

      return start <= bReturn && ret >= bStart;
    });
  } catch (err) {
    return false;
  }
};

// POST /api/bookings/enquire (Public: Customer Logs WA Enquiry)
router.post('/enquire', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      dressId,
      dressName,
      category,
      startDate,
      returnDate,
      durationDays,
      rentalPrice
    } = req.body;

    if (!dressId || !startDate || !returnDate) {
      return res.status(400).json({ error: 'Dress, start date, and return date are required.' });
    }

    const bookingId = `bkg-${Date.now()}`;
    const hasOverlap = await checkDateOverlap(dressId, startDate, returnDate);

    const newBookingRecord = {
      id: bookingId,
      customerName: customerName || 'WhatsApp Customer',
      customerPhone: customerPhone || 'Via WhatsApp',
      dressId: dressId,
      dressName: dressName || 'Designer Dress',
      category: category || 'General',
      startDate: startDate,
      returnDate: returnDate,
      durationDays: Number(durationDays) || 4,
      rentalPrice: Number(rentalPrice) || 0,
      status: 'Pending',
      internalNotes: hasOverlap
        ? 'WARNING: Date overlap detected with existing booking.'
        : 'Enquiry initialized via customer booking flow.',
      createdAt: new Date().toISOString()
    };

    // 1. File DB persistence
    const db = readDb();
    if (!db.bookings) db.bookings = [];
    db.bookings.unshift(newBookingRecord);
    writeDb(db);

    // 2. Supabase sync if available
    try {
      await supabase.from('bookings').insert([{
        id: bookingId,
        customer_name: newBookingRecord.customerName,
        customer_phone: newBookingRecord.customerPhone,
        dress_id: newBookingRecord.dressId,
        dress_name: newBookingRecord.dressName,
        category: newBookingRecord.category,
        start_date: newBookingRecord.startDate,
        return_date: newBookingRecord.returnDate,
        duration_days: newBookingRecord.durationDays,
        rental_price: newBookingRecord.rentalPrice,
        status: 'Pending',
        internal_notes: newBookingRecord.internalNotes,
        created_at: newBookingRecord.createdAt
      }]);
    } catch (e) {}

    res.status(201).json({
      message: 'Booking enquiry recorded successfully',
      booking: mapBookingFromDb(newBookingRecord),
      dateOverlap: hasOverlap
    });
  } catch (err) {
    console.error('POST /bookings/enquire error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/bookings/admin/all (Admin: List & Search All Bookings)
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && bookings && bookings.length > 0) {
        return res.json(bookings.map(mapBookingFromDb));
      }
    } catch (sbErr) {}

    const db = readDb();
    const bookings = (db.bookings || []).map(mapBookingFromDb);
    res.json(bookings);
  } catch (err) {
    console.error('GET /admin/bookings error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/bookings/admin/:id (Admin: Update Status & Internal Notes)
router.patch('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, internalNotes, startDate, returnDate, customerName, customerPhone } = req.body;

    const db = readDb();
    if (!db.bookings) db.bookings = [];
    const idx = db.bookings.findIndex(b => b.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (status !== undefined) db.bookings[idx].status = status;
    if (internalNotes !== undefined) db.bookings[idx].internalNotes = internalNotes;
    if (startDate !== undefined) db.bookings[idx].startDate = startDate;
    if (returnDate !== undefined) db.bookings[idx].returnDate = returnDate;
    if (customerName !== undefined) db.bookings[idx].customerName = customerName;
    if (customerPhone !== undefined) db.bookings[idx].customerPhone = customerPhone;

    writeDb(db);

    // Sync to Supabase
    try {
      const updates = {};
      if (status !== undefined) updates.status = status;
      if (internalNotes !== undefined) updates.internal_notes = internalNotes;
      if (startDate !== undefined) updates.start_date = startDate;
      if (returnDate !== undefined) updates.return_date = returnDate;
      if (customerName !== undefined) updates.customer_name = customerName;
      if (customerPhone !== undefined) updates.customer_phone = customerPhone;
      await supabase.from('bookings').update(updates).eq('id', id);
    } catch (e) {}

    res.json({ message: 'Booking updated successfully', booking: mapBookingFromDb(db.bookings[idx]) });
  } catch (err) {
    console.error('PATCH /admin/bookings/:id error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/bookings/admin/:id (Admin: Delete Booking)
router.delete('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = readDb();
    if (!db.bookings) db.bookings = [];

    db.bookings = db.bookings.filter(b => b.id !== id);
    writeDb(db);

    try {
      await supabase.from('bookings').delete().eq('id', id);
    } catch (e) {}

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('DELETE /admin/bookings/:id error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
