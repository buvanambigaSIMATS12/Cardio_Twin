import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Activity, Droplet, Heart, Wind, Zap } from 'lucide-react';
import api from '../api';

export default function DigitalTwin() {
  const navigate = useNavigate();
  const [twin, setTwin] = useState(null);
  const [formData, setFormData] = useState({
    systolic_bp: 120,
    diastolic_bp: 80,
    heart_rate: 72,
    spo2: 98,
    blood_sugar: 110
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/twin/detail').then(res => setTwin(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/tracking/vitals', formData);
      // Refresh twin after saving
      const res = await api.get('/twin/detail');
      setTwin(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to submit vitals', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!twin) return (
    <div className="flex h-[80vh] items-center justify-center">
      <RefreshCw className="animate-spin text-[var(--color-cardio-primary)]" size={32} />
    </div>
  );

  const riskColor = twin.risk_score > 50 ? '#ef4444' : twin.risk_score > 30 ? '#f97316' : '#3b82f6';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 overflow-x-hidden">
      <div className="bg-[var(--color-cardio-primary)] text-white px-4 pt-12 pb-6 shadow-sm">
        <h1 className="text-xl font-semibold text-center">Digital Twin</h1>
        <p className="text-white/70 text-xs text-center mt-1">Your real-time cardiac health model</p>
      </div>

      <div className="p-4 max-w-lg mx-auto w-full space-y-4">

        {/* Risk Score Visual */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="relative w-44 h-44 mb-3">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={riskColor}
                strokeWidth="10"
                strokeDasharray={`${(twin.risk_score / 100) * 314} 314`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Heart 
                size={32} 
                className="text-red-500 mb-1 animate-pulse" 
                style={{ animationDuration: `${60 / (formData.heart_rate || 72)}s` }}
                fill="currentColor"
              />
              <p className="text-3xl font-black text-slate-800 leading-none">{Math.round(twin.risk_score)}%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Risk Score</p>
            </div>
          </div>
          <h3 className="font-bold text-lg text-slate-800">{twin.state_description}</h3>
          <p className="text-xs text-slate-400 mt-1 text-center">
            {twin.risk_score > 50 ? '⚠️ High risk — see your doctor' : twin.risk_score > 30 ? '⚡ Moderate risk — monitor closely' : '✅ Low risk — keep it up!'}
          </p>
        </div>

        {/* Counterfactual Simulation */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-wider text-amber-400 uppercase">What-If Counterfactual Model</span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">No Treatment Projection</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            If current vitals ({formData.systolic_bp}/{formData.diastolic_bp} BP) remain unmanaged over 5 years, your projected cardiac risk trajectory jumps from <span className="font-bold text-white">{Math.round(twin.risk_score)}%</span> to <span className="font-black text-red-400">{Math.min(98, Math.round(twin.risk_score * 1.8))}%</span>.
          </p>
          <div className="pt-1">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Current ({Math.round(twin.risk_score)}%)</span>
              <span>Unmanaged Trajectory</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden flex">
              <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${twin.risk_score}%` }}></div>
              <div className="bg-red-500/80 h-full animate-pulse" style={{ width: `${Math.min(100 - twin.risk_score, twin.risk_score * 0.8)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Daily Vitals Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={20} className="text-[var(--color-cardio-primary)]" />
            <h2 className="font-bold text-lg text-slate-800">Today's Vitals</h2>
          </div>

          <div className="space-y-4">
            {/* Blood Pressure */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
                <Heart size={14} className="text-red-400" /> Blood Pressure (mmHg)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={formData.systolic_bp}
                  onChange={e => setFormData({ ...formData, systolic_bp: parseInt(e.target.value) || 0 })}
                  className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-center text-slate-800 font-bold focus:border-[var(--color-cardio-primary)] focus:outline-none"
                  placeholder="120"
                />
                <span className="text-slate-300 text-xl font-light">/</span>
                <input
                  type="number"
                  value={formData.diastolic_bp}
                  onChange={e => setFormData({ ...formData, diastolic_bp: parseInt(e.target.value) || 0 })}
                  className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-center text-slate-800 font-bold focus:border-[var(--color-cardio-primary)] focus:outline-none"
                  placeholder="80"
                />
              </div>
            </div>

            {/* Heart Rate */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
                <Zap size={14} className="text-orange-400" /> Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={formData.heart_rate}
                onChange={e => setFormData({ ...formData, heart_rate: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-center text-slate-800 font-bold focus:border-[var(--color-cardio-primary)] focus:outline-none"
              />
            </div>

            {/* SpO2 + Blood Sugar */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1 text-sm font-semibold text-slate-600 mb-2">
                  <Wind size={14} className="text-blue-400" /> SpO2 (%)
                </label>
                <input
                  type="number"
                  value={formData.spo2}
                  onChange={e => setFormData({ ...formData, spo2: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-center text-slate-800 font-bold focus:border-[var(--color-cardio-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-sm font-semibold text-slate-600 mb-2">
                  <Droplet size={14} className="text-purple-400" /> Sugar (mg/dL)
                </label>
                <input
                  type="number"
                  value={formData.blood_sugar}
                  onChange={e => setFormData({ ...formData, blood_sugar: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-center text-slate-800 font-bold focus:border-[var(--color-cardio-primary)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || saved}
            className={`mt-5 w-full py-4 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 ${saved ? 'bg-green-500' : 'bg-[var(--color-cardio-primary)]'}`}
          >
            {saved ? '✓ Vitals Saved & Twin Updated!' : isSubmitting ? 'Saving...' : 'Save Vitals & Update Twin'}
          </button>
        </div>

        {/* Phase 4 Twin Analytics Buttons */}
        <div className="grid grid-cols-2 gap-3 pb-8">
          <button
            onClick={() => navigate('/twin/timeline')}
            className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">
              <Activity size={20} />
            </div>
            <span className="font-bold text-sm text-slate-700">Risk Timeline</span>
          </button>
          <button
            onClick={() => navigate('/twin/insights')}
            className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <span className="font-bold text-sm text-slate-700">Twin Insights</span>
          </button>
        </div>
      </div>
    </div>
  );
}
