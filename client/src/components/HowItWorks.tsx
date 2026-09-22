import { Calendar, Scissors, Truck, RefreshCw } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Select Outfit & Dates',
      description: 'Choose your designer outfit and reserve for 4 or 8 days. We deliver 1 day before your event.',
      icon: Calendar,
      color: 'bg-pink-100 text-pink-800'
    },
    {
      step: '02',
      title: 'Custom Measurement Fitting',
      description: 'Submit your measurements online or visit our T. Nagar boutique for custom tailoring.',
      icon: Scissors,
      color: 'bg-amber-100 text-amber-800'
    },
    {
      step: '03',
      title: 'Steam Sanitized Delivery',
      description: 'Receive your outfit dry cleaned, steam sanitized, and pristine in protective garment bags.',
      icon: Truck,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      step: '04',
      title: 'Flaunt & Free Return',
      description: 'Shine at your celebration! Simply place in our return bag; we handle pickup & dry cleaning.',
      icon: RefreshCw,
      color: 'bg-emerald-100 text-emerald-800'
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-700 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
            Hassle-Free Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-gray-900 tracking-tight">
            How Jai Thuthiksha Fashion Rental Works
          </h2>
          <p className="text-sm text-gray-600">
            Enjoy luxury high-end bridal & designer wear in 4 simple seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-gray-50/80 p-8 rounded-3xl border border-pink-100/60 shadow-sm hover:shadow-md transition text-center flex flex-col items-center"
              >
                <div className="absolute top-4 right-4 text-2xl font-black font-serif text-gray-200">
                  {item.step}
                </div>

                <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-6 shadow-inner`}>
                  <IconComp className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">
                  {item.title}
                </h3>
                
                <p className="text-xs text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
