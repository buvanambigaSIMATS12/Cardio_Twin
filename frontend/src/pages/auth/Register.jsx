import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: 'Male',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        age: parseInt(formData.age),
        gender: formData.gender
      });
      // Skip straight to login or onboarding
      // The user still needs to login to get a JWT.
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-[var(--color-cardio-primary)] text-white px-6 py-6 flex items-center shadow-sm">
        <button onClick={() => navigate(-1)} className="mr-4 active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold flex-1 text-center pr-8">Create account</h1>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto">
        <form onSubmit={handleRegister} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2">Full name</label>
            <input 
              type="text" 
              required
              value={formData.full_name}
              onChange={e => setFormData({...formData, full_name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 text-lg focus:outline-none focus:border-[var(--color-cardio-primary)]"
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-sm font-bold text-slate-500 mb-2">Age</label>
              <input 
                type="number" 
                required
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 text-lg focus:outline-none focus:border-[var(--color-cardio-primary)]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-500 mb-2">Gender</label>
              <div className="flex bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden p-1">
                {['Male', 'Female', 'Other'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({...formData, gender: g})}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-colors ${formData.gender === g ? 'bg-[var(--color-cardio-primary)] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2">Email</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 text-lg focus:outline-none focus:border-[var(--color-cardio-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 text-lg focus:outline-none focus:border-[var(--color-cardio-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2">Confirm password</label>
            <input 
              type="password" 
              required
              value={formData.confirm_password}
              onChange={e => setFormData({...formData, confirm_password: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 text-lg focus:outline-none focus:border-[var(--color-cardio-primary)]"
            />
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--color-cardio-primary)] text-white py-4 rounded-2xl font-bold text-lg shadow-md active:scale-95 transition-all disabled:opacity-70"
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
            <p className="text-center text-slate-500 text-sm mt-6 pb-6">
              Have account? <Link to="/login" className="text-[var(--color-cardio-primary)] font-bold hover:underline">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
