import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Clock, Heart, Plus, Minus, Zap, RefreshCw } from 'lucide-react';
import api from '../api';

export default function SleepAnalyser() {
  const navigate = useNavigate();
  const [hours, setHours] = useState(7);
  const [quality, setQuality] = useState(3);
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:00');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const emojis = [
    { value: 1, icon: '😴', label: 'Very Poor' },
    { value: 2, icon: '😐', label: 'Poor' },
    { value: 3, icon: '🙂', label: 'Fair' },
    { value: 4, icon: '😊', label: 'Good' },
    { value: 5, icon: '💪', label: 'Excellent' }
  ];

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post('/ai/sleep-analysis', {
        hours,
        quality,
        bedtime,
        wake_time: wakeTime
      });
      setResult(res.data);
    } catch (err) {
      console.error('Failed to analyze sleep', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20 text-slate-100">
      <div className="px-4 py-4 border-b border-slate-800 flex items-center sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Sleep Analyser</h1>
          <p className="text-xs text-indigo-300">AI Heart Recovery Tracking</p>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        
        {!result ? (
          <>
            {/* Hours Logger */}
            <div className="bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-700 text-center">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-center gap-2">
                <Clock size={16} /> Hours Slept
              </h2>
              
              <div className="flex items-center justify-center gap-6">
                <button 
                  onClick={() => setHours(Math.max(2, hours - 0.5))}
                  className="w-14 h-14 bg-slate-700 text-white rounded-full flex items-center justify-center shadow-inner active:scale-95 transition-transform"
                >
                  <Minus size={24} />
                </button>
                
                <div className="text-6xl font-black text-white w-24">
                  {hours}
                </div>
                
                <button 
                  onClick={() => setHours(Math.min(16, hours + 0.5))}
                  className="w-14 h-14 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-inner active:scale-95 transition-transform"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            {/* Quality Selector */}
            <div className="bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-700">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-center gap-2">
                <Moon size={16} /> Sleep Quality
              </h2>
              
              <div className="flex justify-between items-center px-2">
                {emojis.map((em) => (
                  <button
                    key={em.value}
                    onClick={() => setQuality(em.value)}
                    className={`flex flex-col items-center gap-2 transition-all ${quality === em.value ? 'scale-125 opacity-100' : 'opacity-40 hover:opacity-70 grayscale'}`}
                  >
                    <span className="text-3xl">{em.icon}</span>
                  </button>
                ))}
              </div>
              <div className="text-center mt-6 font-bold text-indigo-300 text-sm">
                {emojis.find(e => e.value === quality)?.label}
              </div>
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-700 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Bedtime</p>
                <input 
                  type="time" 
                  value={bedtime}
                  onChange={e => setBedtime(e.target.value)}
                  className="bg-transparent text-xl font-bold text-white w-full text-center focus:outline-none"
                />
              </div>
              <div className="bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-700 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Wake Time</p>
                <input 
                  type="time" 
                  value={wakeTime}
                  onChange={e => setWakeTime(e.target.value)}
                  className="bg-transparent text-xl font-bold text-white w-full text-center focus:outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full mt-4 py-4 rounded-2xl font-bold text-white bg-indigo-600 shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {analyzing ? (
                <><RefreshCw size={20} className="animate-spin" /> Analyzing...</>
              ) : (
                <><Zap size={20} /> Analyze Sleep</>
              )}
            </button>
          </>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score Ring */}
            <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 flex flex-col items-center text-center">
              <h2 className="text-lg font-bold text-white mb-6">Your Sleep Score</h2>
              
              <div className="relative w-40 h-40 mb-6">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#334155" strokeWidth="12" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={result.sleep_score > 75 ? '#818cf8' : result.sleep_score > 50 ? '#facc15' : '#ef4444'}
                    strokeWidth="12"
                    strokeDasharray={`${(result.sleep_score / 100) * 314} 314`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-5xl font-black text-white">{result.sleep_score}</p>
                </div>
              </div>
              
              <div className="bg-indigo-900/50 text-indigo-200 px-4 py-3 rounded-xl flex items-start gap-3 text-left">
                <Heart size={24} className="shrink-0 text-pink-500 mt-0.5" />
                <p className="text-sm font-medium leading-snug">{result.cardiac_impact}</p>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-3">AI Insight</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {result.insights}
              </p>
              
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-3">Recommendations</h3>
              <ul className="space-y-3">
                {result.tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-300 text-sm">
                    <span className="text-indigo-500 font-black">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full mt-4 py-4 rounded-2xl font-bold text-slate-300 bg-slate-700 transition-all active:scale-95"
            >
              Log Another Night
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
