import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Award } from 'lucide-react';

interface HeroSectionProps {
  onOpenAppointment?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-8 pb-14 lg:py-16 border-b border-white/10">
      
      {/* Ambient Radial Glow Orbs for Hero Atmosphere */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#38206B]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-96 h-96 bg-[#D6B36A]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#D95C91]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 glass-pill text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold border border-[#D6B36A]/30 shadow-[0_0_15px_rgba(214,179,106,0.15)]">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Jai Thuthiksha Fashion — Luxury Couture</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif text-white tracking-tight leading-tight">
              Wear Exquisite <span className="gradient-text">Designer Outfits</span> For Every Special Moment.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Explore our exclusive collections for Photoshoots, Receptions, and Bridesmaid occasions. View multi-angle photos and connect directly on WhatsApp.
            </p>

            {/* Quick Category Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => navigate('/catalogue?cat=photoshoot')}
                className="px-6 py-3.5 rounded-2xl gradient-vibrant-btn font-bold text-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Photoshoot Outfits</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/catalogue?cat=reception')}
                className="px-6 py-3.5 rounded-2xl glass-pill text-slate-200 font-bold text-sm hover:border-[#D6B36A]/40 hover:bg-white/10 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Reception Gowns</span>
                <ArrowRight className="w-4 h-4 text-[#D6B36A]" />
              </button>

              <button
                onClick={() => navigate('/catalogue?cat=bridesmaid')}
                className="px-6 py-3.5 rounded-2xl glass-pill text-slate-200 font-bold text-sm hover:border-[#D6B36A]/40 hover:bg-white/10 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Bridesmaid Fits</span>
                <ArrowRight className="w-4 h-4 text-[#D6B36A]" />
              </button>
            </div>

            {/* Value Props Bullet Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Exclusive Collections</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-Image Gallery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct WhatsApp Inquiry</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Hero Showcase Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Showcase Card */}
              <div
                onClick={() => navigate('/catalogue')}
                className="relative z-10 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-[#D6B36A]/30 transform rotate-1 hover:rotate-0 transition duration-500 bg-[#0d0c1d] cursor-pointer group"
              >
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800"
                  alt="Boutique Designer Outfit"
                  className="w-full h-80 sm:h-[420px] object-cover group-hover:scale-105 transition duration-500"
                />

                <div className="p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent absolute bottom-0 inset-x-0 text-white">
                  <span className="bg-gradient-to-r from-[#D95C91] via-[#38206B] to-[#526DCE] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 inline-block shadow-md border border-[#D6B36A]/30">
                    Exclusive Showcase
                  </span>
                  <h3 className="text-xl font-bold font-serif text-white">Boutique Couture Collection</h3>
                  <p className="text-xs text-amber-200 mt-0.5">Click to view Photoshoot, Reception & Bridesmaid dresses</p>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="absolute -bottom-5 left-0 sm:-left-6 z-20 glass-dark p-4 rounded-2xl shadow-2xl border border-white/15 flex items-center gap-3.5 max-w-xs">
                <div className="w-12 h-12 rounded-xl bg-[#D6B36A]/20 text-[#D6B36A] border border-[#D6B36A]/30 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Jai Thuthiksha Fashion</h4>
                  <p className="text-[11px] text-slate-300">Premium Designer Dress Collections</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
