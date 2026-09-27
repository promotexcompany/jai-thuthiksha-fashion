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
    <div className="bg-[#fffcf8] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-700 bg-pink-100/80 px-3 py-1 rounded-full border border-pink-200">
            Exclusive Designer Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-gray-900 tracking-tight">
            Dress Gallery
          </h1>
          <p className="text-sm text-gray-600">
            Select a category below to browse our exclusive dresses for Photoshoots, Receptions, and Bridesmaids.
          </p>
        </div>

        {/* Simplified Category Selector Tabs */}
        <div className="flex justify-center items-center gap-2 flex-wrap bg-white p-2 rounded-2xl border border-pink-100 shadow-sm max-w-xl mx-auto">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              categoryFilter === 'all'
                ? 'gradient-btn text-white shadow-md'
                : 'text-gray-700 hover:text-pink-700 hover:bg-pink-50'
            }`}
          >
            All Collections
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                categoryFilter === cat.id
                  ? 'gradient-btn text-white shadow-md'
                  : 'text-gray-700 hover:text-pink-700 hover:bg-pink-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-pink-100 space-y-4 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-gray-800 font-serif">No Outfits Found</h3>
            <p className="text-xs text-gray-500">
              No outfits available in this category yet. Click below to view all dresses.
            </p>
            <button
              onClick={() => handleCategorySelect('all')}
              className="px-6 py-2.5 rounded-full gradient-btn text-white text-xs font-bold shadow-md"
            >
              Show All Outfits
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const galleryCount = (product.galleryImages?.length || product.images?.length || 1);
              return (
                <div
                  key={product.id}
                  onClick={() => onQuickView && onQuickView(product)}
                  className="bg-white rounded-3xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-2xl transition duration-500 flex flex-col group cursor-pointer"
                >
                  <div className="relative h-96 overflow-hidden bg-gray-100">
                    <img
                      src={product.primaryImage || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-slate-900/90 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700 backdrop-blur-sm">
                      {product.categoryLabel || product.category}
                    </div>
                    {galleryCount > 1 && (
                      <div className="absolute top-4 right-4 bg-pink-700/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {galleryCount} Photos
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg font-serif line-clamp-1 group-hover:text-pink-700 transition">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {product.description || 'Exclusive boutique designer outfit'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-700">
                        View Multi-Image Gallery →
                      </span>

                      <button
                        onClick={() => onQuickView && onQuickView(product)}
                        className="px-4 py-2 rounded-xl bg-pink-50 text-pink-900 font-bold text-xs hover:bg-pink-700 hover:text-white transition border border-pink-200"
                      >
                        View Dress
                      </button>
                    </div>
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
