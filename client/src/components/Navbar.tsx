import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Search, Menu, X, Sparkles, PhoneCall, User, LogOut } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { SHOP_CONFIG } from '../config/shopConfig';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface NavbarProps {
  onOpenAppointment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAppointment,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { customerUser, isAuthenticated, logout } = useCustomerAuth();

  const handleCustomerLogout = () => {
    logout();
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Catalogue & Rental', path: '/catalogue' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact & Store', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm bg-white/95 backdrop-blur-md border-b border-pink-100">

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-900 via-rose-900 to-amber-900 text-white py-2 px-4 text-xs font-medium text-center flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-pink-200">
          <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
          <span>Stylist Concierge: {SHOP_CONFIG.SHOP_PHONE_DISPLAY}</span>
        </div>

        <div className="mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span className="tracking-wide">
            ✨ <strong className="text-amber-200">Grand Rental Offer:</strong> Free Dry Cleaning & Custom Fitting on All Orders!
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-pink-200 text-[11px]">
          <span>Jaithuthiksha Fashion - Karur Bypass Road, Erode</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 flex items-center justify-center p-0.5 rounded-xl bg-pink-50/50 group-hover:scale-105 transition">
              <img
                src={logoImg}
                alt={SHOP_CONFIG.SHOP_NAME}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold font-serif tracking-tight gradient-text">
                {SHOP_CONFIG.SHOP_NAME}
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-700 -mt-1">
                Luxury Fashion Rental
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
          <div className="flex items-center space-x-3 sm:space-x-4">

            {/* Catalogue Search Link */}
            <Link
              to="/catalogue"
              className="p-2 text-gray-600 hover:text-pink-700 rounded-full hover:bg-pink-50 transition"
              title="Search Catalogue"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Book Trial Fitting Button */}
            <button
              onClick={onOpenAppointment}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border border-pink-300 text-pink-800 text-xs font-bold hover:bg-pink-50 transition"
            >
              <Calendar className="w-4 h-4 text-pink-600" />
              <span>Book Trial</span>
            </button>



            {/* Account Dynamic Authentication Button */}
            {isAuthenticated && customerUser ? (
              <div className="hidden sm:flex items-center gap-3 bg-pink-50/70 border border-pink-200/80 px-3 py-1.5 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <User className="w-4 h-4 text-pink-600" />
                  <span>{customerUser.name?.split(' ')[0] || 'Account'}</span>
                </div>

                <button
                  onClick={handleCustomerLogout}
                  className="text-xs font-semibold text-gray-500 hover:text-red-600 transition flex items-center gap-1 border-l border-pink-200 pl-2"
                  title="Logout Customer Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-gray-700 hover:text-pink-700 text-xs font-bold hover:bg-pink-50 transition border border-gray-200"
              >
                <User className="w-4 h-4 text-pink-600" />
                <span>Sign In</span>
              </Link>
            )}

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
