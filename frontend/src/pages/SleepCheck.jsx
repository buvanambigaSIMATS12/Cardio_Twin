import React from 'react';
import { ArrowLeft, Moon, Clock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SleepCheck() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-[var(--color-cardio-primary)] text-white px-4 py-6 shadow-sm rounded-b-3xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Sleep Analysis</h1>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col items-center justify-center text-center space-y-4 mt-12">
        <div className="w-24 h-24 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mb-4">
          <Moon size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-700">Sleep Tracking Coming Soon</h2>
        <p className="text-slate-500 max-w-xs leading-relaxed">
          We are currently integrating with smartwatch APIs to automatically sync your deep sleep and REM cycles.
        </p>
        
        <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mt-8 flex justify-around">
          <div className="flex flex-col items-center text-slate-400">
            <Clock size={24} className="mb-2" />
            <span className="text-xs font-bold uppercase">Duration</span>
            <span className="text-lg font-bold text-slate-700">-- h</span>
          </div>
          <div className="w-px bg-slate-100"></div>
          <div className="flex flex-col items-center text-slate-400">
            <Activity size={24} className="mb-2" />
            <span className="text-xs font-bold uppercase">Quality</span>
            <span className="text-lg font-bold text-slate-700">-- %</span>
          </div>
        </div>
      </div>
    </div>
  );
}
