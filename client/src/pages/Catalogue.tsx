import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { PRODUCTS, CATEGORIES } from '../services/data';
import { api } from '../services/api';
import type { Product, Category, CategoryOffer } from '../types/fashion';
import { Star, Search, Sparkles, SlidersHorizontal, RotateCcw, Tag } from 'lucide-react';
import { getCalculatedPrice } from '../utils/offerUtils';
import type { MainLayoutContextType } from '../layouts/MainLayout';

export const Catalogue: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const context = useOutletContext<MainLayoutContextType>();
  const onQuickView = context?.onQuickView;
  const offers: CategoryOffer[] = context?.offers || [];

  const selectedCatParam = searchParams.get('cat') || 'all';

  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [categoriesList, setCategoriesList] = useState<Category[]>(CATEGORIES);
  const [categoryFilter, setCategoryFilter] = useState<string>(selectedCatParam);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

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
      // Category check
      if (categoryFilter !== 'all') {
        const matchesCategory = p.category === categoryFilter ||
                                (p as any).categoryId === categoryFilter ||
                                p.categoryLabel?.toLowerCase() === categoryFilter.toLowerCase();
        if (!matchesCategory) return false;
      }
      // Search query
      if (
        searchQuery &&
        !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.designer.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(p.workType || '').toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Price check (against calculated final price)
      const pInfo = getCalculatedPrice(p.rentalPrice4Days, p.categoryId || p.category, p.categoryLabel, offers);
      if (pInfo.finalPrice > maxPrice) {
        return false;
      }
      // Size check
      if (selectedSize !== 'all' && !p.sizes?.includes(selectedSize)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      const aInfo = getCalculatedPrice(a.rentalPrice4Days, a.categoryId || a.category, a.categoryLabel, offers);
      const bInfo = getCalculatedPrice(b.rentalPrice4Days, b.categoryId || b.category, b.categoryLabel, offers);

      if (sortBy === 'price-low') return aInfo.finalPrice - bInfo.finalPrice;
      if (sortBy === 'price-high') return bInfo.finalPrice - aInfo.finalPrice;
      if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
      return 0;
    });
  }, [productsList, categoryFilter, searchQuery, maxPrice, selectedSize, sortBy, offers]);

  const handleCategorySelect = (catId: string) => {
    setCategoryFilter(catId);
    if (catId === 'all') {
      searchParams.delete('cat');
    } else {
      searchParams.set('cat', catId);
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setMaxPrice(10000);
    setSelectedSize('all');
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="bg-[#fffcf8] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-pink-700 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            Designer Outfit Inventory
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-gray-900 tracking-tight">
            Rental Catalogue
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl">
            Filter through our curated luxury collection of bridal lehengas, silk sarees, gowns, and menswear available for 4 or 8-day rentals.
          </p>
        </div>

        {/* Filter Bar & Search Row */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-pink-100 shadow-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Search Outfits</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Velvet, Zardozi, Silk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full py-2 px-3 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price Filter Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1">
                <span>Max 4-Day Rent</span>
                <span className="text-pink-700">₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-pink-600 cursor-pointer"
              />
            </div>

            {/* Sort Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2 px-3 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="featured">Featured / Popular</option>
                <option value="price-low">Rental Price: Low to High</option>
                <option value="price-high">Rental Price: High to Low</option>
                <option value="rating">Top Rated (5★)</option>
              </select>
            </div>

          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
            <span>Showing <strong>{filteredProducts.length}</strong> outfit(s)</span>
            <button
              onClick={handleResetFilters}
              className="text-pink-700 hover:text-pink-900 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-pink-100 space-y-4">
            <SlidersHorizontal className="w-12 h-12 text-pink-300 mx-auto" />
            <h3 className="text-xl font-bold text-gray-800">No Outfits Found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              We couldn't find any rental outfits matching your current filter criteria. Try adjusting your search keyword or price range.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-full bg-pink-700 text-white text-xs font-bold hover:bg-pink-800 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const pInfo = getCalculatedPrice(product.rentalPrice4Days, product.categoryId || product.category, product.categoryLabel, offers);
              return (
                <div
                  key={product.id}
                  onClick={() => onQuickView && onQuickView(product)}
                  className="bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-xl transition duration-300 flex flex-col group cursor-pointer"
                >
                  <div className="relative h-80 overflow-hidden bg-gray-100">
                    <img
                      src={product.primaryImage || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-pink-900/80 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                      {product.categoryLabel}
                    </div>

                    {pInfo.hasOffer && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {pInfo.discountPercentage}% OFF
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                        <span className="font-semibold text-pink-700">{product.designer}</span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{product.rating || 5.0}</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-gray-900 text-base font-serif line-clamp-1 group-hover:text-pink-700 transition">
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">4-Day Rent</span>
                        {pInfo.hasOffer ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-extrabold text-pink-700">
                              ₹{pInfo.finalPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              ₹{pInfo.originalPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-extrabold text-pink-700">
                            ₹{pInfo.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onQuickView && onQuickView(product)}
                        className="px-4 py-2 rounded-xl bg-pink-700 text-white font-bold text-xs hover:bg-pink-800 transition shadow-sm"
                      >
                        View & Rent
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
