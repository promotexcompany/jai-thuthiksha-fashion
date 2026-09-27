import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

export const mapSettingsFromDb = (s) => {
  if (!s) return null;
  return {
    id: s.id,
    shopName: s.shop_name || 'Jai Thuthiksha Fashion',
    shopLogo: s.shop_logo || '/assets/logo.png',
    whatsappNumber: s.whatsapp_number || '8489166899',
    phoneDisplay: s.phone_display || '+91 84891 66899',
    shopAddress: s.shop_address || 'Karur Bypass road,Gandhiji Street,Sakthi Nagar,Erode,638002',
    city: s.city || 'Erode',
    state: s.state || 'Tamil Nadu',
    pincode: s.pincode || '638002',
    mapsUrl: s.maps_url || 'https://maps.google.com/?q=Karur+Bypass+road+Gandhiji+Street+Sakthi+Nagar+Erode',
    contactEmail: s.contact_email || 'sakthimurugesan1986@gmail.com',
    instagramLink: s.instagram_link || 'https://instagram.com/jaithuthikshafashion',
    heroTitle: s.hero_title || 'Wear the Luxury Designer You Love for Your Special Day.',
    heroSubtitle: s.hero_subtitle || 'Rent royal bridal lehengas, handwoven Kanjeevaram silk sarees, and groom sherwanis at accessible rental prices.',
    heroBanners: s.hero_banners || [],
    aboutHeading: s.about_heading || 'Redefining Luxury Indian Designer Wear for Every Celebration',
    aboutContent: s.about_content || 'Founded with a vision to make royal heritage bridal couture accessible, sustainable, and affordable.',
    termsInstructions: s.terms_instructions || 'Every rental includes complimentary custom alterations and sanitized delivery.',
    cancellationAdvanceInfo: s.cancellation_advance_info || '100% deposit refund for cancellations 7+ days prior to rental date.',
    trialTitle: s.trial_title || 'Boutique Trial & Fitting Session',
    trialDescription: s.trial_description || 'Visit Jai Thuthiksha Fashion for personalized styling & bridal trial fitting.',
    trialAvailabilityInfo: s.trial_availability_info || 'Monday - Saturday: 10:00 AM - 8:30 PM (All Days Open)',
    updatedAt: s.updated_at
  };
};

// GET /api/settings (Public Settings)
router.get('/', async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !settings) {
      // Fallback if settings row not created yet
      return res.json(mapSettingsFromDb({}));
    }

    res.json(mapSettingsFromDb(settings));
  } catch (err) {
    console.error('GET /settings error:', err);
    res.json(mapSettingsFromDb({}));
  }
});

// PUT /api/admin/settings (Admin: Update Website Content & Shop Info)
router.put('/admin/update', verifyToken, requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    const updates = {
      updated_at: new Date().toISOString()
    };

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
    if (body.trialTitle !== undefined) updates.trial_title = body.trialTitle;
    if (body.trialDescription !== undefined) updates.trial_description = body.trialDescription;
    if (body.trialAvailabilityInfo !== undefined) updates.trial_availability_info = body.trialAvailabilityInfo;

    const { data, error } = await supabase
      .from('settings')
      .upsert({ id: 1, ...updates })
      .select('*')
      .single();

    if (error) {
      console.error('Error updating settings in Supabase:', error);
      return res.status(500).json({ error: 'Failed to update settings.' });
    }

    res.json({ message: 'Website content & shop settings updated successfully', settings: mapSettingsFromDb(data) });
  } catch (err) {
    console.error('PUT /admin/settings error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
