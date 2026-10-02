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
  SHOP_WHATSAPP_NUMBER: import.meta.env.VITE_SHOP_WHATSAPP_NUMBER || '8489166899',

  /**
   * Display Phone Number formatted for header and footer display.
   */
  SHOP_PHONE_DISPLAY: '+91 8489166899',

  /**
   * Flagship Boutique Physical Address.
   */
  SHOP_ADDRESS: 'Karur Bypass road,Gandhiji Street,Sakthi Nagar,Erode,638002',

  /**
   * Shop Email Address.
   */
  SHOP_EMAIL: import.meta.env.VITE_SHOP_EMAIL || 'sakthimurugesan1986@gmail.com',

};

/**
 * Safely cleans and formats the WhatsApp phone number to ensure
 * Indian 10-digit mobile numbers are prepended with country code '91' for wa.me deep links.
 */
export const getCleanWhatsAppNumber = (phoneStr: string = SHOP_CONFIG.SHOP_WHATSAPP_NUMBER): string => {
  let cleaned = phoneStr.replace(/[^0-9]/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
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
 * Safely generates WhatsApp chat URL for general contact form enquiries formatted as:
 * https://wa.me/COUNTRY_CODE_PHONE_NUMBER?text=ENCODED_MESSAGE
 */
export const generateWhatsAppContactUrl = (params: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): string => {
  const cleanPhone = getCleanWhatsAppNumber();
  let text = `Hello ${SHOP_CONFIG.SHOP_NAME},\n`;
  text += `I have a general enquiry from your website:\n\n`;
  text += `Name: ${params.name.trim()}\n`;
  text += `Email: ${params.email.trim()}\n`;
  text += `Phone: ${params.phone.trim()}\n`;
  text += `Message:\n${params.message.trim()}\n`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
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
  originalPrice?: number;
  discountPercentage?: number;
  rentalPrice?: number;
  whatsappNumber?: string;
}): string => {
  const {
    customerName,
    dressName,
    category,
    rentalDate,
    returnDate,
    selectedSize,
    durationDays,
    originalPrice,
    discountPercentage,
    rentalPrice,
    whatsappNumber
  } = params;

  // Clean phone number: ensure country code 91 if 10 digits
  const cleanPhone = whatsappNumber ? getCleanWhatsAppNumber(whatsappNumber) : getCleanWhatsAppNumber();

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

  if (discountPercentage && discountPercentage > 0 && originalPrice) {
    message += `Original Rental Price: ₹${originalPrice.toLocaleString('en-IN')}\n`;
    message += `Offer: ${discountPercentage}% OFF\n`;
    message += `Final Rental Price: ₹${(rentalPrice || 0).toLocaleString('en-IN')}\n`;
  } else if (rentalPrice) {
    message += `Estimated Rental Charge: ₹${rentalPrice.toLocaleString('en-IN')}\n`;
  }

  message += `\nPlease share availability, rental charges, advance amount, and booking details.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
