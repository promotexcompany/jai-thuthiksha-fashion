import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Sparkles, Heart } from 'lucide-react';
import { SHOP_CONFIG } from '../config/shopConfig';
import logoImg from '../assets/logo.png';

interface FooterProps {
  settings?: any;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const shopName = settings?.shopName || SHOP_CONFIG.SHOP_NAME;
  const phoneDisplay = settings?.phoneDisplay || SHOP_CONFIG.SHOP_PHONE_DISPLAY;
  const shopAddress = settings?.shopAddress || SHOP_CONFIG.SHOP_ADDRESS;
  const shopEmail = settings?.shopEmail || SHOP_CONFIG.SHOP_EMAIL;
  const shopLogo = settings?.shopLogo || logoImg;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#05040a] text-slate-300 border-t border-white/10 pt-12 pb-8 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          
          {/* Brand Info Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-1">
                <img src={shopLogo} alt={shopName} className="h-full w-full object-contain filter drop-shadow" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-serif gradient-text">{shopName}</span>
                <span className="text-[10px] tracking-widest uppercase font-semibold gradient-gold-text">Luxury Boutique</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              Curated designer outfits for Photoshoots, Receptions, and Bridesmaid celebrations. Elevate your special moments with luxury fashion rentals.
            </p>

            <div className="inline-flex items-center gap-2 glass-pill px-3.5 py-1.5 rounded-full text-xs text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Boutique Designer Rental Collection</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold font-serif text-white uppercase tracking-wider">Collections</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/catalogue?cat=photoshoot" className="hover:text-pink-400 transition">
                  Photoshoot Outfits
                </Link>
              </li>
              <li>
                <Link to="/catalogue?cat=reception" className="hover:text-pink-400 transition">
                  Reception Gowns
                </Link>
              </li>
              <li>
                <Link to="/catalogue?cat=bridesmaid" className="hover:text-pink-400 transition">
                  Bridesmaid Outfits
                </Link>
              </li>
              <li>
                <Link to="/catalogue" className="hover:text-pink-400 transition">
                  All Designer Outfits
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-bold font-serif text-white uppercase tracking-wider">Contact Boutique</h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <span>{shopAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{phoneDisplay}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{shopEmail}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {currentYear} {shopName}. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>for fashion celebrations</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
