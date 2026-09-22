/**
 * JAI THUTHIKSHA FASHION - SHOP CONFIGURATION FILE
 * ================================================
 * Shop owners can easily change the WhatsApp number, shop address,
 * shop name, and admin login credentials in this file or via the .env file.
 */

export const SHOP_CONFIG = {
  /**
   * Shop Name displayed across the website & WhatsApp messages.
   */
  SHOP_NAME: import.meta.env.VITE_SHOP_NAME || 'Jai Thuthiksha Fashion',

  /**
   * SHOP WHATSAPP NUMBER for rental booking redirects.
   * IMPORTANT:
   * - Must include India country code (91) without '+' symbol, spaces, or hyphens.
   * - Example: '919876543210' (where 9876543210 is your 10-digit mobile number)
   * CHANGE THIS VALUE TO YOUR ACTUAL WHATSAPP NUMBER TO RECEIVE BOOKINGS.
   */
  SHOP_WHATSAPP_NUMBER: import.meta.env.VITE_SHOP_WHATSAPP_NUMBER || '919876543210',

  /**
   * Display Phone Number formatted for header and footer display.
   */
  SHOP_PHONE_DISPLAY: '+91 98765 43210',

  /**
   * Flagship Boutique Physical Address.
   */
  SHOP_ADDRESS: 'No. 42, Designer Avenue, Usman Road, T. Nagar, Chennai, Tamil Nadu 600017',

  /**
   * Default Admin Login Username (can be overridden in .env via VITE_ADMIN_USERNAME).
   */
  ADMIN_USERNAME: import.meta.env.VITE_ADMIN_USERNAME || 'admin@jaithuthiksha.com',

  /**
   * Default Admin Login Password (can be overridden in .env via VITE_ADMIN_PASSWORD).
   */
  ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD || 'Admin@JTF2026',
};

/**
 * Helper to compute return date based on rental start date & duration days.
 */
export const calculateReturnDate = (startDateStr: string, durationDays: number): string => {
  if (!startDateStr) return 'TBD';
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return 'TBD';
  const returnDate = new Date(start);
  returnDate.setDate(returnDate.getDate() + durationDays);
  return returnDate.toISOString().split('T')[0];
};

/**
 * Safely generates WhatsApp chat URL formatted as:
 * https://wa.me/COUNTRY_CODE_PHONE_NUMBER?text=ENCODED_MESSAGE
 */
export const generateWhatsAppBookingUrl = (params: {
  customerName?: string;
  dressName: string;
  category: string;
  rentalDate: string;
  returnDate: string;
  selectedSize?: string;
  durationDays?: number;
  rentalPrice?: number;
}): string => {
  const {
    customerName,
    dressName,
    category,
    rentalDate,
    returnDate,
    selectedSize,
    durationDays,
    rentalPrice,
  } = params;

  // Clean phone number: remove any non-digit characters
  const cleanPhone = SHOP_CONFIG.SHOP_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');

  // Message body formatted cleanly as requested
  let message = `Hello ${SHOP_CONFIG.SHOP_NAME},\nI am interested in booking:\n`;
  if (customerName && customerName.trim() !== '') {
    message += `Customer Name: ${customerName.trim()}\n`;
  }
  message += `Dress: ${dressName}\n`;
  message += `Category: ${category}\n`;
  if (selectedSize) {
    message += `Size: ${selectedSize}\n`;
  }
  if (durationDays) {
    message += `Rental Duration: ${durationDays} Days\n`;
  }
  message += `Rental Date: ${rentalDate}\n`;
  message += `Return Date: ${returnDate}\n`;
  if (rentalPrice) {
    message += `Estimated Rental Charge: ₹${rentalPrice.toLocaleString('en-IN')}\n`;
  }
  message += `\nPlease share availability, rental charges, advance amount, and booking details.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
