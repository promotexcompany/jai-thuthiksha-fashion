import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    preferredStyle: 'Bridal Lehenga',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/catalogue');
  };

  return (
    <div className="bg-[#fffcf8] py-16 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-pink-100 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-8 bg-gradient-to-r from-pink-900 via-rose-900 to-amber-900 text-white text-center">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl mx-auto mb-3">
            👑
          </div>
          <h2 className="text-2xl font-bold font-serif">Create Account</h2>
          <p className="text-xs text-pink-200 mt-1">
            Join Jai Thuthiksha Fashion & enjoy exclusive rental offers.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Radhika Sharma"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765..."
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Primary Outfit Interest</label>
            <select
              value={formData.preferredStyle}
              onChange={(e) => setFormData({ ...formData, preferredStyle: e.target.value })}
              className="w-full py-3 px-3 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option>Bridal Lehenga</option>
              <option>Kanjeevaram Silk Saree</option>
              <option>Indo-Western Gown</option>
              <option>Groom Sherwani</option>
              <option>Bridal Jewelry Set</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full gradient-btn text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-4"
          >
            <span>Create Renter Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-xs text-gray-500 pt-4">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-pink-700 hover:underline">
              Sign In
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
};

export default Register;
