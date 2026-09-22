import { ShieldCheck, Scissors, PiggyBank, Clock } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const benefits = [
    {
      title: 'Pristine Hygiene & Sanitization',
      description: 'Every outfit undergoes a 5-stage eco-friendly dry cleaning and steam sanitization before being sealed in protective garment bags.',
      icon: ShieldCheck,
      badge: 'Hospital-Grade Clean'
    },
    {
      title: 'Tailored Fit Guarantee',
      description: 'Our in-house master tailors custom alter blouses, waistbands, and lengths according to your exact measurements.',
      icon: Scissors,
      badge: 'Custom Alterations'
    },
    {
      title: 'Save up to 80% on Couture',
      description: 'Wear ₹90,000+ designer bridal lehengas and pure silk sarees starting at just ₹2,999. Smart luxury fashion.',
      icon: PiggyBank,
      badge: 'Affordable Luxury'
    },
    {
      title: 'Hassle-Free Doorstep Pickup',
      description: 'We deliver 1 day prior to your event and handle return pickup directly from your doorstep. Zero dry cleaning needed from your side.',
      icon: Clock,
      badge: 'Free Return Pickup'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-pink-50/50 border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-700 bg-pink-100/80 px-3 py-1 rounded-full border border-pink-200">
            The JTF Difference
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-gray-900 tracking-tight">
            Why Rent from Jai Thuthiksha Fashion?
          </h2>
          <p className="text-sm text-gray-600">
            We redefine rental fashion with unmatched quality, immaculate hygiene, and personal boutique service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="bg-white p-7 rounded-3xl border border-pink-100 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-700 to-amber-600 text-white flex items-center justify-center mb-5 shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <span className="inline-block bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2">
                    {b.badge}
                  </span>

                  <h3 className="text-lg font-bold font-serif text-gray-900 mb-2">
                    {b.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
