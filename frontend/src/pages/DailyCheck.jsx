import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import api from '../api';

export default function DailyCheck() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    systolic_bp: 120,
    diastolic_bp: 80,
    heart_rate: 72,
    spo2: 98,
    blood_sugar: 110
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/tracking/vitals', formData);
      setSaved(true);
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      console.error('Failed to submit vitals', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-6">
      <div className="bg-[var(--color-cardio-primary)] text-white px-4 py-6 flex items-center shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-semibold">Daily Check</h1>
        </div>
        <button
          onClick={() => navigate('/weekly-summary')}
          className="p-2 active:scale-90 transition-transform"
          title="View Weekly Summary"
        >
          <BarChart2 size={24} />
        </button>
      </div>

      <div className="p-6">
        <p className="text-slate-500 mb-6 font-medium">Fill in today's vitals to keep your Digital Twin updated</p>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Today's vitals</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Blood Pressure (mmHg)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  value={formData.systolic_bp}
                  onChange={(e) => setFormData({...formData, systolic_bp: parseInt(e.target.value) || ''})}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-center text-lg text-slate-800 focus:border-[var(--color-cardio-primary)] focus:outline-none" 
                />
                <span className="text-slate-300 text-2xl font-light">/</span>
                <input 
                  type="number" 
                  value={formData.diastolic_bp}
                  onChange={(e) => setFormData({...formData, diastolic_bp: parseInt(e.target.value) || ''})}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-center text-lg text-slate-800 focus:border-[var(--color-cardio-primary)] focus:outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Heart rate (bpm)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={formData.heart_rate}
                  onChange={(e) => setFormData({...formData, heart_rate: parseInt(e.target.value) || ''})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg text-slate-800 focus:border-[var(--color-cardio-primary)] focus:outline-none" 
                />
                <span className="absolute right-4 top-3.5 text-slate-400 font-medium">bpm</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">SpO2 (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={formData.spo2}
                  onChange={(e) => setFormData({...formData, spo2: parseInt(e.target.value) || ''})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg text-slate-800 focus:border-[var(--color-cardio-primary)] focus:outline-none" 
                />
                <span className="absolute right-4 top-3.5 text-slate-400 font-medium">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Blood sugar (mg/dL)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={formData.blood_sugar}
                  onChange={(e) => setFormData({...formData, blood_sugar: parseInt(e.target.value) || ''})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg text-slate-800 focus:border-[var(--color-cardio-primary)] focus:outline-none" 
                />
                <span className="absolute right-4 top-3.5 text-slate-400 font-medium">mg/dL</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4">How do you feel today?</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="flex-shrink-0 px-6 py-3 rounded-full border-2 border-[var(--color-cardio-primary)] text-[var(--color-cardio-primary)] font-bold bg-green-50">Great</button>
            <button className="flex-shrink-0 px-6 py-3 rounded-full border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Okay</button>
            <button className="flex-shrink-0 px-6 py-3 rounded-full border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Tired</button>
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || saved}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-md active:scale-95 transition-all ${saved ? 'bg-green-500 text-white' : 'bg-[var(--color-cardio-primary)] text-white disabled:opacity-70'}`}
          >
            {saved ? '✓ Vitals Saved!' : isSubmitting ? 'Saving...' : 'Save Vitals'}
          </button>
        </div>

      </div>
    </div>
  );
}
