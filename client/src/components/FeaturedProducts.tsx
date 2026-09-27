import { useState, useEffect, useMemo } from 'react';
import { PRODUCTS, CATEGORIES } from '../services/data';
import { api } from '../services/api';
import type { Product, Category } from '../types/fashion';
import { Eye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeaturedProductsProps {
  onQuickView: (product: Product) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  onQuickView,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [categoriesList, setCategoriesList] = useState<Category[]>(CATEGORIES);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [liveDresses, liveCats] = await Promise.all([
          api.getPublicDresses(),
          api.getPublicCategories()
        ]);
        if (Array.isArray(liveDresses) && liveDresses.length > 0) {
          setProductsList(liveDresses);
        }
        if (Array.isArray(liveCats) && liveCats.length > 0) {
          setCategoriesList(liveCats);
        }
      } catch (err) {
        console.warn('Using offline fallback for featured products');
      }
    };
    loadData();
  }, []);

  // Filter dresses for homepage: showOnHomepage !== false && !isHidden
  const homepageProducts = useMemo(() => {
    return productsList.filter((p) => {
      const isVisibleOnHome = (p as any).showOnHomepage !== false && !(p as any).isHidden;
      if (!isVisibleOnHome) return false;

      if (activeTab !== 'all') {
        const matchesCat = p.category === activeTab ||
                           (p as any).categoryId === activeTab ||
                           p.categoryLabel?.toLowerCase() === activeTab.toLowerCase();
        if (!matchesCat) return false;
      }
      return true;
    });
  }, [productsList, activeTab]);

  // Tab options from active categories
  const tabOptions = useMemo(() => {
    const list = [{ id: 'all', label: 'All Collection' }];
    categoriesList.forEach((cat) => {
      list.push({ id: cat.id, label: cat.name });
    });
    return list;
  }, [categoriesList]);

  return (
    <section className="py-16 bg-pink-50/40 border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-pink-700 bg-pink-100/80 px-3 py-1 rounded-full border border-pink-200">
              Trending Rentals
            </span>
            <h2 className="text-3xl font-extrabold font-serif text-gray-900 tracking-tight mt-2">
              Most Popular Designer Wear
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Handpicked bridal, saree, and festive wear ready for instant rental booking.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl border border-pink-200 shadow-sm">
            {tabOptions.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'gradient-btn text-white shadow-md'
                    : 'text-gray-600 hover:text-pink-700 hover:bg-pink-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {homepageProducts.map((product) => {
            const galleryCount = (product.galleryImages?.length || product.images?.length || 1);
            return (
              <div
                key={product.id}
                onClick={() => onQuickView(product)}
                className="bg-white rounded-3xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-2xl transition duration-500 flex flex-col group cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative h-96 overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* Category & Multi-View Badge */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    <span className="bg-slate-900/90 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-sm border border-slate-700">
                      {product.categoryLabel || product.category}
                    </span>
                    {galleryCount > 1 && (
                      <span className="bg-pink-700/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm shadow-sm">
                        {galleryCount} Views
                      </span>
                    )}
                  </div>

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4">
                    <button
                      onClick={() => onQuickView(product)}
                      className="bg-white text-gray-900 px-5 py-3 rounded-full font-bold text-xs shadow-xl hover:bg-pink-700 hover:text-white transition flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4 text-pink-600 group-hover:text-white" />
                      <span>View All Images & Enquire</span>
                    </button>
                  </div>
                </div>

                {/* Dress Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg font-serif line-clamp-1 group-hover:text-pink-700 transition">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {product.description || 'Exclusive luxury designer boutique outfit'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-pink-700 flex items-center gap-1">
                      <span>View Gallery</span>
                    </span>

                    <button
                      onClick={() => onQuickView(product)}
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

        {/* View All Catalogue Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/catalogue')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white border border-pink-300 text-pink-900 font-bold text-sm hover:bg-pink-50 shadow-sm hover:shadow-md transition"
          >
            <span>View All Outfits in Catalogue</span>
            <ArrowRight className="w-4 h-4 text-pink-700" />
          </button>
        </div>

      </div>
    </section>
  );
};
