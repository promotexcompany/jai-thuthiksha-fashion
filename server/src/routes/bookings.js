import express from 'express';
import { readDb, writeDb } from '../db.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to check if rental dates overlap
const checkDateOverlap = (existingBookings, dressId, newStart, newReturn, ignoreBookingId = null) => {
  const start = new Date(newStart).getTime();
  const ret = new Date(newReturn).getTime();

  return existingBookings.some(b => {
    if (b.id === ignoreBookingId) return false;
    if (b.dressId !== dressId) return false;
    if (b.status === 'Cancelled' || b.status === 'Returned') return false;

    const bStart = new Date(b.startDate).getTime();
    const bReturn = new Date(b.returnDate).getTime();

    // Overlap condition: start <= bReturn && ret >= bStart
    return start <= bReturn && ret >= bStart;
  });
};

// POST /api/bookings/enquire (Public: Customer Logs WA Enquiry)
router.post('/enquire', (req, res) => {
  const { customerName, customerPhone, dressId, dressName, category, startDate, returnDate, durationDays, rentalPrice } = req.body;

  if (!dressId || !startDate || !returnDate) {
    return res.status(400).json({ error: 'Dress, start date, and return date are required.' });
  }

  const db = readDb();
  
  // Check for date overlap warning
  const hasOverlap = checkDateOverlap(db.bookings, dressId, startDate, returnDate);

  const newBooking = {
    id: `bkg-${Date.now()}`,
    customerName: customerName || 'WhatsApp Customer',
    customerPhone: customerPhone || 'Via WhatsApp',
    dressId,
    dressName: dressName || 'Designer Dress',
    category: category || 'General',
    startDate,
    returnDate,
    durationDays: durationDays || 4,
    rentalPrice: rentalPrice || 0,
    advancePaid: 0,
    status: 'Pending', // Pending | Confirmed | Ready for Pickup | Rented | Returned | Cancelled
    hasDateOverlapWarning: hasOverlap,
    internalNotes: hasOverlap ? 'WARNING: Date overlap detected with existing booking.' : 'Enquiry initialized via WhatsApp redirect.',
    createdAt: new Date().toISOString()
  };

  db.bookings.unshift(newBooking);
  writeDb(db);

  res.status(201).json({ message: 'Booking enquiry recorded', booking: newBooking, dateOverlap: hasOverlap });
});

// GET /api/admin/bookings (Admin: List & Search All Bookings)
router.get('/admin/all', verifyToken, requireAdmin, (req, res) => {
  const db = readDb();
  res.json(db.bookings);
});

// PATCH /api/admin/bookings/:id (Admin: Update Status & Internal Notes)
router.patch('/admin/:id', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, internalNotes, advancePaid, startDate, returnDate } = req.body;

  const db = readDb();
  const booking = db.bookings.find(b => b.id === id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (status) booking.status = status;
  if (internalNotes !== undefined) booking.internalNotes = internalNotes;
  if (advancePaid !== undefined) booking.advancePaid = Number(advancePaid);
  if (startDate) booking.startDate = startDate;
  if (returnDate) booking.returnDate = returnDate;

  // Re-verify overlap
  booking.hasDateOverlapWarning = checkDateOverlap(db.bookings, booking.dressId, booking.startDate, booking.returnDate, booking.id);

  writeDb(db);
  res.json({ message: 'Booking updated successfully', booking });
});

// DELETE /api/admin/bookings/:id (Admin: Delete Booking)
router.delete('/admin/:id', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.bookings = db.bookings.filter(b => b.id !== id);
  writeDb(db);
  res.json({ message: 'Booking deleted successfully' });
});

export default router;
