import { useState, useEffect, useMemo } from 'react';
import { PRODUCTS, CATEGORIES } from '../services/data';
import { api } from '../services/api';
import type { Product, CategoryOffer, Category } from '../types/fashion';
import { Star, Eye, Sparkles, ArrowRight, Tag } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getCalculatedPrice } from '../utils/offerUtils';
import type { MainLayoutContextType } from '../layouts/MainLayout';

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

  const context = useOutletContext<MainLayoutContextType>();
  const offers: CategoryOffer[] = context?.offers || [];

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {homepageProducts.map((product) => {
            const priceInfo = getCalculatedPrice(product.rentalPrice4Days, product.categoryId || product.category, product.categoryLabel, offers);
            return (
              <div
                key={product.id}
                onClick={() => onQuickView(product)}
                className="bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-xl transition duration-300 flex flex-col group cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative h-80 overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {priceInfo.hasOffer && (
                      <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {priceInfo.discountPercentage}% OFF
                      </span>
                    )}
                    {product.isTrending && (
                      <span className="bg-amber-400 text-pink-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Trending
                      </span>
                    )}
                    {product.isNewArrival && (
                      <span className="bg-pink-700 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                        New In
                      </span>
                    )}
                  </div>

                  {/* Quick View Button Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4">
                    <button
                      onClick={() => onQuickView(product)}
                      className="bg-white text-gray-900 px-4 py-2.5 rounded-full font-bold text-xs shadow-xl hover:bg-pink-700 hover:text-white transition flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Quick View & Dates</span>
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                      <span className="font-semibold text-pink-700">{product.designer}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{product.rating}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base font-serif line-clamp-1 group-hover:text-pink-700 transition">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {product.sizes.map((s) => (
                        <span key={s} className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">4-Day Rent</span>
                      {priceInfo.hasOffer ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-extrabold text-pink-700">
                            ₹{priceInfo.finalPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            ₹{priceInfo.originalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-extrabold text-pink-700">
                          ₹{priceInfo.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onQuickView(product)}
                      className="px-4 py-2 rounded-xl bg-pink-50 text-pink-900 font-bold text-xs hover:bg-pink-700 hover:text-white transition border border-pink-200"
                    >
                      Rent Now
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
