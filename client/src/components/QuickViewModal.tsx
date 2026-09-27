import { useState, useMemo } from 'react';
import { X, Star, Calendar, ShieldCheck, Sparkles, Heart, MessageSquare, User, Tag, ZoomIn, Info } from 'lucide-react';
import type { CategoryOffer, Product } from '../types/fashion';
import { calculateReturnDate, generateWhatsAppBookingUrl } from '../config/shopConfig';
import { api } from '../services/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { getCalculatedPrice } from '../utils/offerUtils';
import { ImageLightboxModal } from './ImageLightboxModal';

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

  // Multi-image management
  const allImages = useMemo(() => {
    const list = [
      product.primaryImage,
      product.image,
      ...(product.galleryImages || []),
      ...(product.images || [])
    ].filter(Boolean) as string[];

    // Remove duplicate image URLs
    return Array.from(new Set(list));
  }, [product]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const currentMainImage = allImages[selectedImageIndex] || product.image;

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
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
        <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-pink-100 my-4 sm:my-8 max-h-[92vh] flex flex-col">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition shadow-md"
            title="Close details"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Scrollable Container */}
          <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-12">
              
              {/* Product Media Column */}
              <div className="md:col-span-5 bg-gray-50 p-4 sm:p-6 flex flex-col justify-between items-center border-b md:border-b-0 md:border-r border-gray-100">
                
                {/* Main Image Preview & Zoom Trigger */}
                <div
                  className="relative w-full h-72 sm:h-96 md:h-[380px] rounded-2xl overflow-hidden bg-white shadow-sm group cursor-pointer border border-pink-100/60 flex items-center justify-center"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    src={currentMainImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-pink-900/90 backdrop-blur-md text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    {product.categoryLabel}
                  </div>

                  {/* Discount Offer Badge */}
                  {priceInfo.hasOffer && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{priceInfo.discountPercentage}% OFF</span>
                    </div>
                  )}

                  {/* Zoom Hint Overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-md text-pink-950 text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <ZoomIn className="w-4 h-4 text-pink-700" />
                      <span>Click to Enlarge & Zoom</span>
                    </div>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFavorite(!isFavorite);
                    }}
                    className={`absolute bottom-3 right-3 p-2.5 rounded-full shadow-lg transition ${
                      isFavorite ? 'bg-pink-600 text-white' : 'bg-white/90 text-gray-700 hover:text-pink-600'
                    }`}
                  >
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  </button>
                </div>

                {/* Multiple Images Thumbnails Strip */}
                {allImages.length > 1 && (
                  <div className="w-full mt-4">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                      Outfit Images ({allImages.length})
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                      {allImages.map((imgUrl, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                            selectedImageIndex === index
                              ? 'border-pink-600 ring-2 ring-pink-300 scale-105 shadow-md'
                              : 'border-gray-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Product Details & Booking Column */}
              <div className="md:col-span-7 p-5 sm:p-8 flex flex-col justify-between space-y-5">
                <div>
                  
                  {/* Designer & Rating Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200/60">
                      {product.designer}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{product.rating || 5.0}</span>
                      <span className="text-gray-400 font-normal">({product.reviewCount || 1} reviews)</span>
                    </div>
                  </div>

                  {/* Dress Name */}
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 mt-2 leading-tight">
                    {product.name}
                  </h2>

                  {/* Dynamic Price Display Card */}
                  <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-pink-50/70 border border-pink-100 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-xs text-gray-500 block font-semibold">
                          Rental Fee ({durationDays} Days)
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          {priceInfo.hasOffer ? (
                            <>
                              <span className="text-2xl sm:text-3xl font-extrabold text-pink-700">
                                ₹{priceInfo.finalPrice.toLocaleString('en-IN')}
                              </span>
                              <span className="text-sm font-semibold text-gray-400 line-through">
                                ₹{priceInfo.originalPrice.toLocaleString('en-IN')}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl sm:text-3xl font-extrabold text-pink-700">
                              ₹{priceInfo.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {priceInfo.hasOffer && (
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-red-700 bg-red-100 px-3 py-1 rounded-full inline-block">
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

                  {/* Dress Description & Key Details */}
                  {product.description && (
                    <div className="mt-4 text-xs text-gray-600 leading-relaxed bg-gray-50/70 p-3 rounded-xl border border-gray-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-gray-800 mb-1">
                        <Info className="w-3.5 h-3.5 text-pink-600" />
                        <span>Outfit Description & Details</span>
                      </div>
                      <p>{product.description}</p>
                    </div>
                  )}

                  {/* Fabric, Work Type & Occasion Tags */}
                  {(product.fabric || product.workType || product.occasion) && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {product.fabric && (
                        <div className="bg-amber-50/60 border border-amber-100 p-2 rounded-lg">
                          <span className="font-bold text-gray-700">Fabric: </span>
                          <span className="text-gray-600">{product.fabric}</span>
                        </div>
                      )}
                      {product.workType && (
                        <div className="bg-pink-50/60 border border-pink-100 p-2 rounded-lg">
                          <span className="font-bold text-gray-700">Craft Work: </span>
                          <span className="text-gray-600">{product.workType}</span>
                        </div>
                      )}
                      {product.occasion && (
                        <div className="bg-purple-50/60 border border-purple-100 p-2 rounded-lg sm:col-span-2">
                          <span className="font-bold text-gray-700">Ideal Occasion: </span>
                          <span className="text-gray-600">{product.occasion}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Customer Name Optional Field */}
                  <div className="mt-4 space-y-1">
                    <label className="block text-xs font-bold text-gray-800 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-pink-600" />
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Radhika Sharma"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-pink-500"
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
                            ? 'border-pink-600 bg-pink-50 text-pink-900 shadow-sm font-bold'
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
                            ? 'border-pink-600 bg-pink-50 text-pink-900 shadow-sm font-bold'
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
                    <label className="block text-xs font-bold text-gray-800">Available Sizes</label>
                    <div className="flex gap-2 flex-wrap">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">Return Date</label>
                      <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700">
                        {returnDate}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Direct WhatsApp Action Button & Mandated Notice */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
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
      </div>

      {/* Interactive Fullscreen Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        images={allImages}
        currentIndex={selectedImageIndex}
        onClose={() => setIsLightboxOpen(false)}
        onSelectImage={(idx) => setSelectedImageIndex(idx)}
        productName={product.name}
      />
    </>
  );
};

