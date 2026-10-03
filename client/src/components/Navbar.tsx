import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Menu, X, PhoneCall, User, Camera, Crown, Heart } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { SHOP_CONFIG } from '../config/shopConfig';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface NavbarProps {
  onOpenAppointment: () => void;
  settings?: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAppointment,
  settings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { customerUser, isAuthenticated, logout } = useCustomerAuth();

  const shopName = settings?.shopName || SHOP_CONFIG.SHOP_NAME;
  // If shopLogo contains static unbundled '/assets/logo.png', use bundled logoImg fallback
  const shopLogo = (settings?.shopLogo && !settings.shopLogo.includes('/assets/logo.png')) ? settings.shopLogo : logoImg;

  const handleCustomerLogout = () => {
    logout();
  };

  const navLinks = [
    { name: 'Photoshoot', path: '/catalogue?cat=photoshoot', icon: Camera },
    { name: 'Reception', path: '/catalogue?cat=reception', icon: Crown },
    { name: 'Bridesmaid', path: '/catalogue?cat=bridesmaid', icon: Heart },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' && !location.search;
    return location.pathname + location.search === path;
  };

  const whatsappNumber = settings?.whatsappNumber || SHOP_CONFIG.SHOP_WHATSAPP_NUMBER;
  const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(`Hi ${shopName}, I'm browsing your boutique collections.`)}`;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0914]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-300">

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">

          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3.5 group shrink-0 min-w-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 shrink-0 flex items-center justify-center p-1 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 group-hover:border-pink-500/50 group-hover:scale-105 transition duration-300 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
              <img
                src={shopLogo}
                alt={shopName}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = logoImg;
                }}
                className="h-full w-full object-contain filter drop-shadow"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm xs:text-base sm:text-xl md:text-2xl font-bold font-serif tracking-tight gradient-text truncate">
                {shopName}
              </span>
              <span className="text-[8px] xs:text-[9px] sm:text-[10px] tracking-widest uppercase font-semibold gradient-gold-text -mt-0.5 truncate">
                Luxury Boutique
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 text-sm font-semibold transition-all duration-300 relative py-1 ${isActive(link.path)
                    ? 'text-pink-400 font-bold'
                    : 'text-slate-300 hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4 text-pink-400/80" />
                  <span>{link.name}</span>
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full gradient-vibrant-btn text-[11px] sm:text-xs font-bold shadow-md hover:shadow-pink-500/25 transition duration-300 whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span>
                <span className="hidden min-[380px]:inline">WhatsApp</span>
                <span className="hidden sm:inline"> Contact</span>
              </span>
            </a>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none rounded-xl glass-pill shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation (Compact & Balanced) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0b1a]/95 backdrop-blur-2xl border-b border-white/10 px-3.5 pt-2 pb-4 space-y-1.5 shadow-2xl max-h-[calc(100vh-4.5rem)] overflow-y-auto animate-fadeIn">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 py-2 px-3 text-sm font-semibold rounded-xl transition ${isActive(link.path)
                  ? 'bg-pink-500/20 text-pink-300 font-bold border border-pink-500/40'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4 text-pink-400 shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAppointment();
              }}
              className="w-full py-2.5 rounded-xl border border-pink-500/40 text-pink-300 font-bold text-xs flex items-center justify-center gap-2 bg-pink-500/10 hover:bg-pink-500/20 transition"
            >
              <Calendar className="w-4 h-4 text-pink-400" />
              Book Fitting Session
            </button>

            {isAuthenticated && customerUser ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <User className="w-3.5 h-3.5 text-pink-400" />
                  <span>{customerUser.name}</span>
                </div>
                <button
                  onClick={() => {
                    handleCustomerLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-rose-400 hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-xl glass-pill text-slate-200 font-semibold text-xs hover:bg-white/10 transition"
              >
                Account Login / Register
              </Link>
            )}
          </div>
        </div>
      )}

    </header>
  );
};

export default Navbar;
