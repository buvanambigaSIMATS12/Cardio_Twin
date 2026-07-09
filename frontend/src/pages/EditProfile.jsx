import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, Activity, Save, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    age: user?.age || '',
    gender: user?.gender || 'Male'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/me', {
        ...formData,
        age: parseInt(formData.age, 10)
      });
      // Update local storage via context
      const token = localStorage.getItem('token');
      login(token, res.data);
      navigate(-1);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white px-4 py-4 flex items-center shadow-sm border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="text-xl font-bold ml-2">Edit Profile</h1>
      </div>

      <div className="p-6 flex-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User size={20} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[var(--color-cardio-primary)] focus:ring-1 focus:ring-[var(--color-cardio-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[var(--color-cardio-primary)] focus:ring-1 focus:ring-[var(--color-cardio-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Age</label>
                <div className="relative">
                  <Calendar size={20} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="number"
                    name="age"
                    required
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[var(--color-cardio-primary)] focus:ring-1 focus:ring-[var(--color-cardio-primary)]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                <div className="relative">
                  <Activity size={20} className="absolute left-4 top-3.5 text-slate-400" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[var(--color-cardio-primary)] focus:ring-1 focus:ring-[var(--color-cardio-primary)] appearance-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-cardio-primary)] text-white py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-2 mt-8"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <><Save size={24} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
