import { readDb } from './db.js';
import { supabase } from './config/supabase.js';

const db = readDb();

const categories = db.categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    tagline: category.tagline,
    enabled: category.enabled,
    display_order: category.order,
    image: category.image
}));

const { error } = await supabase
    .from('categories')
    .upsert(categories);

if (error) {
    console.error('Category migration failed:', error);
    process.exit(1);
}

console.log(`Categories migrated successfully: ${categories.length}`);