import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Menu, X, Sparkles, PhoneCall, User } from 'lucide-react';
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
  const phoneDisplay = settings?.phoneDisplay || SHOP_CONFIG.SHOP_PHONE_DISPLAY;
  const shopAddress = settings?.shopAddress || SHOP_CONFIG.SHOP_ADDRESS;
  const shopLogo = settings?.shopLogo || logoImg;

  const handleCustomerLogout = () => {
    logout();
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Photoshoot', path: '/catalogue?cat=photoshoot' },
    { name: 'Reception', path: '/catalogue?cat=reception' },
    { name: 'Bridesmaid', path: '/catalogue?cat=bridesmaid' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname + location.search === path;
  };

  const whatsappNumber = settings?.whatsappNumber || SHOP_CONFIG.SHOP_WHATSAPP_NUMBER;
  const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(`Hi ${shopName}, I'm browsing your boutique collections.`)}`;

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm bg-white/95 backdrop-blur-md border-b border-pink-100">

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-900 via-rose-900 to-amber-900 text-white py-2 px-4 text-xs font-medium text-center flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-pink-200">
          <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
          <span>Call Support: {phoneDisplay}</span>
        </div>

        <div className="mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span className="tracking-wide">
            ✨ <strong className="text-amber-200">{shopName}</strong> — Exclusive Designer Outfit Collections
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-pink-200 text-[11px] truncate max-w-xs">
          <span>{shopAddress}</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 flex items-center justify-center p-0.5 rounded-xl bg-pink-50/50 group-hover:scale-105 transition">
              <img
                src={shopLogo}
                alt={shopName}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold font-serif tracking-tight gradient-text">
                {shopName}
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-700 -mt-1">
                Boutique Collection
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold transition-colors duration-200 relative py-1 ${isActive(link.path)
                  ? 'text-pink-700 font-bold'
                  : 'text-gray-700 hover:text-pink-600'
                  }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-600 to-amber-500 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Contact on WhatsApp</span>
            </a>

            <Link
              to="/admin"
              className="text-xs font-bold text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              Admin Portal
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-pink-700 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-pink-100 px-4 pt-2 pb-6 space-y-3 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 text-base font-medium rounded-lg px-3 ${isActive(link.path)
                ? 'bg-pink-50 text-pink-800 font-bold'
                : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAppointment();
              }}
              className="w-full py-2.5 rounded-xl border border-pink-400 text-pink-800 font-bold text-sm flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Boutique Fitting Session
            </button>

            {isAuthenticated && customerUser ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-pink-50 border border-pink-200">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <User className="w-4 h-4 text-pink-600" />
                  <span>{customerUser.name}</span>
                </div>
                <button
                  onClick={() => {
                    handleCustomerLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-gray-100 text-gray-800 font-semibold text-sm"
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
