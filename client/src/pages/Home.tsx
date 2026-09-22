import { useOutletContext, useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { CategoryGrid } from '../components/CategoryGrid';
import { HowItWorks } from '../components/HowItWorks';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { Testimonials } from '../components/Testimonials';
import { FAQSection } from '../components/FAQSection';
import type { Product } from '../types/fashion';
import { Sparkles, Calendar, MapPin } from 'lucide-react';

interface LayoutContextType {
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, startDate: string, duration: 4 | 8) => void;
  onOpenAppointment: () => void;
}

export const Home: React.FC = () => {
  const { onQuickView, onOpenAppointment } = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Hero Banner Section */}
      <HeroSection onOpenAppointment={onOpenAppointment} />

      {/* Categories Showcase */}
      <CategoryGrid />

      {/* How Rental Works */}
      <HowItWorks />

      {/* Featured Outfits Grid */}
      <FeaturedProducts onQuickView={onQuickView} />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Customer Reviews */}
      <Testimonials />

      {/* FAQ Accordion */}
      <FAQSection />

      {/* In-Person Boutique CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-pink-900 via-rose-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-4 py-1.5 rounded-full text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Visit Our T. Nagar Flagship Boutique</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-serif tracking-tight">
            Prefer trying on outfits in person before renting?
          </h2>

          <p className="text-pink-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Schedule a VIP fitting session with our bridal fashion stylists. Walk into our boutique, try our full range of 200+ exclusive designer outfits, and get custom measurement fittings on the spot.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenAppointment}
              className="px-8 py-4 rounded-xl gradient-btn text-white font-bold text-sm shadow-xl hover:shadow-2xl transition flex items-center gap-2"
            >
              <Calendar className="w-5 h-5 text-amber-300" />
              <span>Book Free Boutique Trial Appointment</span>
            </button>

            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition flex items-center gap-2"
            >
              <MapPin className="w-5 h-5 text-pink-300" />
              <span>Get Directions to Boutique</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
