import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, History, Activity, Heart, AlertTriangle, Phone, X, Dumbbell, Moon, Utensils, Lightbulb, Bell, Search } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [streak, setStreak] = useState(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, streakRes, notifRes] = await Promise.all([
          api.get('/twin/summary'),
          api.get('/tracking/streak'),
          api.get('/notifications')
        ]);
        setSummary(summaryRes.data);
        setStreak(streakRes.data);
        const unread = notifRes.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  if (!summary) return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-8 h-8 border-4 border-[var(--color-cardio-primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const riskColor = summary.cardiac_risk > 50 ? 'text-red-500' : summary.cardiac_risk > 30 ? 'text-orange-500' : 'text-[var(--color-cardio-primary)]';
  const healthLabel = summary.health_score >= 80 ? 'Good' : summary.health_score >= 60 ? 'Moderate' : 'At Risk';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-24">

      {/* Emergency Modal */}
      {showEmergency && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle size={22} /> Emergency
              </h2>
              <button onClick={() => setShowEmergency(false)}><X size={22} className="text-slate-400" /></button>
            </div>
            <p className="text-slate-600 text-sm mb-6">Call emergency services or your emergency contact immediately.</p>
            <div className="space-y-3">
              <a href="tel:112"
                className="flex items-center justify-center gap-3 w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg active:bg-red-700">
                <Phone size={22} /> Call 112 (Ambulance)
              </a>
              <a href="tel:101"
                className="flex items-center justify-center gap-3 w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg active:bg-orange-600">
                <Phone size={22} /> Call 101 (Fire/Medical)
              </a>
              <button
                onClick={() => { setShowEmergency(false); navigate('/chat'); }}
                className="w-full bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold active:bg-slate-200"
              >
                Ask AI Cardiologist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Green Header */}
      <div className="bg-[var(--color-cardio-primary)] pt-12 pb-32 px-6 rounded-b-[2.5rem]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-white/80 text-sm font-medium">
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-2xl font-bold text-white">{summary.name}</h1>
              {streak && streak.current_streak > 0 && (
                <div className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-orange-400">
                  🔥 {streak.current_streak}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/40 active:scale-95 transition-transform"
            >
              <Bell size={22} className="text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-[var(--color-cardio-primary)] rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => navigate('/search')}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/40 active:scale-95 transition-transform"
            >
              <Search size={22} className="text-white" />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/40 active:scale-95 transition-transform"
            >
              <span className="text-white font-bold text-lg">{summary.initials}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Health Card */}
      <div className="px-4 -mt-24 space-y-3">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase">HEALTH SCORE</h2>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${summary.health_score >= 80 ? 'bg-green-100 text-green-700' : summary.health_score >= 60 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
              {healthLabel}
            </span>
          </div>
          <div className="flex items-end gap-6 mb-4">
            <div className="text-6xl font-bold text-[var(--color-cardio-primary)]">{summary.health_score}</div>
            <div className="pb-1">
              <p className="text-xs text-slate-400 font-medium">Cardiac risk</p>
              <p className={`text-sm font-bold ${riskColor}`}>{summary.cardiac_risk.toFixed(1)}% <span className="text-slate-500 font-medium">Risk</span></p>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[var(--color-cardio-primary)] h-full rounded-full transition-all duration-700"
              style={{ width: `${summary.health_score}%` }}
            ></div>
          </div>
        </div>

        {/* Real Vitals Cards */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">BP</span>
            <span className={`font-bold text-sm ${summary.bp === '--/--' ? 'text-slate-400' : 'text-slate-700'}`}>{summary.bp}</span>
          </div>
          <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Blood Sugar</span>
            <span className={`font-bold text-sm ${summary.blood_sugar === '--' ? 'text-slate-400' : 'text-slate-700'}`}>{summary.blood_sugar}</span>
          </div>
          <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Diabetes</span>
            <span className={`font-bold text-sm ${summary.diabetes === 'Yes' ? 'text-red-500' : 'text-[var(--color-cardio-primary)]'}`}>{summary.diabetes}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-2 flex flex-col gap-3">
          <button
            onClick={() => navigate('/ecg')}
            className="w-full bg-[var(--color-cardio-primary)] text-white py-4 rounded-2xl font-bold shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Upload size={20} /> Upload ECG
          </button>

          {/* Phase 2 & 4 Quick Actions */}
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/medications')}
              className="flex flex-col items-center justify-center bg-white border border-slate-100 py-3 rounded-2xl shadow-sm active:scale-95 transition-transform gap-2"
            >
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
              </div>
              <span className="text-[10px] font-bold text-slate-600">Meds</span>
            </button>
            <button
              onClick={() => navigate('/vitals-tracker')}
              className="flex flex-col items-center justify-center bg-white border border-slate-100 py-3 rounded-2xl shadow-sm active:scale-95 transition-transform gap-2"
            >
              <div className="w-10 h-10 bg-[var(--color-cardio-primary)]/10 text-[var(--color-cardio-primary)] rounded-full flex items-center justify-center">
                <Activity size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-600">Vitals</span>
            </button>
            <button
              onClick={() => navigate('/symptoms')}
              className="flex flex-col items-center justify-center bg-white border border-slate-100 py-3 rounded-2xl shadow-sm active:scale-95 transition-transform gap-2"
            >
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
              </div>
              <span className="text-[10px] font-bold text-slate-600">Symptoms</span>
            </button>
            <button
              onClick={() => navigate('/achievements')}
              className="flex flex-col items-center justify-center bg-white border border-slate-100 py-3 rounded-2xl shadow-sm active:scale-95 transition-transform gap-2"
            >
              <div className="w-10 h-10 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V2l-4 4-4-4v13"/><path d="M4 15h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6Z"/></svg>
              </div>
              <span className="text-[10px] font-bold text-slate-600">Badges</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/weekly-summary')}
              className="flex flex-col items-center justify-center bg-white border border-slate-100 py-3 rounded-2xl shadow-sm active:scale-95 transition-transform gap-2"
            >
              <div className="w-10 h-10 bg-slate-50 text-slate-700 rounded-full flex items-center justify-center">
                <History size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-600">Report</span>
            </button>
            <button
              onClick={() => navigate('/twin')}
              className="flex flex-col items-center justify-center bg-white border border-slate-100 py-3 rounded-2xl shadow-sm active:scale-95 transition-transform gap-2"
            >
              <div className="w-10 h-10 bg-slate-50 text-slate-700 rounded-full flex items-center justify-center">
                <Heart size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-600">Twin</span>
            </button>
            <button
              onClick={() => setShowEmergency(true)}
              className="col-span-2 flex flex-row items-center justify-center bg-red-50 border border-red-100 py-3 rounded-2xl shadow-sm active:scale-95 transition-transform gap-3"
            >
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <span className="font-bold text-red-600 text-sm">Emergency</span>
            </button>
          </div>

          {/* Phase 5 AI Tools */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/recommendations')}
              className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center shrink-0">
                <Lightbulb size={18} />
              </div>
              <span className="font-bold text-xs text-slate-700 text-left leading-tight">AI Advice</span>
            </button>
            <button
              onClick={() => navigate('/exercise-plan')}
              className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center shrink-0">
                <Dumbbell size={18} />
              </div>
              <span className="font-bold text-xs text-slate-700 text-left leading-tight">Workout Plan</span>
            </button>
            <button
              onClick={() => navigate('/sleep')}
              className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center shrink-0">
                <Moon size={18} />
              </div>
              <span className="font-bold text-xs text-slate-700 text-left leading-tight">Sleep Check</span>
            </button>
            <button
              onClick={() => navigate('/meal-plan')}
              className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center shrink-0">
                <Utensils size={18} />
              </div>
              <span className="font-bold text-xs text-slate-700 text-left leading-tight">Meal Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
