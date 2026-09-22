import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'renter' | 'partner'>('renter');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication
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
          <h2 className="text-2xl font-bold font-serif">Welcome Back</h2>
          <p className="text-xs text-pink-200 mt-1">
            Sign in to access your saved rental wishlist & active bookings.
          </p>
        </div>

        {/* User Type Switcher */}
        <div className="p-2 bg-gray-50 border-b border-gray-100 flex text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setUserType('renter')}
            className={`flex-1 py-2 rounded-xl transition ${
              userType === 'renter'
                ? 'bg-white text-pink-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Renter / Bride Login
          </button>
          <button
            type="button"
            onClick={() => setUserType('partner')}
            className={`flex-1 py-2 rounded-xl transition ${
              userType === 'partner'
                ? 'bg-white text-pink-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Stylist / Designer Partner
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-700">Password</label>
              <a href="#" className="text-[11px] text-pink-700 hover:underline">Forgot?</a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full gradient-btn text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-4"
          >
            <span>Sign In to Jai Thuthiksha</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-xs text-gray-500 pt-4">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-pink-700 hover:underline">
              Create Renter Account
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
};

export default Login;
