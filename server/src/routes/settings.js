import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { readDb, writeDb } from '../db.js';

const router = express.Router();

export const mapSettingsFromDb = (s) => {
  if (!s) return null;
  return {
    id: s.id || 1,
    shopName: s.shop_name || s.shopName || 'Jai Thuthiksha Fashion',
    shopLogo: s.shop_logo || s.shopLogo || '/assets/logo.png',
    whatsappNumber: s.whatsapp_number || s.whatsappNumber || '8489166899',
    phoneDisplay: s.phone_display || s.phoneDisplay || '+91 84891 66899',
    shopAddress: s.shop_address || s.shopAddress || 'Karur Bypass road,Gandhiji Street,Sakthi Nagar,Erode,638002',
    city: s.city || 'Erode',
    state: s.state || 'Tamil Nadu',
    pincode: s.pincode || '638002',
    mapsUrl: s.maps_url || s.mapsUrl || 'https://maps.google.com/?q=Karur+Bypass+road+Gandhiji+Street+Sakthi+Nagar+Erode',
    contactEmail: s.contact_email || s.contactEmail || 'sakthimurugesan1986@gmail.com',
    instagramLink: s.instagram_link || s.instagramLink || 'https://instagram.com/jaithuthikshafashion',
    heroTitle: s.hero_title || s.heroTitle || 'Wear the Luxury Designer You Love for Your Special Day.',
    heroSubtitle: s.hero_subtitle || s.heroSubtitle || 'Rent royal bridal lehengas, handwoven Kanjeevaram silk sarees, and groom sherwanis at accessible rental prices.',
    heroBanners: s.hero_banners || s.heroBanners || [],
    aboutHeading: s.about_heading || s.aboutHeading || 'Redefining Luxury Indian Designer Wear for Every Celebration',
    aboutContent: s.about_content || s.aboutContent || 'Founded with a vision to make royal heritage bridal couture accessible, sustainable, and affordable.',
    termsInstructions: s.terms_instructions || s.termsInstructions || 'Every rental includes complimentary custom alterations and sanitized delivery.',
    cancellationAdvanceInfo: s.cancellation_advance_info || s.cancellationAdvanceInfo || '100% deposit refund for cancellations 7+ days prior to rental date.',
    trialTitle: s.trial_title || s.trialTitle || 'Boutique Trial & Fitting Session',
    trialDescription: s.trial_description || s.trialDescription || 'Visit Jai Thuthiksha Fashion for personalized styling & bridal trial fitting.',
    trialAvailabilityInfo: s.trial_availability_info || s.trialAvailabilityInfo || 'Monday - Saturday: 10:00 AM - 8:30 PM (All Days Open)',
    updatedAt: s.updated_at || s.updatedAt || new Date().toISOString()
  };
};

// GET /api/settings (Public Settings)
router.get('/', async (req, res) => {
  try {
    try {
      const { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (!error && settings) {
        return res.json(mapSettingsFromDb(settings));
      }
    } catch (sbErr) {}

    const db = readDb();
    res.json(mapSettingsFromDb(db.settings || {}));
  } catch (err) {
    console.error('GET /settings error:', err);
    res.json(mapSettingsFromDb({}));
  }
});

// PUT /api/admin/settings (Admin: Update Website Content & Shop Info)
router.put('/admin/update', verifyToken, requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    const db = readDb();
    const currentSettings = db.settings || {};

    const updatedSettings = {
      ...currentSettings,
      ...body,
      updatedAt: new Date().toISOString()
    };

    db.settings = updatedSettings;
    writeDb(db);

    // Sync to Supabase if available
    try {
      const updates = { updated_at: updatedSettings.updatedAt };
      if (body.shopName !== undefined) updates.shop_name = body.shopName;
      if (body.shopLogo !== undefined) updates.shop_logo = body.shopLogo;
      if (body.whatsappNumber !== undefined) updates.whatsapp_number = body.whatsappNumber;
      if (body.phoneDisplay !== undefined) updates.phone_display = body.phoneDisplay;
      if (body.shopAddress !== undefined) updates.shop_address = body.shopAddress;
      if (body.city !== undefined) updates.city = body.city;
      if (body.state !== undefined) updates.state = body.state;
      if (body.pincode !== undefined) updates.pincode = body.pincode;
      if (body.mapsUrl !== undefined) updates.maps_url = body.mapsUrl;
      if (body.contactEmail !== undefined) updates.contact_email = body.contactEmail;
      if (body.instagramLink !== undefined) updates.instagram_link = body.instagramLink;
      if (body.heroTitle !== undefined) updates.hero_title = body.heroTitle;
      if (body.heroSubtitle !== undefined) updates.hero_subtitle = body.heroSubtitle;
      if (body.heroBanners !== undefined) updates.hero_banners = body.heroBanners;
      if (body.aboutHeading !== undefined) updates.about_heading = body.aboutHeading;
      if (body.aboutContent !== undefined) updates.about_content = body.aboutContent;
      if (body.termsInstructions !== undefined) updates.terms_instructions = body.termsInstructions;
      if (body.cancellationAdvanceInfo !== undefined) updates.cancellation_advance_info = body.cancellationAdvanceInfo;

      await supabase.from('settings').upsert({ id: 1, ...updates });
    } catch (e) {}

    res.json({ message: 'Website content & shop settings updated successfully', settings: mapSettingsFromDb(updatedSettings) });
  } catch (err) {
    console.error('PUT /admin/settings error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
