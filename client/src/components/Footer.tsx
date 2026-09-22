import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ShieldCheck, Share2 } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { SHOP_CONFIG } from '../config/shopConfig';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800 relative overflow-hidden">
      
      {/* Decorative gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-pink-900/30 via-amber-600/20 to-purple-900/30 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-slate-700/60 p-1.5 flex items-center justify-center shrink-0">
                <img src={logoImg} alt={SHOP_CONFIG.SHOP_NAME} className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-bold font-serif text-white tracking-wide">
                {SHOP_CONFIG.SHOP_NAME}
              </span>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              South India’s premier luxury bridal and ethnic designer wear rental boutique. Experience haute couture bridal lehengas, handwoven silk sarees, and groom sherwanis for every grand celebration.
            </p>

            <div className="flex items-center gap-3 text-xs text-amber-300 bg-slate-900/80 border border-slate-800 p-3 rounded-xl max-w-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Medical-grade 5-Stage Dry Cleaned & Steam Sanitized Outfits</span>
            </div>

            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-pink-400 hover:bg-pink-950 hover:text-white transition" title="Share & Social">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase font-serif">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-pink-400 transition">Home</Link></li>
              <li><Link to="/catalogue" className="hover:text-pink-400 transition">Browse Catalogue</Link></li>
              <li><Link to="/about" className="hover:text-pink-400 transition">About Our Boutique</Link></li>
              <li><Link to="/contact" className="hover:text-pink-400 transition">Book Fitting Appointment</Link></li>
              <li><Link to="/login" className="hover:text-pink-400 transition">Customer Sign In</Link></li>
            </ul>
          </div>

          {/* Rental Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase font-serif">Collections</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/catalogue?cat=bridal" className="hover:text-pink-400 transition">Bridal Lehengas</Link></li>
              <li><Link to="/catalogue?cat=sarees" className="hover:text-pink-400 transition">Kanjeevaram Sarees</Link></li>
              <li><Link to="/catalogue?cat=indo-western" className="hover:text-pink-400 transition">Indo-Western & Gowns</Link></li>
              <li><Link to="/catalogue?cat=menswear" className="hover:text-pink-400 transition">Groom Sherwanis</Link></li>
              <li><Link to="/catalogue?cat=jewelry" className="hover:text-pink-400 transition">Bridal Kundan Jewelry</Link></li>
            </ul>
          </div>

          {/* Boutique Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase font-serif">Boutique Address</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-pink-500 shrink-0 mt-1" />
                <span>{SHOP_CONFIG.SHOP_ADDRESS}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{SHOP_CONFIG.SHOP_PHONE_DISPLAY}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>rentals@jaithuthiksha.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Jai Thuthiksha Fashion. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition">Rental Terms & Conditions</a>
            <a href="#" className="hover:text-slate-400 transition">Sanitization Standard</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
