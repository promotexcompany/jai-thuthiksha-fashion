import { ShieldCheck, HeartHandshake, Scissors } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

interface LayoutContextType {
  onOpenAppointment: () => void;
}

export const About: React.FC = () => {
  const { onOpenAppointment } = useOutletContext<LayoutContextType>();

  return (
    <div className="bg-[#fffcf8] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-700 bg-pink-100/80 px-3 py-1 rounded-full border border-pink-200">
            Our Brand Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-gray-900 tracking-tight">
            Redefining Luxury Indian Designer Wear for Every Celebration
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Founded with a vision to make royal heritage bridal couture accessible, sustainable, and affordable. At Jai Thuthiksha Fashion, every outfit tells a story of craftsmanship, elegance, and timeless South Asian heritage.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800"
              alt="Boutique Craftsmen"
              className="w-full h-[450px] object-cover"
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-serif text-gray-900">
              Why Spend Lakhs for a Single Day? Rent Haute Couture.
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Modern brides and grooms shouldn’t have to choose between financial wisdom and looking like royalty. We house an exclusive collection of heavy zardozi lehengas, pure mulberry Kanjeevaram silk sarees, and velvet groom sherwanis.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-800 flex items-center justify-center shrink-0 font-bold">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Tailored Measurement Alterations</h4>
                  <p className="text-xs text-gray-500">In-house master tailors custom fit blouses, skirts, and sleeves to your exact silhouette.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Hospital-Grade Sanitization</h4>
                  <p className="text-xs text-gray-500">Every piece undergoes eco-friendly dry cleaning, UV sterilization, and high-pressure steam ironing.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 font-bold">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Personal Stylist Consultation</h4>
                  <p className="text-xs text-gray-500">Get 1-on-1 styling advice to pair outfits with matching Kundan jewelry, dupattas, and accessories.</p>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenAppointment}
              className="mt-4 px-8 py-3.5 rounded-xl gradient-btn text-white font-bold text-sm shadow-md hover:shadow-lg transition"
            >
              Book Boutique Fitting Session
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
