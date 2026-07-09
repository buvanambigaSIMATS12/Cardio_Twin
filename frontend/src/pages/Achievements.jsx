import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Flame, Shield, Activity, Pill, Lock } from 'lucide-react';
import api from '../api';

const iconMap = {
  Stethoscope: Stethoscope,
  Flame: Flame,
  Shield: Shield,
  Activity: Activity,
  Pill: Pill
};

export default function Achievements() {
  const navigate = useNavigate();
  const [streak, setStreak] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [streakRes, achRes] = await Promise.all([
          api.get('/tracking/streak'),
          api.get('/tracking/achievements')
        ]);
        setStreak(streakRes.data);
        setAchievements(achRes.data);
      } catch (err) {
        console.error('Failed to fetch achievements data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !streak) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Calculate next milestone
  const milestones = [7, 30, 100];
  let nextMilestone = milestones.find(m => streak.current_streak < m) || milestones[milestones.length - 1];
  const progressPercent = Math.min(100, (streak.current_streak / nextMilestone) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Achievements</h1>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
            <Flame size={120} strokeWidth={1} />
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="text-6xl mb-2 animate-bounce">🔥</div>
            <h2 className="text-3xl font-black mb-1">{streak.current_streak} Day Streak</h2>
            <p className="text-orange-100 text-sm mb-6 max-w-xs">
              Keep it going! Log vitals daily to maintain your streak.
            </p>
            
            <div className="w-full bg-black/20 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="w-full flex justify-between text-xs font-semibold text-orange-200">
              <span>{streak.current_streak} days</span>
              <span>Next goal: {nextMilestone} days</span>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <h2 className="text-lg font-bold text-slate-800 px-1 pt-2">Badges</h2>
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((ach) => {
            const IconComponent = iconMap[ach.icon] || Activity;
            const isEarned = ach.earned;
            
            return (
              <div 
                key={ach.id} 
                className={`rounded-2xl p-4 flex flex-col items-center text-center border transition-all duration-300 ${
                  isEarned 
                    ? 'bg-white border-green-200 shadow-sm' 
                    : 'bg-slate-100/50 border-slate-200 opacity-70 grayscale'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 relative ${
                  isEarned ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'
                }`}>
                  <IconComponent size={28} />
                  {!isEarned && (
                    <div className="absolute -bottom-1 -right-1 bg-slate-700 text-white rounded-full p-1 border-2 border-white">
                      <Lock size={12} />
                    </div>
                  )}
                </div>
                <h3 className={`font-bold text-sm mb-1 ${isEarned ? 'text-slate-800' : 'text-slate-500'}`}>
                  {ach.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                  {ach.description}
                </p>
                {isEarned ? (
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mt-auto">
                    Earned {new Date(ach.earned_at).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-auto">
                    Locked
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
