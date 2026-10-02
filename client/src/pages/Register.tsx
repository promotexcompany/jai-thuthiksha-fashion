import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useCustomerAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredStyle, setPreferredStyle] = useState('Bridal Lehenga');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(name.trim(), email.trim(), password);
      if (res.success) {
        navigate('/catalogue');
      } else {
        setError(res.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
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

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Radhika Sharma"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

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
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Primary Outfit Interest</label>
            <select
              value={preferredStyle}
              onChange={(e) => setPreferredStyle(e.target.value)}
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
            disabled={loading}
            className="w-full gradient-btn text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Renter Profile</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
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
