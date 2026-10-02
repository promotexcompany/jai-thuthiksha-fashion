import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { api } from '../services/api';
import type { Product, Category } from '../types/fashion';
import type { MainLayoutContextType } from '../layouts/MainLayout';

export const Catalogue: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const context = useOutletContext<MainLayoutContextType>();
  const onQuickView = context?.onQuickView;

  const selectedCatParam = searchParams.get('cat') || 'all';

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>(selectedCatParam);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load live data from API
  const loadLiveData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [liveDresses, liveCats] = await Promise.all([
        api.getPublicDresses(),
        api.getPublicCategories()
      ]);
      if (Array.isArray(liveDresses)) {
        setProductsList(liveDresses);
      } else {
        setProductsList([]);
      }
      if (Array.isArray(liveCats)) {
        setCategoriesList(liveCats);
      } else {
        setCategoriesList([]);
      }
    } catch (err: any) {
      console.error('Error fetching live catalogue data:', err);
      setError(err.message || 'Unable to load outfits. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveData();
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
        const pCatName = (p as any).categoryName || p.categoryLabel || p.category || '';
        const pCatNameLower = pCatName.toLowerCase();

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

  return (
    <div className="bg-[#fffcf8] min-h-screen py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        
        {/* Compact Category Selector Bar */}
        <div className="flex justify-center items-center gap-1.5 sm:gap-2 flex-wrap bg-white p-1.5 sm:p-2 rounded-2xl border border-pink-100 shadow-sm max-w-xl mx-auto sticky top-2 z-30 backdrop-blur-md">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-xl text-xs font-bold transition ${
              categoryFilter === 'all'
                ? 'gradient-btn text-white shadow-md'
                : 'text-gray-700 hover:text-pink-700 hover:bg-pink-50'
            }`}
          >
            All
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-xl text-xs font-bold transition ${
                categoryFilter === cat.id
                  ? 'gradient-btn text-white shadow-md'
                  : 'text-gray-700 hover:text-pink-700 hover:bg-pink-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-pink-100 shadow-sm animate-pulse flex flex-col">
                <div className="aspect-[3/4] bg-pink-100/50" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-pink-100/60 rounded w-3/4" />
                  <div className="h-3 bg-pink-100/40 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-red-200 space-y-4 max-w-md mx-auto my-12 shadow-sm">
            <h3 className="text-lg font-bold text-red-600 font-serif">Unable to Load Outfits</h3>
            <p className="text-xs text-gray-600">{error}</p>
            <button
              onClick={loadLiveData}
              className="px-6 py-2 rounded-full gradient-btn text-white text-xs font-bold shadow-md"
            >
              Retry Loading
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-pink-100 space-y-4 max-w-md mx-auto my-12">
            <h3 className="text-lg font-bold text-gray-800 font-serif">No Dresses Found</h3>
            <p className="text-xs text-gray-500">
              No outfits available in this category yet.
            </p>
            <button
              onClick={() => handleCategorySelect('all')}
              className="px-6 py-2 rounded-full gradient-btn text-white text-xs font-bold shadow-md"
            >
              Show All Outfits
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => {
              const galleryCount = (product.galleryImages?.length || product.images?.length || 1);
              return (
                <div
                  key={product.id}
                  onClick={() => onQuickView && onQuickView(product)}
                  className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-xl transition duration-300 flex flex-col group cursor-pointer"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <img
                      src={product.primaryImage || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    {/* Category Label */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-slate-900/90 text-amber-300 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-slate-700 backdrop-blur-sm shadow-md">
                      {product.categoryLabel || product.category}
                    </div>

                    {/* Gallery Views Counter Badge */}
                    {galleryCount > 1 && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-pink-700/90 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm">
                        {galleryCount} Photos
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 sm:p-4 bg-white flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 text-xs sm:text-sm font-serif line-clamp-1 group-hover:text-pink-700 transition">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-semibold text-pink-700">
                      ₹{Number((product as any).price || product.rentalPrice4Days || product.retailPrice || 0).toLocaleString('en-IN')}
                    </p>
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
