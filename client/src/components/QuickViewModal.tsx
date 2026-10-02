import { useState, useMemo } from 'react';
import { X, Sparkles, MessageSquare, ZoomIn, Info } from 'lucide-react';
import type { CategoryOffer, Product } from '../types/fashion';
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
  if (!product) return null;

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

  const handleBookViaWhatsApp = async () => {
    const shopName = settings?.shopName || 'Jai Thuthiksha Fashion';
    const category = product.categoryLabel || product.category;
    const whatsappNumber = settings?.whatsappNumber || '8489166899';

    const message = `Hi ${shopName}, I'm interested in the ${category} dress: ${product.name}. Please share the details.`;
    const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
        <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-pink-100 my-4 sm:my-8 max-h-[92vh] flex flex-col">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition shadow-lg"
            title="Close details"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Scrollable Content Container */}
          <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-12">
              
              {/* Product Media Column */}
              <div className="md:col-span-7 bg-gray-50 p-4 sm:p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-gray-100">
                
                {/* Main Image Preview & Zoom Trigger */}
                <div
                  className="relative w-full h-80 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden bg-white shadow-sm group cursor-pointer border border-pink-100 flex items-center justify-center"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    src={currentMainImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg border border-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {product.categoryLabel || product.category}
                  </div>

                  {/* Zoom Hint Overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <ZoomIn className="w-4 h-4 text-pink-700" />
                      <span>Click to Enlarge & Full Screen Zoom</span>
                    </div>
                  </div>
                </div>

                {/* Multiple Views Thumbnails Strip */}
                {allImages.length > 1 && (
                  <div className="w-full mt-4">
                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-2">
                      Dress Views / Photos ({allImages.length})
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
                            alt={`${product.name} view ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Product Details & WhatsApp Action Column */}
              <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
                    {product.categoryLabel || product.category} Collection
                  </span>

                  {/* Dress Name & Price */}
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 leading-tight">
                      {product.name}
                    </h2>
                    {((product as any).price || product.rentalPrice4Days || product.retailPrice) ? (
                      <div className="text-xl sm:text-2xl font-extrabold text-pink-700 font-serif shrink-0">
                        ₹{((product as any).price || product.rentalPrice4Days || product.retailPrice || 0).toLocaleString('en-IN')}
                      </div>
                    ) : null}
                  </div>

                  {/* Dress Description & Details */}
                  {product.description && (
                    <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-gray-800">
                        <Info className="w-4 h-4 text-pink-600" />
                        <span>Dress Details</span>
                      </div>
                      <p>{product.description}</p>
                    </div>
                  )}

                  {/* Fabric & Craft Work Tags */}
                  {(product.fabric || product.workType || product.occasion) && (
                    <div className="space-y-2 text-xs">
                      {product.fabric && (
                        <div className="bg-amber-50/80 border border-amber-100 p-2.5 rounded-xl">
                          <span className="font-bold text-gray-800">Fabric: </span>
                          <span className="text-gray-700">{product.fabric}</span>
                        </div>
                      )}
                      {product.workType && (
                        <div className="bg-pink-50/80 border border-pink-100 p-2.5 rounded-xl">
                          <span className="font-bold text-gray-800">Craftsmanship: </span>
                          <span className="text-gray-700">{product.workType}</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Direct WhatsApp Contact Action */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleBookViaWhatsApp}
                    className="w-full py-4 rounded-2xl font-bold text-sm bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5 text-white fill-current" />
                    <span>Contact on WhatsApp</span>
                  </button>

                  <p className="text-center text-xs text-gray-500">
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

