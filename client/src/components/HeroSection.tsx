import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Sparkles, Calendar, Search, ArrowRight, CheckCircle2, Award, Tag } from 'lucide-react';
import type { CategoryOffer } from '../types/fashion';
import type { MainLayoutContextType } from '../layouts/MainLayout';
import { PRODUCTS } from '../services/data';

interface HeroSectionProps {
  onOpenAppointment: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAppointment }) => {
  const navigate = useNavigate();
  const context = useOutletContext<MainLayoutContextType>();
  const offers: CategoryOffer[] = context?.offers || [];
  const onQuickView = context?.onQuickView;

  const [selectedCategory, setSelectedCategory] = useState('');
  const [eventDate, setEventDate] = useState('');

  const activeOffers = offers.filter((o) => o.isActive);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let queryParams = [];
    if (selectedCategory) queryParams.push(`cat=${selectedCategory}`);
    if (eventDate) queryParams.push(`date=${eventDate}`);
    const searchString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    navigate(`/catalogue${searchString}`);
  };

  return (
    <section className="relative overflow-hidden gradient-bg pt-8 pb-16 lg:py-20 border-b border-pink-100">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Dynamic Promotional Banner for Active Offers */}
            {activeOffers.length > 0 ? (
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-amber-100 border border-pink-300 text-pink-950 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm flex-wrap justify-center lg:justify-start">
                <Tag className="w-4 h-4 text-red-600 animate-pulse" />
                <span>
                  🔥 Active Offers: {activeOffers.map((o) => `${o.name} (${o.discountPercentage}% OFF on ${o.categoryName})`).join(' • ')}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-pink-100/80 border border-pink-300/60 text-pink-900 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                <span>South India's Most Trusted Luxury Designer Rental Boutique</span>
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif text-slate-900 tracking-tight leading-tight">
              Wear the <span className="gradient-text">Luxury Designer</span> You Love for Your Special Day.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Rent royal bridal lehengas, handwoven Kanjeevaram silk sarees, and groom sherwanis at accessible rental prices. Includes custom alteration and sanitized delivery.
            </p>

            {/* Interactive Search & Filter Bar */}
            <form 
              onSubmit={handleSearch}
              className="bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-pink-100 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto lg:mx-0"
            >
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-left px-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">All Collections</option>
                  <option value="cat-1">Bride Dresses</option>
                  <option value="cat-2">Silk Sarees</option>
                  <option value="cat-3">Maternity Wear</option>
                  <option value="cat-4">Photoshoot Dresses</option>
                  <option value="cat-5">Traditional Wear</option>
                  <option value="cat-6">Party Wear</option>
                  <option value="cat-7">Jewelry & Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-left px-1">
                  Event Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full gradient-btn text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Outfits</span>
                </button>
              </div>
            </form>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => navigate('/catalogue')}
                className="px-6 py-3.5 rounded-xl gradient-btn text-white font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition"
              >
                <span>Explore Full Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAppointment}
                className="px-6 py-3.5 rounded-xl bg-white border border-pink-300 text-pink-900 font-bold text-sm hover:bg-pink-50 transition flex items-center gap-2 shadow-sm"
              >
                <Calendar className="w-4 h-4 text-pink-600" />
                <span>Book In-Store Trial Fitting</span>
              </button>
            </div>

            {/* Value Props Bullet Badges */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Custom Fitting</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Free Dry Cleaning</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>4 & 8 Day Rentals</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Doorstep Delivery</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Hero Showcase Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Card */}
              <div
                onClick={() => onQuickView && onQuickView(PRODUCTS[0])}
                className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-1 hover:rotate-0 transition duration-500 bg-white cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800"
                  alt="Maharani Bridal Lehenga"
                  className="w-full h-80 sm:h-[420px] object-cover"
                />
                
                {/* Floating Price Pill */}
                <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md text-white p-3 rounded-2xl border border-white/20 shadow-xl">
                  <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold block">Rental Price</span>
                  <span className="text-xl font-extrabold text-white">₹5,999</span>
                  <span className="text-[10px] text-gray-300 block line-through">Retail ₹85,000</span>
                </div>

                <div className="p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent absolute bottom-0 inset-x-0 text-white">
                  <span className="bg-pink-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
                    Bridal Highlight
                  </span>
                  <h3 className="text-lg font-bold font-serif">Maharani Velvet Crimson Lehenga</h3>
                  <p className="text-xs text-pink-200 mt-0.5">Handcrafted Zardozi Embroidery</p>
                </div>
              </div>

              {/* Floating Trust Badge Card */}
              <div className="absolute -bottom-6 left-0 sm:-left-6 z-20 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-pink-100 flex items-center gap-3.5 max-w-xs animate-float">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">5,000+ Happy Renters</h4>
                  <p className="text-[11px] text-gray-500">Rated 4.9★ by Brides & Grooms across South India</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
