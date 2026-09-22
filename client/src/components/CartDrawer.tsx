import { X, Trash2, Calendar, ShoppingBag, MessageSquare, Sparkles } from 'lucide-react';
import type { CartItem } from '../types/fashion';
import { calculateReturnDate, generateWhatsAppBookingUrl, SHOP_CONFIG } from '../config/shopConfig';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (index: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);

  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) return;

    if (cartItems.length === 1) {
      const item = cartItems[0];
      const returnDate = calculateReturnDate(item.startDate, item.durationDays);
      const url = generateWhatsAppBookingUrl({
        dressName: item.product.name,
        category: item.product.categoryLabel,
        rentalDate: item.startDate,
        returnDate: returnDate,
        selectedSize: item.selectedSize,
        durationDays: item.durationDays,
        rentalPrice: item.totalPrice,
      });
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Multiple items booking format
      const cleanPhone = SHOP_CONFIG.SHOP_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
      let message = `Hello ${SHOP_CONFIG.SHOP_NAME},\nI am interested in booking the following ${cartItems.length} outfit(s):\n\n`;

      cartItems.forEach((item, index) => {
        const returnDate = calculateReturnDate(item.startDate, item.durationDays);
        message += `Outfit ${index + 1}:\n`;
        message += `Dress: ${item.product.name}\n`;
        message += `Category: ${item.product.categoryLabel}\n`;
        message += `Size: ${item.selectedSize}\n`;
        message += `Rental Date: ${item.startDate}\n`;
        message += `Return Date: ${returnDate}\n`;
        message += `Estimated Rent: ₹${item.totalPrice.toLocaleString('en-IN')}\n\n`;
      });

      message += `Total Estimated Rent: ₹${subtotal.toLocaleString('en-IN')}\n`;
      message += `Please share availability, rental charges, advance amount, and booking details.`;

      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-pink-900 to-rose-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-amber-300" />
              <div>
                <h2 className="text-xl font-bold tracking-wide">Rental Bag</h2>
                <p className="text-xs text-pink-200">{cartItems.length} outfit(s) selected</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Banner */}
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Includes free steam sanitization & custom measurement fitting!</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 text-gray-500 space-y-4">
                <ShoppingBag className="w-16 h-16 mx-auto text-pink-200 animate-bounce" />
                <p className="text-lg font-medium text-gray-700">Your rental bag is empty</p>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Browse our designer collection and select your favorite outfits for your upcoming event.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-pink-700 text-white font-medium hover:bg-pink-800 transition"
                >
                  Explore Catalogue
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => {
                const returnDate = calculateReturnDate(item.startDate, item.durationDays);
                return (
                  <div 
                    key={idx} 
                    className="flex gap-4 p-4 rounded-xl border border-gray-100 shadow-sm bg-gray-50/50 hover:bg-white transition"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-24 object-cover rounded-lg shrink-0 border border-gray-200"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(idx)}
                            className="text-gray-400 hover:text-red-600 transition p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-pink-700 font-medium">{item.product.designer}</p>
                        
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-pink-100 text-pink-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                              Size: {item.selectedSize}
                            </span>
                            <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                              {item.durationDays} Days Rental
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-[11px] mt-1">
                            <Calendar className="w-3 h-3 text-pink-600" />
                            <span>Start: {item.startDate} | Return: {returnDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-2 pt-2 border-t border-gray-200/60">
                        <span className="text-xs text-gray-500">Rental Fee:</span>
                        <span className="text-base font-bold text-pink-700">
                          ₹{item.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer / Summary with WhatsApp Redirect */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custom Alterations</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Dry Cleaning & Delivery</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-pink-700 text-xl">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Mandated WhatsApp Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-snug">
                <strong>Notice:</strong> Booking confirmation and payment details will be discussed directly with the shop owner on WhatsApp.
              </div>

              <button
                onClick={handleWhatsAppCheckout}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>Book Rental via WhatsApp</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
