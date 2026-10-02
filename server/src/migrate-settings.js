import { readDb } from './db.js';
import { supabase } from './config/supabase.js';

const db = readDb();
const s = db.settings;

const settings = {
    id: 1,
    shop_name: s.shopName,
    shop_logo: s.shopLogo,
    whatsapp_number: s.whatsappNumber,
    phone_display: s.phoneDisplay,
    shop_address: s.shopAddress,
    contact_email: s.contactEmail,
    instagram_link: s.instagramLink,
    hero_title: s.heroTitle,
    hero_subtitle: s.heroSubtitle,
    hero_banners: s.heroBanners,
    about_heading: s.aboutHeading,
    about_content: s.aboutContent,
    terms_instructions: s.termsInstructions,
    cancellation_advance_info: s.cancellationAdvanceInfo
};

const { error } = await supabase
    .from('settings')
    .upsert(settings);

if (error) {
    console.error('Settings migration failed:', error);
    process.exit(1);
}

console.log('Settings migrated successfully');