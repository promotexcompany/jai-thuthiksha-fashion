import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onSelectImage: (index: number) => void;
  productName?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onSelectImage,
  productName = 'Dress Image Viewer',
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistRef = useRef<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Reset zoom & pan when image changes or modal opens/closes
  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    resetZoom();
  }, [currentIndex, isOpen, resetZoom]);

  const handleNext = useCallback(() => {
    resetZoom();
    onSelectImage((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onSelectImage, resetZoom]);

  const handlePrev = useCallback(() => {
    resetZoom();
    onSelectImage((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onSelectImage, resetZoom]);

  // Handle ESC key to close & Arrow keys for navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, currentIndex, handleNext, handlePrev, onClose]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const nextScale = Math.max(prev - 0.5, 1);
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
      return nextScale;
    });
  };

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.2);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.25, 4));
    } else {
      setScale((prev) => {
        const nextScale = Math.max(prev - 0.25, 1);
        if (nextScale === 1) setPosition({ x: 0, y: 0 });
        return nextScale;
      });
    }
  };

  // Mouse drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag & Pinch zoom handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    } else if (e.touches.length === 2 && touchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchDistRef.current;
      touchDistRef.current = dist;
      setScale((prev) => {
        const nextScale = Math.min(Math.max(prev * factor, 1), 4);
        if (nextScale === 1) setPosition({ x: 0, y: 0 });
        return nextScale;
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistRef.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col justify-between select-none overflow-hidden"
      onClick={() => {
        if (scale === 1) onClose();
      }}
    >
      {/* Top Controls Bar */}
      <div
        className="w-full px-4 py-3 bg-black/60 border-b border-white/10 flex items-center justify-between z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-white text-xs sm:text-sm font-semibold truncate max-w-[200px] sm:max-w-md">
            {productName}
          </span>
          {images.length > 1 && (
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>

        {/* Zoom Controls & Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-40 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-gray-300 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-40 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {scale > 1 && (
            <button
              onClick={resetZoom}
              className="p-2 rounded-full bg-white/10 text-amber-300 hover:bg-white/20 transition ml-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <div className="h-5 w-[1px] bg-white/20 mx-1" />

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-red-600/80 text-white hover:bg-red-600 transition"
            title="Close Lightbox (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewing Canvas */}
      <div
        ref={imageContainerRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-6"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Arrows for Multiple Images */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 text-white hover:bg-pink-700 transition shadow-xl border border-white/20"
              title="Previous Image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 text-white hover:bg-pink-700 transition shadow-xl border border-white/20"
              title="Next Image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Zoomed / Displayed Image */}
        <div
          className="transition-transform duration-100 ease-out flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
          onClick={handleToggleZoom}
        >
          <img
            src={currentImage}
            alt={productName}
            className="max-w-full max-h-[75vh] md:max-h-[80vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom Thumbnails & Mobile Hint */}
      <div
        className="w-full px-4 py-3 bg-black/70 border-t border-white/10 flex flex-col items-center gap-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 ? (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  resetZoom();
                  onSelectImage(idx);
                }}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                  currentIndex === idx
                    ? 'border-pink-500 scale-105 shadow-md'
                    : 'border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        ) : (
          <span className="text-[11px] text-gray-400">
            {scale > 1 ? 'Drag to pan • Double click/tap to reset' : 'Click/tap image or use controls to zoom in'}
          </span>
        )}
      </div>
    </div>
  );
};

export default ImageLightboxModal;
