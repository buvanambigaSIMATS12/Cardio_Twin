import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.access_token, { 
        id: response.data.user_id, 
        name: response.data.full_name,
        full_name: response.data.full_name,
        email: response.data.email,
        age: response.data.age,
        gender: response.data.gender
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Green Header Area */}
      <div className="bg-[var(--color-cardio-primary)] text-white px-6 py-6 flex items-center shadow-sm">
        <button onClick={() => navigate(-1)} className="mr-4 active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold flex-1 text-center pr-8">Login</h1>
      </div>

      <div className="flex-1 px-6 pt-12 pb-6 flex flex-col">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h2>
          <p className="text-slate-500">Sign in to CardioTwin</p>
        </div>

        <form onSubmit={handleLogin} className="flex-1 flex flex-col">
          <div className="space-y-6">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email address</label>
              <input 
                type="email" 
                value={email}
                placeholder="you@email.com"
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-700 focus:outline-none focus:border-[var(--color-cardio-primary)] focus:ring-1 focus:ring-[var(--color-cardio-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  placeholder="••••••••"
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 pr-12 text-slate-700 focus:outline-none focus:border-[var(--color-cardio-primary)] focus:ring-1 focus:ring-[var(--color-cardio-primary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Link to="/forgot-password" className="text-[var(--color-cardio-primary)] text-sm font-medium hover:underline">
              Forgot password?
            </Link>
          </div>

          <div className="mt-auto pt-10 pb-4 flex flex-col items-center">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--color-cardio-primary)] text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg active:scale-95 transition-all mb-6 disabled:opacity-70"
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
            <p className="text-slate-500 text-sm">
              Don't have an account? <Link to="/register" className="text-[var(--color-cardio-primary)] font-bold hover:underline">Register</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
