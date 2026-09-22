import React from 'react';
import { REVIEWS } from '../services/data';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-white border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-700 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
            Happy Renters
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-gray-900 tracking-tight">
            Loved by Brides & Celebrants Across South India
          </h2>
          <p className="text-sm text-gray-600">
            Read authentic stories from customers who looked stunning on their big day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-pink-50/50 p-8 rounded-3xl border border-pink-100 shadow-sm relative flex flex-col justify-between"
            >
              <Quote className="w-10 h-10 text-pink-200 absolute top-6 right-6" />

              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-gray-700 leading-relaxed italic mb-6 relative z-10">
                  "{rev.comment}"
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-pink-800 bg-pink-100/80 px-3 py-1 rounded-full inline-block mb-4">
                  Rented: {rev.outfitName}
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-pink-200/60">
                  <img
                    src={rev.avatar}
                    alt={rev.author}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-gray-900 text-sm">{rev.author}</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-xs text-gray-500">{rev.role}</p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
