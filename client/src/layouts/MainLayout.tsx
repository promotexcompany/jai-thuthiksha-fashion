import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AppointmentModal } from '../components/AppointmentModal';
import { QuickViewModal } from '../components/QuickViewModal';
import type { CategoryOffer, Product } from '../types/fashion';
import { api } from '../services/api';

export interface MainLayoutContextType {
  onQuickView: (product: Product) => void;
  onOpenAppointment: () => void;
  offers: CategoryOffer[];
  refreshOffers: () => void;
}

export const MainLayout: React.FC = () => {
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [offers, setOffers] = useState<CategoryOffer[]>([]);

  useEffect(() => {
    fetchOffers();
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

  return (
    <div className="min-h-screen flex flex-col bg-[#fffcf8] text-gray-900 font-sans">
      
      {/* Navigation Header */}
      <Navbar
        onOpenAppointment={() => setIsAppointmentOpen(true)}
      />

      {/* Main Page Outlet */}
      <main className="flex-1">
        <Outlet context={{
          onQuickView: (product: Product) => setQuickViewProduct(product),
          onOpenAppointment: () => setIsAppointmentOpen(true),
          offers,
          refreshOffers: fetchOffers
        }} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Trial Appointment Booking Modal */}
      <AppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
      />

      {/* Quick View Outfit Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        offers={offers}
      />
    </div>
  );
};
