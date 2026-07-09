import React from 'react';
import { TrendingUp, Flame } from 'lucide-react';

export default function MedicationAdherenceCard({
  adherence = 0,
  taken = 0,
  total = 0,
  streak = 0,
  weeklyData = [],
}) {
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (adherence / 100) * circumference;
  const size = 170;
  const strokeWidth = 12;

  const ringColor =
    adherence >= 80 ? 'var(--color-cardio-primary)' :
    adherence >= 50 ? '#f59e0b' :
    '#ef4444';

  const statusLabel =
    adherence >= 90 ? 'Excellent' :
    adherence >= 80 ? 'Good' :
    adherence >= 50 ? 'Needs Improvement' :
    'Critical';

  const statusBadge =
    adherence >= 80 ? 'bg-green-100 text-green-700' :
    adherence >= 50 ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Adherence</h3>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusBadge}`}>{statusLabel}</span>
      </div>

      {/* SVG Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none"
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={ringColor} strokeWidth={strokeWidth} fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-[var(--color-cardio-text)]">{adherence}%</span>
          <span className="text-xs font-medium text-[var(--color-cardio-text-light)] mt-0.5">{taken}/{total} today</span>
        </div>
      </div>

      {/* Streak + Trend */}
      <div className="flex items-center gap-4 mt-4 w-full justify-center">
        <div className="flex items-center gap-1.5 text-sm">
          <Flame size={15} className="text-orange-500" />
          <span className="font-semibold text-[var(--color-cardio-text)]">{streak}-day</span>
          <span className="text-[var(--color-cardio-text-light)]">streak</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5 text-sm">
          <TrendingUp size={15} className="text-[var(--color-cardio-primary)]" />
          <span className="text-[var(--color-cardio-text-light)]">+5% this week</span>
        </div>
      </div>

      {/* Weekly mini-bars */}
      {weeklyData.length > 0 && (
        <div className="flex items-end gap-1.5 mt-4 w-full justify-center">
          {weeklyData.map((pct, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-5 rounded-sm transition-all duration-300"
                style={{
                  height: `${Math.max(pct * 0.4, 4)}px`,
                  backgroundColor: pct >= 80 ? 'var(--color-cardio-primary)' : pct >= 50 ? '#f59e0b' : '#ef4444',
                  opacity: 0.8,
                }}
              />
              <span className="text-[9px] text-[var(--color-cardio-text-light)]">
                {['M','T','W','T','F','S','S'][i]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
