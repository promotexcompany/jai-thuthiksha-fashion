import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { QuickViewModal } from '../components/QuickViewModal';
import { AppointmentModal } from '../components/AppointmentModal';
import type { CategoryOffer, Product } from '../types/fashion';
import { api } from '../services/api';

export interface MainLayoutContextType {
  onQuickView: (product: Product) => void;
  offers: CategoryOffer[];
  refreshOffers: () => void;
  settings: any;
  refreshSettings: () => void;
}

export const MainLayout: React.FC = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [offers, setOffers] = useState<CategoryOffer[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);

  const fetchOffers = async () => {
    try {
      const data = await api.getPublicOffers();
      if (Array.isArray(data)) {
        setOffers(data);
      }
    } catch (err) {
      console.error('Failed to fetch public offers:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch public settings:', err);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080B18] text-slate-100 font-sans relative overflow-x-hidden selection:bg-[#D95C91] selection:text-white">
      
      {/* =========================================================
          MULTI-LAYER LIVE WALLPAPER BACKGROUND ATMOSPHERE
         ========================================================= */}

      {/* Layer 1 & 2: Base Midnight Navy + Flowing Aurora Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#080B18] via-[#11102B]/60 to-[#080B18]" />
        
        {/* Animated Aurora Flow Layer */}
        <div className="absolute inset-[-50%] bg-[radial-gradient(circle_at_50%_50%,_rgba(56,32,107,0.35),_rgba(82,109,206,0.15),_rgba(217,92,145,0.12),_transparent_70%)] blur-[90px] pointer-events-none animate-aurora z-0" />
      </div>

      {/* Layer 3: Floating Ambient Light Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Orb 1: Deep Indigo & Royal Violet (Top-Left) */}
        <div className="absolute top-[-10%] left-[-10%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-[#38206B]/35 via-[#11102B]/30 to-transparent blur-[140px] animate-orb-1" />
        
        {/* Orb 2: Champagne Gold & Soft Rose Glow (Top-Right) */}
        <div className="absolute top-[5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#D95C91]/18 via-[#D6B36A]/12 to-transparent blur-[130px] animate-orb-2" />
        
        {/* Orb 3: Subtle Electric Blue & Royal Violet (Center-Right) */}
        <div className="absolute top-[45%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-l from-[#526DCE]/20 via-[#38206B]/25 to-transparent blur-[150px] animate-orb-3" />
        
        {/* Orb 4: Champagne Gold & Muted Indigo (Bottom-Left) */}
        <div className="absolute bottom-[-10%] left-[15%] w-[550px] h-[550px] rounded-full bg-gradient-to-t from-[#D6B36A]/15 via-[#38206B]/20 to-transparent blur-[130px] animate-orb-4" />
      </div>

      {/* Layer 4: Subtle Drifting Micro-Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[25%] left-[15%] w-1.5 h-1.5 rounded-full bg-[#D6B36A]/40 blur-[1px] animate-particle-1" />
        <div className="absolute top-[40%] right-[20%] w-2 h-2 rounded-full bg-[#D95C91]/40 blur-[1px] animate-particle-2" />
        <div className="absolute top-[65%] left-[30%] w-1 h-1 rounded-full bg-[#526DCE]/50 blur-[1px] animate-particle-3" />
        <div className="absolute top-[80%] right-[35%] w-2 h-2 rounded-full bg-[#D6B36A]/45 blur-[1px] animate-particle-4" />
        <div className="absolute top-[15%] right-[40%] w-1.5 h-1.5 rounded-full bg-[#D95C91]/45 blur-[1px] animate-particle-5" />
      </div>

      {/* =========================================================
          LAYER 5: EXISTING WEBSITE CONTENT & UI PANELS
         ========================================================= */}

      {/* Global Navbar */}
      <div className="relative z-40">
        <Navbar
          onOpenAppointment={() => setIsAppointmentOpen(true)}
          settings={settings}
        />
      </div>

      {/* Main Outlet */}
      <main className="flex-1 relative z-10">
        <Outlet context={{
          onQuickView: (product: Product) => setQuickViewProduct(product),
          offers,
          refreshOffers: fetchOffers,
          settings,
          refreshSettings: fetchSettings
        }} />
      </main>

      {/* Global Footer */}
      <div className="relative z-20">
        <Footer settings={settings} />
      </div>

      {/* Quick View Dress Lightbox Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        offers={offers}
        settings={settings}
      />

      {/* Boutique Appointment Fitting Modal */}
      <AppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        settings={settings}
      />
    </div>
  );
};
