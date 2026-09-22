import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { AppointmentModal } from '../components/AppointmentModal';
import { QuickViewModal } from '../components/QuickViewModal';
import type { CartItem, Product } from '../types/fashion';

export const MainLayout: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleAddToCart = (
    product: Product,
    selectedSize: string,
    startDate: string,
    durationDays: 4 | 8
  ) => {
    const price = durationDays === 4 ? product.rentalPrice4Days : product.rentalPrice8Days;
    const newItem: CartItem = {
      product,
      selectedSize,
      startDate: startDate || new Date().toISOString().split('T')[0],
      durationDays,
      totalPrice: price,
    };

    setCartItems((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fffcf8] text-gray-900 font-sans">
      
      {/* Navigation Header */}
      <Navbar
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAppointment={() => setIsAppointmentOpen(true)}
      />

      {/* Main Page Outlet */}
      <main className="flex-1">
        <Outlet context={{
          onQuickView: (product: Product) => setQuickViewProduct(product),
          onAddToCart: handleAddToCart,
          onOpenAppointment: () => setIsAppointmentOpen(true)
        }} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
      />

      {/* Trial Appointment Booking Modal */}
      <AppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
      />

      {/* Quick View Outfit Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};
