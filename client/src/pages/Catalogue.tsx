import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { PRODUCTS, CATEGORIES } from '../services/data';
import { api } from '../services/api';
import type { Product, Category } from '../types/fashion';
import type { MainLayoutContextType } from '../layouts/MainLayout';

export const Catalogue: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const context = useOutletContext<MainLayoutContextType>();
  const onQuickView = context?.onQuickView;

  const selectedCatParam = searchParams.get('cat') || 'all';

  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [categoriesList, setCategoriesList] = useState<Category[]>(CATEGORIES);
  const [categoryFilter, setCategoryFilter] = useState<string>(selectedCatParam);

  // Load live data from API
  useEffect(() => {
    const loadLiveData = async () => {
      try {
        const [liveDresses, liveCats] = await Promise.all([
          api.getPublicDresses(),
          api.getPublicCategories()
        ]);
        if (liveDresses && Array.isArray(liveDresses) && liveDresses.length > 0) {
          setProductsList(liveDresses);
        }
        if (liveCats && Array.isArray(liveCats) && liveCats.length > 0) {
          setCategoriesList(liveCats);
        }
      } catch (err) {
        console.warn('Using offline fallback data for catalogue');
      }
    };
    loadLiveData();
  }, []);

  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      if ((p as any).isHidden) return false;
      // Category check
      if (categoryFilter !== 'all') {
        const matchesCategory = p.category === categoryFilter ||
                                (p as any).categoryId === categoryFilter ||
                                p.categoryLabel?.toLowerCase() === categoryFilter.toLowerCase() ||
                                (categoryFilter === 'photoshoot' && (p.category === 'cat-photoshoot' || p.category === 'photoshoot' || p.categoryLabel?.toLowerCase().includes('photo'))) ||
                                (categoryFilter === 'reception' && (p.category === 'cat-reception' || p.category === 'reception' || p.categoryLabel?.toLowerCase().includes('recept'))) ||
                                (categoryFilter === 'bridesmaid' && (p.category === 'cat-bridesmaid' || p.category === 'bridesmaid' || p.categoryLabel?.toLowerCase().includes('bride')));
        if (!matchesCategory) return false;
      }
      return true;
    });
  }, [productsList, categoryFilter]);

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

        {/* Dress Feed Grid */}
        {filteredProducts.length === 0 ? (
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
