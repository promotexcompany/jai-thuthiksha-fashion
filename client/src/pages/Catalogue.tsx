import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { PRODUCTS, CATEGORIES } from '../services/data';
import { api } from '../services/api';
import type { Product, Category } from '../types/fashion';
import type { MainLayoutContextType } from '../layouts/MainLayout';
import { Sparkles, Eye, Image as ImageIcon, Sparkle } from 'lucide-react';

export const Catalogue: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const context = useOutletContext<MainLayoutContextType>();
  const onQuickView = context?.onQuickView;

  const selectedCatParam = searchParams.get('cat') || 'all';

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>(selectedCatParam);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Sync state if URL search param changes
  useEffect(() => {
    setCategoryFilter(selectedCatParam);
  }, [selectedCatParam]);

  // Load live data from API
  useEffect(() => {
    let isMounted = true;
    const loadLiveData = async () => {
      try {
        setIsLoading(true);
        const [liveDresses, liveCats] = await Promise.all([
          api.getPublicDresses(),
          api.getPublicCategories()
        ]);
        if (!isMounted) return;
        if (Array.isArray(liveDresses)) {
          setProductsList(liveDresses);
        } else {
          setProductsList(PRODUCTS);
        }
        if (Array.isArray(liveCats) && liveCats.length > 0) {
          setCategoriesList(liveCats);
        } else {
          setCategoriesList(CATEGORIES);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Using offline fallback data for catalogue');
          setProductsList(PRODUCTS);
          setCategoriesList(CATEGORIES);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadLiveData();
    return () => { isMounted = false; };
  }, []);

  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      if ((p as any).isHidden) return false;
      // Category check
      if (categoryFilter !== 'all') {
        const selectedCat = categoriesList.find(
          (c) => c.id === categoryFilter || c.slug === categoryFilter || c.name.toLowerCase() === categoryFilter.toLowerCase()
        );

        const pCatId = (p as any).categoryId || p.category;
        const pCatName = (p as any).categoryName || p.categoryLabel || p.category;
        const pCatNameLower = (pCatName || '').toLowerCase();

        const matchesIdOrSlug =
          pCatId === categoryFilter ||
          p.category === categoryFilter ||
          (selectedCat && (pCatId === selectedCat.id || p.category === selectedCat.id || p.category === selectedCat.slug));

        const matchesName =
          pCatNameLower === categoryFilter.toLowerCase() ||
          (selectedCat && pCatNameLower === selectedCat.name.toLowerCase());

        const matchesLegacy =
          (categoryFilter === 'photoshoot' && (pCatId === 'cat-1' || pCatId === 'cat-photoshoot' || pCatNameLower.includes('photo'))) ||
          (categoryFilter === 'reception' && (pCatId === 'cat-2' || pCatId === 'cat-reception' || pCatNameLower.includes('recept'))) ||
          (categoryFilter === 'bridesmaid' && (pCatId === 'cat-6' || pCatId === 'cat-bridesmaid' || pCatNameLower.includes('bride')));

        if (!matchesIdOrSlug && !matchesName && !matchesLegacy) return false;
      }
      return true;
    });
  }, [productsList, categoriesList, categoryFilter]);

  const handleCategorySelect = (catId: string) => {
    setCategoryFilter(catId);
    if (catId === 'all') {
      searchParams.delete('cat');
    } else {
      searchParams.set('cat', catId);
    }
    setSearchParams(searchParams);
  };

  const handleImageError = (productId: string) => {
    setBrokenImages((prev) => ({ ...prev, [productId]: true }));
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 pt-4 sm:pt-6">
        
        {/* Responsive Horizontal Category Filter Pill Bar */}
        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none py-1.5 px-2 bg-[#0c0b18]/90 rounded-2xl sm:rounded-full border border-white/10 shadow-2xl max-w-full sm:max-w-2xl mx-auto sticky top-18 sm:top-24 z-30 backdrop-blur-xl">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`shrink-0 px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
              categoryFilter === 'all'
                ? 'gradient-vibrant-btn text-white scale-105'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            All Outfits
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`shrink-0 px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                categoryFilter === cat.id
                  ? 'gradient-vibrant-btn text-white scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dress Feed Section Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
              <span>
                {categoryFilter === 'all'
                  ? 'Featured Catalogue Outfits'
                  : `${categoriesList.find(c => c.id === categoryFilter || c.slug === categoryFilter)?.name || categoryFilter} Outfits`}
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Showing {filteredProducts.length} designer dresses available for rental & inquiry
            </p>
          </div>
        </div>

        {/* Loading Skeleton View */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="glass-dark-card rounded-2xl sm:rounded-3xl overflow-hidden aspect-[3/4] shimmer-skeleton" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State View */
          <div className="glass-dark rounded-3xl p-8 sm:p-14 text-center border border-white/10 space-y-4 max-w-md mx-auto my-8 sm:my-12 shadow-2xl">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mx-auto">
              <Sparkle className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-serif">No Outfits Found</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              No outfits available in this category currently. Explore our other collections!
            </p>
            <button
              onClick={() => handleCategorySelect('all')}
              className="px-6 py-2.5 rounded-full gradient-vibrant-btn text-xs font-bold shadow-lg cursor-pointer"
            >
              Show All Outfits
            </button>
          </div>
        ) : (
          /* Dress Cards Feed Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            {filteredProducts.map((product) => {
              const galleryCount = (product.galleryImages?.length || product.images?.length || 1);
              const mainImgSrc = product.primaryImage || product.image;
              const isImgBroken = brokenImages[product.id];
              const displayPrice = (product as any).price || product.rentalPrice4Days || product.retailPrice;

              return (
                <div
                  key={product.id}
                  onClick={() => onQuickView && onQuickView(product)}
                  className="glass-dark-card rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 hover:border-pink-500/40 shadow-xl hover:shadow-[0_15px_35px_rgba(236,72,153,0.25)] transition duration-300 flex flex-col group cursor-pointer relative"
                >
                  {/* Image Container with Aspect Ratio */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0914] flex items-center justify-center">
                    {!isImgBroken && mainImgSrc ? (
                      <img
                        src={mainImgSrc}
                        alt={product.name}
                        onError={() => handleImageError(product.id)}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#121024] to-[#090814] text-slate-400 p-3 text-center">
                        <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-pink-400/60 mb-1.5" />
                        <span className="text-[11px] sm:text-xs font-serif text-slate-300 line-clamp-1">{product.name}</span>
                        <span className="text-[9px] sm:text-[10px] text-pink-400/80 mt-0.5">Boutique Outfit</span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07060f]/90 via-transparent to-black/30 opacity-80 group-hover:opacity-60 transition" />

                    {/* Category Label */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/80 text-amber-300 text-[9px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-amber-500/30 backdrop-blur-md shadow-md">
                      {product.categoryLabel || product.category}
                    </div>

                    {/* Gallery Views Counter Badge */}
                    {galleryCount > 1 && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-pink-600/90 text-white text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-pink-400/30 backdrop-blur-md shadow-sm">
                        {galleryCount} Photos
                      </div>
                    )}

                    {/* Quick View Hover Indicator Badge */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
                      <div className="bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-pink-500/40 shadow-xl flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition">
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400" />
                        <span>Quick View</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Info Content */}
                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#0c0b1a]/60 to-[#07060f]/90 border-t border-white/5 space-y-1">
                    <h3 className="font-bold text-white text-xs sm:text-sm font-serif line-clamp-1 group-hover:text-pink-300 transition">
                      {product.name}
                    </h3>

                    {displayPrice ? (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs sm:text-sm font-extrabold gradient-gold-text font-serif">
                          ₹{Number(displayPrice).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          View Details →
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Catalogue;
