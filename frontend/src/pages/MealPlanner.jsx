import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Utensils, Coffee, Sun, Moon, RefreshCw, Heart, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';

const mealIcons = {
  breakfast: { icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', label: 'Breakfast' },
  lunch:     { icon: Sun,    color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', label: 'Lunch' },
  dinner:    { icon: Moon,   color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', label: 'Dinner' },
};

function MealCard({ type, meal, expanded, onToggle }) {
  const cfg = mealIcons[type];
  const Icon = cfg.icon;
  return (
    <div className={`bg-white rounded-2xl border ${cfg.border} shadow-sm overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 p-4 ${cfg.bg}`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 text-left">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</p>
          <p className="text-slate-800 font-bold text-sm">{meal?.name}</p>
        </div>
        {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {expanded && (
        <div className="p-4 space-y-3">
          <p className="text-slate-600 text-sm leading-relaxed">{meal?.description}</p>
          <div className={`flex items-start gap-2 ${cfg.bg} p-3 rounded-xl border ${cfg.border}`}>
            <Heart size={14} className={`${cfg.color} mt-0.5 shrink-0`} />
            <p className={`text-xs font-medium ${cfg.color}`}>{meal?.cardiac_benefit}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MealPlanner() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeDay, setActiveDay] = useState('Mon');
  const [expandedMeal, setExpandedMeal] = useState('breakfast');

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const fetchPlan = async (forceNew = false) => {
    setLoading(true);
    try {
      const res = await api.post('/ai/meal-plan', { force_new: forceNew });
      setPlan(res.data);
    } catch (err) {
      console.error('Failed to fetch meal plan', err);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  useEffect(() => { fetchPlan(false); }, []);

  const handleGenerateNew = () => {
    setGenerating(true);
    fetchPlan(true);
  };

  const currentDay = plan.find(p => p.day === activeDay) || null;

  return (
    <div className="min-h-screen bg-emerald-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-emerald-100 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Meal Planner</h1>
          <p className="text-xs text-emerald-600 font-medium">7-Day Heart-Healthy Diet</p>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Day selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {days.map(day => (
            <button
              key={day}
              onClick={() => { setActiveDay(day); setExpandedMeal('breakfast'); }}
              className={`flex-shrink-0 w-14 py-3 flex flex-col items-center justify-center rounded-2xl transition-all font-bold text-sm ${
                activeDay === day
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : currentDay ? (
          <div className="space-y-3">
            {/* Meals */}
            {['breakfast', 'lunch', 'dinner'].map(type => (
              <MealCard
                key={type}
                type={type}
                meal={currentDay[type]}
                expanded={expandedMeal === type}
                onToggle={() => setExpandedMeal(expandedMeal === type ? null : type)}
              />
            ))}

            {/* Daily Tip */}
            {currentDay.daily_tip && (
              <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Lightbulb size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Daily Tip</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{currentDay.daily_tip}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">No plan available for this day.</div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerateNew}
          disabled={generating || loading}
          className="w-full py-4 rounded-2xl font-bold text-emerald-600 bg-white border border-emerald-200 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={20} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating New Plan...' : 'Generate New Meal Plan'}
        </button>
      </div>
    </div>
  );
}
