import { useOutletContext } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { CategoryGrid } from '../components/CategoryGrid';
import { FeaturedProducts } from '../components/FeaturedProducts';
import type { Product } from '../types/fashion';

interface LayoutContextType {
  onQuickView: (product: Product) => void;
  onOpenAppointment: () => void;
}

export const Home: React.FC = () => {
  const { onQuickView, onOpenAppointment } = useOutletContext<LayoutContextType>();

  return (
    <div className="w-full">
      {/* Hero Banner Section */}
      <HeroSection onOpenAppointment={onOpenAppointment} />

      {/* 3 Categories Showcase */}
      <CategoryGrid />

      {/* Dress Gallery */}
      <FeaturedProducts onQuickView={onQuickView} />
    </div>
  );
};

export default Home;
