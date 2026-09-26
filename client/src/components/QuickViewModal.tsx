import { useState } from 'react';
import { X, Star, Calendar, ShieldCheck, Sparkles, Heart, MessageSquare, User, Tag } from 'lucide-react';
import type { CategoryOffer, Product } from '../types/fashion';
import { calculateReturnDate, generateWhatsAppBookingUrl } from '../config/shopConfig';
import { api } from '../services/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { getCalculatedPrice } from '../utils/offerUtils';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  offers?: CategoryOffer[];
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  offers = [],
}) => {
  const { customerUser } = useCustomerAuth();

  if (!product) return null;

  const [customerName, setCustomerName] = useState(customerUser?.name || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [durationDays, setDurationDays] = useState<4 | 8>(4);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFavorite, setIsFavorite] = useState(false);

  const rawOriginalPrice = durationDays === 4 ? product.rentalPrice4Days : product.rentalPrice8Days;
  
  const priceInfo = getCalculatedPrice(
    rawOriginalPrice,
    product.categoryId || product.category,
    product.categoryLabel,
    offers
  );

  const returnDate = calculateReturnDate(startDate, durationDays);

  const handleBookViaWhatsApp = async () => {
    const finalCustomerName = customerName.trim() || customerUser?.name || 'WhatsApp Customer';

    // Log enquiry into backend bookings table
    await api.logEnquiry({
      customerName: finalCustomerName,
      customerPhone: 'Via WhatsApp',
      dressId: product.id,
      dressName: product.name,
      category: product.categoryLabel || product.category,
      startDate: startDate,
      returnDate: returnDate,
      durationDays: durationDays,
      rentalPrice: priceInfo.finalPrice
    });

    const whatsappUrl = generateWhatsAppBookingUrl({
      customerName: finalCustomerName,
      dressName: product.name,
      category: product.categoryLabel,
      rentalDate: startDate,
      returnDate: returnDate,
      selectedSize: selectedSize,
      durationDays: durationDays,
      originalPrice: priceInfo.hasOffer ? priceInfo.originalPrice : undefined,
      discountPercentage: priceInfo.hasOffer ? priceInfo.discountPercentage : undefined,
      rentalPrice: priceInfo.finalPrice,
    });

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-pink-100 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid md:grid-cols-2">
          
          {/* Product Media Column */}
          <div className="relative bg-gray-100 min-h-[380px] flex items-center justify-center overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-pink-900/90 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              {product.categoryLabel}
            </div>

            {priceInfo.hasOffer && (
              <div className="absolute top-4 right-14 bg-red-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                <Tag className="w-3.5 h-3.5" />
                <span>{priceInfo.discountPercentage}% OFF</span>
              </div>
            )}
            
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition ${
                isFavorite ? 'bg-pink-600 text-white' : 'bg-white/90 text-gray-700 hover:text-pink-600'
              }`}
            >
              <Heart className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Product Details & WhatsApp Booking */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-pink-700">
                  {product.designer}
                </span>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-gray-400 font-normal">({product.reviewCount} reviews)</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold font-serif text-gray-900 mt-1 leading-tight">
                {product.name}
              </h2>

              {/* Dynamic Price Display */}
              <div className="mt-3 p-3.5 rounded-xl bg-pink-50/70 border border-pink-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Rental Fee ({durationDays} Days)</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      {priceInfo.hasOffer ? (
                        <>
                          <span className="text-2xl font-extrabold text-pink-700">
                            ₹{priceInfo.finalPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-sm font-semibold text-gray-400 line-through">
                            ₹{priceInfo.originalPrice.toLocaleString('en-IN')}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-extrabold text-pink-700">
                          ₹{priceInfo.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {priceInfo.hasOffer && (
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-red-700 bg-red-100 px-2.5 py-1 rounded-full inline-block">
                        {priceInfo.discountPercentage}% OFF
                      </span>
                      {priceInfo.offerName && (
                        <span className="text-[10px] text-pink-800 font-medium block mt-1">
                          {priceInfo.offerName}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Name Optional Field */}
              <div className="mt-3 space-y-1">
                <label className="block text-xs font-bold text-gray-800 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-pink-600" />
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Radhika Sharma"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Rental Duration Switcher */}
              <div className="mt-3 space-y-2">
                <label className="block text-xs font-bold text-gray-800">Select Rental Period</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDurationDays(4)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center transition ${
                      durationDays === 4
                        ? 'border-pink-600 bg-pink-50 text-pink-900 shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>4 Days Rental</span>
                    <span className="text-pink-700 font-bold mt-0.5">
                      ₹{getCalculatedPrice(product.rentalPrice4Days, product.categoryId || product.category, product.categoryLabel, offers).finalPrice.toLocaleString('en-IN')}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationDays(8)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center transition ${
                      durationDays === 8
                        ? 'border-pink-600 bg-pink-50 text-pink-900 shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>8 Days Rental</span>
                    <span className="text-pink-700 font-bold mt-0.5">
                      ₹{getCalculatedPrice(product.rentalPrice8Days, product.categoryId || product.category, product.categoryLabel, offers).finalPrice.toLocaleString('en-IN')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Size Selector */}
              <div className="mt-3 space-y-2">
                <label className="block text-xs font-bold text-gray-800">Select Size</label>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition ${
                        selectedSize === size
                          ? 'bg-pink-700 text-white border-pink-700 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Date & Calculated Return Date */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-pink-600" />
                    Rental Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Return Date</label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-700">
                    {returnDate}
                  </div>
                </div>
              </div>

            </div>

            {/* Direct WhatsApp Action Button & Mandated Notice */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleBookViaWhatsApp}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>Book Rental on WhatsApp</span>
              </button>

              {/* Mandated Note */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-snug">
                <strong>Notice:</strong> Booking confirmation and payment details will be discussed directly with the shop owner on WhatsApp.
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Sanitized Delivery • Custom Tailored Alteration Included</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
