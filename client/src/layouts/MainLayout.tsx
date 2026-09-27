import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { AppointmentModal } from '../components/AppointmentModal';
import { QuickViewModal } from '../components/QuickViewModal';
import type { CategoryOffer, Product } from '../types/fashion';
import { api } from '../services/api';

export interface MainLayoutContextType {
  onQuickView: (product: Product) => void;
  onOpenAppointment: () => void;
  offers: CategoryOffer[];
  refreshOffers: () => void;
  settings: any;
  refreshSettings: () => void;
}

export const MainLayout: React.FC = () => {
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [offers, setOffers] = useState<CategoryOffer[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchOffers();
    fetchSettings();
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#fffcf8] text-gray-900 font-sans">
      
      {/* Navigation Header */}
      <Navbar
        onOpenAppointment={() => setIsAppointmentOpen(true)}
        settings={settings}
      />

      {/* Main Page Outlet */}
      <main className="flex-1">
        <Outlet context={{
          onQuickView: (product: Product) => setQuickViewProduct(product),
          onOpenAppointment: () => setIsAppointmentOpen(true),
          offers,
          refreshOffers: fetchOffers,
          settings,
          refreshSettings: fetchSettings
        }} />
      </main>

      {/* Trial Appointment Booking Modal */}
      <AppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        settings={settings}
      />

      {/* Quick View Outfit Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        offers={offers}
        settings={settings}
      />
    </div>
  );
};
