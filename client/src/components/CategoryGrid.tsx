import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../services/data';
import { api } from '../services/api';
import type { Category } from '../types/fashion';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const navigate = useNavigate();
  const [categoriesList, setCategoriesList] = useState<Category[]>(CATEGORIES);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const liveCats = await api.getPublicCategories();
        if (Array.isArray(liveCats) && liveCats.length > 0) {
          // Filter to only match Photoshoot, Reception, Bridesmaid
          const filtered = liveCats.filter((c) => {
            const nameLower = (c.name || '').toLowerCase();
            return nameLower.includes('photo') || nameLower.includes('recept') || nameLower.includes('bride');
          });
          if (filtered.length > 0) {
            setCategoriesList(filtered);
          }
        }
      } catch (err) {
        console.warn('Using offline categories fallback');
      }
    };
    fetchCats();
  }, []);

  return (
    <section className="py-16 bg-white border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-700 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
            Exclusive Collections
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-gray-900 tracking-tight">
            Browse by Occasion
          </h2>
          <p className="text-sm text-gray-600">
            Choose from our three signature collections: Photoshoot, Reception, and Bridesmaid outfits.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {categoriesList.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/catalogue?cat=${cat.id}`)}
              className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition duration-500 cursor-pointer bg-gray-900 border border-gray-100"
            >
              {/* Category Image */}
              <div className="h-80 w-full overflow-hidden">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-90 group-hover:opacity-100"
                />
              </div>

              {/* Badge if available */}
              {cat.badge && (
                <div className="absolute top-4 left-4 bg-amber-400 text-pink-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {cat.badge}
                </div>
              )}

              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 flex flex-col justify-end text-white">
                <div className="transform group-hover:-translate-y-1 transition duration-300">
                  <h3 className="text-2xl font-bold font-serif text-white group-hover:text-amber-300 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {cat.tagline || 'Exclusive Boutique Outfits'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-300 group-hover:text-white transition">
                  <span>Browse Category Gallery</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
