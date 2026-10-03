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
  const shopLogo = settings?.shopLogo || logoImg;

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
    <header className="sticky top-0 z-40 w-full bg-[#0a0914]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-300">

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 flex items-center justify-center p-1 rounded-2xl bg-white/5 border border-white/10 group-hover:border-pink-500/50 group-hover:scale-105 transition duration-300 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
              <img
                src={shopLogo}
                alt={shopName}
                className="h-full w-full object-contain filter drop-shadow"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold font-serif tracking-tight gradient-text">
                {shopName}
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold gradient-gold-text -mt-1">
                Luxury Boutique
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-7">
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
          <div className="flex items-center space-x-3 sm:space-x-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full gradient-vibrant-btn text-xs font-bold shadow-md hover:shadow-pink-500/25 transition duration-300"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Contact on WhatsApp</span>
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none rounded-xl glass-pill"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0b1a]/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-fadeIn">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 py-2.5 text-base font-medium rounded-xl px-4 transition ${isActive(link.path)
                  ? 'bg-pink-500/20 text-pink-300 font-bold border border-pink-500/40'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon className="w-5 h-5 text-pink-400" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAppointment();
              }}
              className="w-full py-3 rounded-xl border border-pink-500/40 text-pink-300 font-bold text-sm flex items-center justify-center gap-2 bg-pink-500/10 hover:bg-pink-500/20 transition"
            >
              <Calendar className="w-4 h-4 text-pink-400" />
              Book Fitting Session
            </button>

            {isAuthenticated && customerUser ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <User className="w-4 h-4 text-pink-400" />
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
                className="w-full text-center py-2.5 rounded-xl glass-pill text-slate-200 font-semibold text-sm hover:bg-white/10 transition"
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
