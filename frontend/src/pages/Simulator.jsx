import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Activity, Moon, Scale, Pill } from 'lucide-react';
import api from '../api';

export default function Simulator() {
  const navigate = useNavigate();
  const [twin, setTwin] = useState(null);
  const [sleep, setSleep] = useState(7);
  const [weight, setWeight] = useState(80);
  const [adherence, setAdherence] = useState(100);
  const [simRisk, setSimRisk] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/twin/detail').then(res => setTwin(res.data)).catch(console.error);
  }, []);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/twin/simulate', {
        sleep_hours: sleep,
        weight_kg: weight,
        med_adherence: adherence
      });
      setSimRisk(res.data.simulated_risk_score);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!twin) return (
    <div className="flex h-[80vh] items-center justify-center">
      <RefreshCw className="animate-spin text-[var(--color-cardio-primary)]" size={32} />
    </div>
  );

  const baseRisk = twin.risk_score;
  const displayRisk = simRisk !== null ? simRisk : baseRisk;
  const isWorse = simRisk !== null && simRisk > baseRisk;
  const isBetter = simRisk !== null && simRisk < baseRisk;
  const riskColor = displayRisk > 50 ? '#ef4444' : displayRisk > 30 ? '#f97316' : '#22c55e';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      <div className="bg-[var(--color-cardio-primary)] text-white px-4 pt-12 pb-6 shadow-sm">
        <h1 className="text-xl font-semibold text-center">Simulation Engine</h1>
        <p className="text-white/70 text-xs text-center mt-1">See how lifestyle changes impact your cardiac risk</p>
      </div>

      <div className="p-4 max-w-lg mx-auto w-full space-y-4">

        {/* Live Risk Preview */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={riskColor}
                strokeWidth="12"
                strokeDasharray={`${(displayRisk / 100) * 314} 314`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-black text-slate-800">{Math.round(displayRisk)}%</p>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
              {simRisk !== null ? 'Simulated Risk' : 'Current Risk'}
            </p>
            <p className="text-lg font-bold text-slate-800">
              {simRisk === null
                ? `Baseline: ${baseRisk}%`
                : isWorse
                  ? `↑ Risk increased by ${(simRisk - baseRisk).toFixed(1)}%`
                  : `↓ Risk reduced by ${(baseRisk - simRisk).toFixed(1)}%`}
            </p>
            {simRisk !== null && (
              <p className={`text-sm font-semibold mt-1 ${isBetter ? 'text-green-500' : 'text-red-500'}`}>
                {isBetter ? '✅ These changes would help you!' : '⚠️ These habits increase your risk'}
              </p>
            )}
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={20} className="text-[var(--color-cardio-primary)]" />
            <h2 className="font-bold text-lg text-slate-800">Adjust Lifestyle</h2>
          </div>

          <div className="space-y-6">
            {/* Sleep */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Moon size={16} className="text-indigo-400" /> Sleep Hours
                </span>
                <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">{sleep}h</span>
              </div>
              <input
                type="range" min="4" max="10" step="0.5" value={sleep}
                onChange={e => { setSleep(Number(e.target.value)); setSimRisk(null); }}
                className="w-full accent-[var(--color-cardio-primary)] h-2 rounded-full"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>4h (Poor)</span><span>7h (Good)</span><span>10h (Great)</span>
              </div>
            </div>

            {/* Weight */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Scale size={16} className="text-orange-400" /> Body Weight
                </span>
                <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">{weight} kg</span>
              </div>
              <input
                type="range" min="50" max="150" value={weight}
                onChange={e => { setWeight(Number(e.target.value)); setSimRisk(null); }}
                className="w-full accent-[var(--color-cardio-primary)] h-2 rounded-full"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>50kg</span><span>100kg</span><span>150kg</span>
              </div>
            </div>

            {/* Adherence */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Pill size={16} className="text-green-400" /> Med Adherence
                </span>
                <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">{adherence}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={adherence}
                onChange={e => { setAdherence(Number(e.target.value)); setSimRisk(null); }}
                className="w-full accent-[var(--color-cardio-primary)] h-2 rounded-full"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (None)</span><span>50%</span><span>100% (Full)</span>
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full py-4 bg-[var(--color-cardio-primary)] text-white font-bold rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              {loading
                ? <><RefreshCw className="animate-spin" size={18} /> Running...</>
                : <><Activity size={18} /> Run Simulation</>}
            </button>
          </div>
        </div>

        {/* Tip card */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs text-blue-700 font-semibold">💡 How it works</p>
          <p className="text-xs text-blue-600 mt-1">This engine uses your real vitals (BP, blood sugar, heart rate) as a baseline, then simulates how changes to sleep, weight, and medication adherence would affect your cardiac risk score.</p>
        </div>
      </div>
    </div>
  );
}
