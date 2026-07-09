import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function AccountStatisticsCard({ stats = [] }) {
  const maxVal = Math.max(...stats.map(s => s.value), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
          <BarChart3 size={14} className="text-amber-500" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Statistics</h3>
      </div>

      <div className="flex-1 space-y-4">
        {stats.map((s, i) => {
          const pct = Math.round((s.value / maxVal) * 100);
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-[var(--color-cardio-text)]">{s.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--color-cardio-text)]">{s.value}</span>
                  {s.trend && (
                    <span className={`text-[10px] font-bold ${s.trend > 0 ? 'text-[var(--color-cardio-primary)]' : 'text-red-500'}`}>
                      {s.trend > 0 ? '+' : ''}{s.trend}%
                    </span>
                  )}
                </div>
              </div>
              {/* Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: s.color || 'var(--color-cardio-primary)',
                  }}
                />
              </div>
              {/* Sparkline dots */}
              {s.monthly && s.monthly.length > 0 && (
                <div className="flex items-end gap-[3px] mt-2 h-4">
                  {s.monthly.map((v, j) => {
                    const monthMax = Math.max(...s.monthly, 1);
                    const barH = Math.max((v / monthMax) * 16, 2);
                    return (
                      <div
                        key={j}
                        className="flex-1 rounded-sm transition-all duration-300"
                        style={{
                          height: `${barH}px`,
                          backgroundColor: s.color || 'var(--color-cardio-primary)',
                          opacity: 0.5,
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
