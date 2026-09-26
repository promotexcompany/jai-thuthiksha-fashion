import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useCustomerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const res = await login(email.trim(), password);

      if (res.success) {
        navigate('/catalogue');
      } else {
        setError(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError(
        err.message || 'Unable to log in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fffcf8] py-16 min-h-screen flex items-center justify-center px-4">

      <div className="max-w-md w-full bg-white rounded-3xl border border-pink-100 shadow-xl overflow-hidden">

        {/* Header */}
        <div className="p-8 bg-gradient-to-r from-pink-900 via-rose-900 to-amber-900 text-white text-center">

          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl mx-auto mb-3">
            👑
          </div>

          <h2 className="text-2xl font-bold font-serif">
            Welcome Back
          </h2>

          <p className="text-xs text-pink-200 mt-1">
            Sign in to access your saved rental wishlist & active bookings.
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-5"
        >

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Email Address
            </label>

            <div className="relative">

              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-pink-500"
              />

            </div>
          </div>

          {/* Password */}
          <div>

            <div className="flex justify-between items-center mb-1">

              <label className="block text-xs font-bold text-gray-700">
                Password
              </label>

            </div>

            <div className="relative">

              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-pink-500"
              />

            </div>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-btn text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
          >

            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In to Jai Thuthiksha</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}

          </button>

          {/* Register */}
          <p className="text-center text-xs text-gray-500 pt-4">

            Don't have an account?{' '}

            <Link
              to="/register"
              className="font-bold text-pink-700 hover:underline"
            >
              Create Renter Account
            </Link>

          </p>

        </form>

      </div>

    </div>
  );
};

export default Login;