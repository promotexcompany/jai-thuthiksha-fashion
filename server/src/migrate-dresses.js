import { readDb } from './db.js';
import { supabase } from './config/supabase.js';

const db = readDb();

const dresses = db.dresses.map((dress) => ({
  id: dress.id,
  name: dress.name,
  category_id: dress.categoryId,
  category_name: dress.categoryName,
  designer: dress.designer,
  retail_price: dress.retailPrice,
  rental_price_4_days: dress.rentalPrice4Days,
  rental_price_8_days: dress.rentalPrice8Days,
  advance_amount: dress.advanceAmount,
  images: dress.images,
  primary_image: dress.primaryImage,
  description: dress.description,
  fabric: dress.fabric,
  work_type: dress.workType,
  sizes: dress.sizes,
  colors: dress.colors,
  rating: dress.rating,
  review_count: dress.reviewCount,
  occasion: dress.occasion,
  is_available: dress.isAvailable,
  is_hidden: dress.isHidden
}));

const { error } = await supabase
  .from('dresses')
  .upsert(dresses);

if (error) {
  console.error('Dress migration failed:', error);
  process.exit(1);
}

console.log(`Dresses migrated successfully: ${dresses.length}`);