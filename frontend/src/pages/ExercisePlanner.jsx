import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Clock, Heart, RefreshCw, Info } from 'lucide-react';
import api from '../api';

export default function ExercisePlanner() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Mon');
  const [generating, setGenerating] = useState(false);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const fetchPlan = async (forceNew = false) => {
    setLoading(true);
    try {
      const response = await api.post('/ai/exercise-plan', { force_new: forceNew });
      setPlan(response.data);
    } catch (err) {
      console.error('Failed to fetch exercise plan', err);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchPlan(false);
  }, []);

  const handleGenerateNew = () => {
    setGenerating(true);
    fetchPlan(true);
  };

  const currentDayPlan = plan.find(p => p.day === activeDay) || null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Exercise Planner</h1>
          <p className="text-xs text-slate-500">7-Day Cardiac Safe Routine</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Days Scrollable Row */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-shrink-0 w-14 py-3 flex flex-col items-center justify-center rounded-2xl transition-all ${
                activeDay === day 
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-sm font-bold">{day}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-pulse">
            <div className="w-16 h-16 bg-slate-200 rounded-2xl mb-4"></div>
            <div className="h-6 bg-slate-200 rounded w-2/3 mb-4"></div>
            <div className="flex gap-3 mb-6">
              <div className="h-8 bg-slate-200 rounded-full w-24"></div>
              <div className="h-8 bg-slate-200 rounded-full w-20"></div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
            <div className="h-20 bg-slate-200 rounded-2xl w-full"></div>
          </div>
        ) : currentDayPlan ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-5 text-blue-500 pointer-events-none">
              <Activity size={160} />
            </div>

            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-5">
                <Activity size={28} />
              </div>
              
              <h2 className="text-2xl font-black text-slate-800 mb-4">{currentDayPlan.activity}</h2>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold">
                  <Clock size={16} className="text-slate-500" />
                  {currentDayPlan.duration_minutes} mins
                </div>
                
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  currentDayPlan.intensity === 'Low' ? 'bg-green-100 text-green-700' :
                  currentDayPlan.intensity === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  <Activity size={16} />
                  {currentDayPlan.intensity} Intensity
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Info size={14} /> Notes for today
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {currentDayPlan.notes}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Heart size={14} /> Cardiac Benefit
                  </h3>
                  <p className="text-pink-900 text-sm leading-relaxed bg-pink-50 p-4 rounded-2xl border border-pink-100">
                    {currentDayPlan.heart_benefits}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            No plan available for this day.
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerateNew}
          disabled={generating || loading}
          className="w-full mt-6 py-4 rounded-2xl font-bold text-blue-600 bg-blue-50 border border-blue-100 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={20} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating New Plan...' : 'Generate New Plan'}
        </button>

      </div>
    </div>
  );
}
