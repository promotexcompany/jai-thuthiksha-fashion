import React, { useState } from 'react';
import { FAQS } from '../services/data';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 bg-pink-50/30 border-b border-pink-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-700 bg-pink-100/80 px-3 py-1 rounded-full border border-pink-200">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold font-serif text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-600">
            Everything you need to know about renting with Jai Thuthiksha Fashion.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden transition"
              >
                <button
                  onClick={() => toggleIndex(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-gray-900 text-base font-serif hover:text-pink-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-pink-600 shrink-0" />
                    <span>{faq.q}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-pink-600 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-gray-600 border-t border-gray-100 leading-relaxed pl-13">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
