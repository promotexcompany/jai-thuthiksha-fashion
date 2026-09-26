import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

export const mapBookingFromDb = (b) => {
  if (!b) return null;
  return {
    id: b.id,
    customerName: b.customer_name,
    customerPhone: b.customer_phone,
    dressId: b.dress_id,
    dressName: b.dress_name,
    category: b.category,
    startDate: b.start_date,
    returnDate: b.return_date,
    durationDays: b.duration_days,
    rentalPrice: Number(b.rental_price) || 0,
    status: b.status || 'Pending',
    internalNotes: b.internal_notes || '',
    createdAt: b.created_at
  };
};

// Helper to check if rental dates overlap
const checkDateOverlap = async (dressId, newStart, newReturn, ignoreBookingId = null) => {
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, dress_id, start_date, return_date, status')
    .eq('dress_id', dressId);

  if (!bookings) return false;

  const start = new Date(newStart).getTime();
  const ret = new Date(newReturn).getTime();

  return bookings.some(b => {
    if (b.id === ignoreBookingId) return false;
    if (b.status === 'Cancelled' || b.status === 'Returned') return false;

    const bStart = new Date(b.start_date).getTime();
    const bReturn = new Date(b.return_date).getTime();

    return start <= bReturn && ret >= bStart;
  });
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

    const newBooking = {
      id: bookingId,
      customer_name: customerName || 'WhatsApp Customer',
      customer_phone: customerPhone || 'Via WhatsApp',
      dress_id: dressId,
      dress_name: dressName || 'Designer Dress',
      category: category || 'General',
      start_date: startDate,
      return_date: returnDate,
      duration_days: Number(durationDays) || 4,
      rental_price: Number(rentalPrice) || 0,
      status: 'Pending',
      internal_notes: hasOverlap
        ? 'WARNING: Date overlap detected with existing booking.'
        : 'Enquiry initialized via customer booking flow.'
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert([newBooking])
      .select('*')
      .single();

    if (error) {
      console.error('Error recording booking enquiry in Supabase:', error);
      return res.status(500).json({ error: 'Failed to record booking enquiry.' });
    }

    res.status(201).json({
      message: 'Booking enquiry recorded successfully',
      booking: mapBookingFromDb(data),
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
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin bookings from Supabase:', error);
      return res.status(500).json({ error: 'Database error fetching bookings' });
    }

    const formatted = (bookings || []).map(mapBookingFromDb);
    res.json(formatted);
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

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (internalNotes !== undefined) updates.internal_notes = internalNotes;
    if (startDate !== undefined) updates.start_date = startDate;
    if (returnDate !== undefined) updates.return_date = returnDate;
    if (customerName !== undefined) updates.customer_name = customerName;
    if (customerPhone !== undefined) updates.customer_phone = customerPhone;

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.json({ message: 'Booking updated successfully', booking: mapBookingFromDb(data) });
  } catch (err) {
    console.error('PATCH /admin/bookings/:id error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/bookings/admin/:id (Admin: Delete Booking)
router.delete('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)
      .select('id');

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('DELETE /admin/bookings/:id error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
