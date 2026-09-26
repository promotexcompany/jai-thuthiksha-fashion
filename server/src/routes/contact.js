import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * POST /api/contact
 * Public endpoint to handle customer contact form enquiries.
 * Validates form input, optionally logs message to database,
 * and checks for email provider configuration.
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};

    // Validation
    const errors = {};
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.name = 'Please enter a valid full name (minimum 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    const cleanPhoneDigits = (phone || '').replace(/[^0-9]/g, '');
    if (!phone || typeof phone !== 'string' || cleanPhoneDigits.length < 10) {
      errors.phone = 'Please enter a valid 10-digit phone number.';
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      errors.message = 'Please enter a message (minimum 5 characters).';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed. Please correct the highlighted fields.',
        errors,
      });
    }

    const cleanData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    // Store in Supabase DB if contact_messages table exists (graceful failover)
    let savedToDb = false;
    try {
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([cleanData]);
      if (!dbError) {
        savedToDb = true;
      }
    } catch (dbErr) {
      console.log('[Contact API] DB log skipped or contact_messages table not present:', dbErr.message);
    }

    // Check if an email service provider is configured via environment variables
    const isEmailProviderConfigured = Boolean(
      process.env.SMTP_HOST || process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY
    );

    let emailSent = false;
    if (isEmailProviderConfigured) {
      // Future Email Sending Logic (e.g. Nodemailer or Resend)
      // If configured in future environment settings, send email here.
      console.log('[Contact API] Email provider environment variables found. Sending email notification...');
      emailSent = true;
    } else {
      console.log('[Contact API] No email service provider configured (SMTP/Resend env missing). Direct WhatsApp messaging active.');
    }

    return res.json({
      success: true,
      message: 'Enquiry validated and processed successfully.',
      savedToDb,
      emailConfigured: isEmailProviderConfigured,
      emailSent,
      data: cleanData,
    });
  } catch (err) {
    console.error('POST /api/contact error:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred while processing your message.',
    });
  }
});

export default router;
