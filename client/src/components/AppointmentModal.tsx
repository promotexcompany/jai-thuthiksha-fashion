import { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle, User, Phone, Mail, Sparkles } from 'lucide-react';
import { SHOP_CONFIG } from '../config/shopConfig';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: any;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, settings }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    timeSlot: '11:00 AM - 01:00 PM',
    occasion: 'Bridal Wedding',
    preferredCategory: 'Bridal Lehenga'
  });

  if (!isOpen) return null;

  const shopName = settings?.shopName || SHOP_CONFIG.SHOP_NAME;
  const shopAddress = settings?.shopAddress || SHOP_CONFIG.SHOP_ADDRESS;
  const phoneDisplay = settings?.phoneDisplay || SHOP_CONFIG.SHOP_PHONE_DISPLAY;
  const trialTitle = settings?.trialTitle || 'Boutique Trial & Fitting Session';
  const trialDescription = settings?.trialDescription || 'Visit Jai Thuthiksha Fashion for personalized styling & trial fitting.';
  const availabilityInfo = settings?.trialAvailabilityInfo || 'Monday - Saturday: 10:00 AM - 8:30 PM';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-[#0e0c1e] text-slate-100 rounded-3xl max-w-lg w-full shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden border border-white/15 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-pink-950/90 via-rose-950/90 to-purple-950/90 text-white relative border-b border-white/10">
          <button
            onClick={handleReset}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            {trialTitle}
          </div>
          <h3 className="text-2xl font-bold font-serif gradient-text">Book Fitting Session</h3>
          <p className="text-xs text-slate-300 mt-1">
            {trialDescription}
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-white font-serif">Appointment Confirmed!</h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Thank you, <span className="font-semibold text-pink-400">{formData.name}</span>. Our master stylist has reserved your slot on{' '}
              <span className="font-semibold text-white">{formData.date || 'your selected date'}</span> ({formData.timeSlot}).
            </p>
            <div className="glass-pill p-4 rounded-2xl text-xs text-slate-300 text-left space-y-1 border border-white/10">
              <p className="font-semibold text-sm mb-2 flex items-center gap-1.5 text-white">
                <MapPin className="w-4 h-4 text-pink-400" />
                {shopName} Boutique
              </p>
              <p>{shopAddress}</p>
              <p>Phone support: {phoneDisplay}</p>
              <p className="text-[11px] text-pink-300 font-medium pt-1">Hours: {availabilityInfo}</p>
            </div>
            <button
              onClick={handleReset}
              className="mt-4 px-8 py-3 rounded-full gradient-vibrant-btn text-xs font-bold shadow-lg cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-pill text-white text-sm focus:border-pink-500/60 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Mobile number"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-pill text-white text-sm focus:border-pink-500/60 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-pill text-white text-sm focus:border-pink-500/60 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Appointment Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-pill text-white text-sm focus:border-pink-500/60 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Time Slot</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-pill text-white bg-[#0e0c1e] text-sm focus:border-pink-500/60 outline-none"
                  >
                    <option className="bg-[#0e0c1e] text-white">10:00 AM - 12:00 PM</option>
                    <option className="bg-[#0e0c1e] text-white">12:00 PM - 02:00 PM</option>
                    <option className="bg-[#0e0c1e] text-white">02:00 PM - 04:00 PM</option>
                    <option className="bg-[#0e0c1e] text-white">04:00 PM - 06:00 PM</option>
                    <option className="bg-[#0e0c1e] text-white">06:00 PM - 08:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Occasion</label>
                <select
                  value={formData.occasion}
                  onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl glass-pill text-white bg-[#0e0c1e] text-sm focus:border-pink-500/60 outline-none"
                >
                  <option className="bg-[#0e0c1e] text-white">Bridal Wedding</option>
                  <option className="bg-[#0e0c1e] text-white">Reception</option>
                  <option className="bg-[#0e0c1e] text-white">Sangeet / Mehendi</option>
                  <option className="bg-[#0e0c1e] text-white">Festival / Party</option>
                  <option className="bg-[#0e0c1e] text-white">Photoshoot</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Outfit Interest</label>
                <select
                  value={formData.preferredCategory}
                  onChange={(e) => setFormData({ ...formData, preferredCategory: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl glass-pill text-white bg-[#0e0c1e] text-sm focus:border-pink-500/60 outline-none"
                >
                  <option className="bg-[#0e0c1e] text-white">Bridal Lehenga</option>
                  <option className="bg-[#0e0c1e] text-white">Kanjeevaram Saree</option>
                  <option className="bg-[#0e0c1e] text-white">Indo-Western Gown</option>
                  <option className="bg-[#0e0c1e] text-white">Mens Sherwani</option>
                  <option className="bg-[#0e0c1e] text-white">Jewelry Set</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full gradient-vibrant-btn py-3.5 rounded-xl font-bold text-sm shadow-xl transition mt-4 cursor-pointer"
            >
              Confirm Appointment Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
