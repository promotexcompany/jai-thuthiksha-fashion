import { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle, User, Phone, Mail, Sparkles } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-pink-100">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-pink-900 via-rose-800 to-amber-900 text-white relative">
          <button
            onClick={handleReset}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Boutique Trial & Fitting Session
          </div>
          <h3 className="text-2xl font-bold font-serif">Book In-Person Trial</h3>
          <p className="text-xs text-pink-100 mt-1">
            Visit Jai Thuthiksha Fashion for personalized styling & bridal trial fitting.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">Appointment Confirmed!</h4>
            <p className="text-sm text-gray-600">
              Thank you, <span className="font-semibold text-pink-700">{formData.name}</span>. Our bridal master stylist has reserved your slot on{' '}
              <span className="font-semibold text-gray-900">{formData.date || 'your selected date'}</span> ({formData.timeSlot}).
            </p>
            <div className="bg-pink-50 p-4 rounded-xl text-xs text-pink-900 text-left space-y-1">
              <p className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-pink-700" />
                Jai Thuthiksha Fashion Boutique
              </p>
              <p>No. 42, Designer Avenue, T. Nagar, Chennai, Tamil Nadu 600017</p>
              <p>Phone support: +91 98765 43210</p>
            </div>
            <button
              onClick={handleReset}
              className="mt-4 px-8 py-3 bg-pink-700 text-white rounded-xl font-bold hover:bg-pink-800 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Radhika Sharma"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Appointment Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Time Slot</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  >
                    <option>10:00 AM - 12:00 PM</option>
                    <option>12:00 PM - 02:00 PM</option>
                    <option>02:00 PM - 04:00 PM</option>
                    <option>04:00 PM - 06:00 PM</option>
                    <option>06:00 PM - 08:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Occasion</label>
                <select
                  value={formData.occasion}
                  onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                >
                  <option>Bridal Wedding</option>
                  <option>Reception</option>
                  <option>Sangeet / Mehendi</option>
                  <option>Festival / Party</option>
                  <option>Photoshoot</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Outfit Interest</label>
                <select
                  value={formData.preferredCategory}
                  onChange={(e) => setFormData({ ...formData, preferredCategory: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                >
                  <option>Bridal Lehenga</option>
                  <option>Kanjeevaram Saree</option>
                  <option>Indo-Western Gown</option>
                  <option>Mens Sherwani</option>
                  <option>Jewelry Set</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full gradient-btn text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition mt-4"
            >
              Confirm Appointment Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
