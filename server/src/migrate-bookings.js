import { readDb } from './db.js';
import { supabase } from './config/supabase.js';

const db = readDb();

const bookings = db.bookings.map((booking) => ({
  id: booking.id,
  customer_name: booking.customerName,
  customer_phone: booking.customerPhone,
  dress_id: booking.dressId,
  dress_name: booking.dressName,
  category: booking.category,
  start_date: booking.startDate,
  return_date: booking.returnDate,
  duration_days: booking.durationDays,
  rental_price: booking.rentalPrice,
  status: booking.status,
  internal_notes: booking.internalNotes
}));

const { error } = await supabase
  .from('bookings')
  .upsert(bookings);

if (error) {
  console.error('Booking migration failed:', error);
  process.exit(1);
}

console.log(`Bookings migrated successfully: ${bookings.length}`);