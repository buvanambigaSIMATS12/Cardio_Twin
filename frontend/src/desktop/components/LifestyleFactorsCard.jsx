import React from 'react';
import {
  Dumbbell, Utensils, Moon, Brain,
  CircleSlash, Wine,
} from 'lucide-react';

const defaultFactors = [
  { key: 'exercise',  label: 'Exercise',     score: 78, status: 'Good',     icon: Dumbbell,    color: 'text-green-600',  bg: 'bg-green-50',  barColor: 'bg-green-500' },
  { key: 'diet',      label: 'Diet Quality', score: 65, status: 'Moderate', icon: Utensils,    color: 'text-amber-600',  bg: 'bg-amber-50',  barColor: 'bg-amber-500' },
  { key: 'sleep',     label: 'Sleep',        score: 82, status: 'Good',     icon: Moon,        color: 'text-indigo-600', bg: 'bg-indigo-50', barColor: 'bg-indigo-500' },
  { key: 'stress',    label: 'Stress',       score: 45, status: 'High',     icon: Brain,       color: 'text-red-600',    bg: 'bg-red-50',    barColor: 'bg-red-500' },
  { key: 'smoking',   label: 'Smoking',      score: 100, status: 'None',    icon: CircleSlash, color: 'text-green-600',  bg: 'bg-green-50',  barColor: 'bg-green-500' },
  { key: 'alcohol',   label: 'Alcohol',      score: 85, status: 'Low',      icon: Wine,        color: 'text-blue-600',   bg: 'bg-blue-50',   barColor: 'bg-blue-500' },
];

export default function LifestyleFactorsCard({ factors = defaultFactors }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Lifestyle Factors</h3>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {factors.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.key} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${f.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={15} className={f.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[var(--color-cardio-text)]">{f.label}</p>
                  <p className="text-[10px] text-[var(--color-cardio-text-light)]">{f.status}</p>
                </div>
                <span className="text-sm font-bold text-[var(--color-cardio-text)]">{f.score}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${f.barColor}`}
                  style={{ width: `${f.score}%`, transition: 'width 0.8s ease' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
