import { useState, useMemo } from 'react';
import { X, Sparkles, MessageSquare, ZoomIn, Info, Image as ImageIcon } from 'lucide-react';
import type { CategoryOffer, Product } from '../types/fashion';
import { api } from '../services/api';
import { ImageLightboxModal } from './ImageLightboxModal';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  offers?: CategoryOffer[];
  settings?: any;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  settings
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  // Multi-image management
  const allImages = useMemo(() => {
    if (!product) return [];
    const list = [
      product.primaryImage,
      product.image,
      ...(product.galleryImages || []),
      ...(product.images || [])
    ].filter(Boolean) as string[];

    // Remove duplicate image URLs
    return Array.from(new Set(list));
  }, [product]);

  if (!product) return null;

  const currentMainImage = allImages[selectedImageIndex] || product.image;
  const isMainImgBroken = brokenImages[selectedImageIndex];
  const displayPrice = (product as any).price || product.rentalPrice4Days || product.retailPrice;

  const handleBookViaWhatsApp = async () => {
    const shopName = settings?.shopName || 'Jai Thuthiksha Fashion';
    const category = product.categoryLabel || product.category;
    const whatsappNumber = settings?.whatsappNumber || '8489166899';

    // Log enquiry into backend bookings table
    await api.logEnquiry({
      customerName: 'WhatsApp Visitor',
      customerPhone: 'Via WhatsApp',
      dressId: product.id,
      dressName: product.name,
      category: category,
      startDate: new Date().toISOString().split('T')[0],
      returnDate: new Date().toISOString().split('T')[0],
      durationDays: 4,
      rentalPrice: 0
    }).catch(() => {});

    const message = `Hi ${shopName}, I'm interested in the ${category} dress: ${product.name}. Please share the details.`;
    const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4">
        <div className="relative bg-[#0e0c1e] text-slate-100 rounded-3xl max-w-4xl w-full shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden border border-white/15 my-4 sm:my-8 max-h-[92vh] flex flex-col">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition shadow-lg backdrop-blur-md cursor-pointer"
            title="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable Content Container */}
          <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-12">
              
              {/* Product Media Column */}
              <div className="md:col-span-7 bg-[#070612] p-4 sm:p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/10">
                
                {/* Main Image Preview & Zoom Trigger */}
                <div
                  className="relative w-full h-80 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden bg-[#0a0916] shadow-2xl group cursor-pointer border border-white/10 flex items-center justify-center"
                  onClick={() => !isMainImgBroken && setIsLightboxOpen(true)}
                >
                  {!isMainImgBroken && currentMainImage ? (
                    <img
                      src={currentMainImage}
                      alt={product.name}
                      onError={() => setBrokenImages(prev => ({ ...prev, [selectedImageIndex]: true }))}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#121024] to-[#090814] text-slate-400 p-6 text-center">
                      <ImageIcon className="w-12 h-12 text-pink-400/60 mb-2" />
                      <span className="text-sm font-serif text-slate-300">{product.name}</span>
                      <span className="text-xs text-pink-400/80 mt-1">Boutique Designer Outfit</span>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-amber-300 text-xs font-bold px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg border border-amber-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {product.categoryLabel || product.category}
                  </div>

                  {/* Zoom Hint Overlay */}
                  {!isMainImgBroken && currentMainImage && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                      <div className="bg-black/85 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-pink-500/40">
                        <ZoomIn className="w-4 h-4 text-pink-400" />
                        <span>Click for Fullscreen Zoom</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Multiple Views Thumbnails Strip */}
                {allImages.length > 1 && (
                  <div className="w-full mt-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Dress Views ({allImages.length})
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                      {allImages.map((imgUrl, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                            selectedImageIndex === index
                              ? 'border-pink-500 ring-2 ring-pink-500/50 scale-105 shadow-lg'
                              : 'border-white/10 opacity-60 hover:opacity-100'
                          }`}
                        >
                          {!brokenImages[index] ? (
                            <img
                              src={imgUrl}
                              alt={`${product.name} view ${index + 1}`}
                              onError={() => setBrokenImages(prev => ({ ...prev, [index]: true }))}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#121024] flex items-center justify-center text-[10px] text-slate-400 p-1 text-center">
                              Photo {index + 1}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Product Details & WhatsApp Action Column */}
              <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-300 glass-pill px-3.5 py-1.5 rounded-full border border-pink-500/30 inline-block">
                    {product.categoryLabel || product.category} Collection
                  </span>

                  {/* Dress Name & Price */}
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white leading-tight">
                      {product.name}
                    </h2>
                    {displayPrice ? (
                      <div className="text-xl sm:text-2xl font-extrabold gradient-gold-text font-serif shrink-0">
                        ₹{Number(displayPrice).toLocaleString('en-IN')}
                      </div>
                    ) : null}
                  </div>

                  {/* Dress Description & Details */}
                  {product.description && (
                    <div className="text-xs sm:text-sm text-slate-300 leading-relaxed glass-pill p-4 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Info className="w-4 h-4 text-pink-400" />
                        <span>Dress Details</span>
                      </div>
                      <p className="text-slate-300">{product.description}</p>
                    </div>
                  )}

                  {/* Fabric & Craft Work Tags */}
                  {(product.fabric || product.workType || product.occasion) && (
                    <div className="space-y-2 text-xs">
                      {product.fabric && (
                        <div className="glass-pill p-2.5 rounded-xl border border-amber-500/20">
                          <span className="font-bold text-amber-300">Fabric: </span>
                          <span className="text-slate-200">{product.fabric}</span>
                        </div>
                      )}
                      {product.workType && (
                        <div className="glass-pill p-2.5 rounded-xl border border-pink-500/20">
                          <span className="font-bold text-pink-300">Craftsmanship: </span>
                          <span className="text-slate-200">{product.workType}</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Direct WhatsApp Contact Action */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <button
                    onClick={handleBookViaWhatsApp}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm gradient-vibrant-btn flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5 text-white fill-current" />
                    <span>Contact on WhatsApp</span>
                  </button>

                  <p className="text-center text-[11px] text-slate-400">
                    Click to message our boutique directly on WhatsApp for availability & details.
                  </p>
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
