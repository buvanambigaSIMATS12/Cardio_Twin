import React from 'react';
import { Heart, Activity, Zap } from 'lucide-react';

export default function HeartStatusCard({
  bpm = 72,
  rhythm = 'Normal Sinus',
  ejectionFraction = 62,
  status = 'Healthy',
  lastUpdated = '2 min ago',
}) {
  const statusConfig = {
    Healthy:  { badge: 'bg-green-100 text-green-700', glow: '#22c55e' },
    'At Risk': { badge: 'bg-amber-100 text-amber-700', glow: '#f59e0b' },
    Critical: { badge: 'bg-red-100 text-red-700',    glow: '#ef4444' },
  };
  const cfg = statusConfig[status] || statusConfig.Healthy;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Heart Status</h3>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.badge}`}>{status}</span>
      </div>

      {/* Pulsing heart */}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <div className="relative mb-4">
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-30"
            style={{
              background: cfg.glow,
              animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
            }}
          />
          <div className="relative w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center">
            <Heart
              size={36}
              className="text-rose-500"
              fill="currentColor"
              style={{ animation: 'pulse 1.2s ease-in-out infinite' }}
            />
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-4 w-full mt-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity size={12} className="text-rose-500" />
              <span className="text-[10px] text-[var(--color-cardio-text-light)]">BPM</span>
            </div>
            <p className="text-xl font-bold text-[var(--color-cardio-text)]">{bpm}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap size={12} className="text-amber-500" />
              <span className="text-[10px] text-[var(--color-cardio-text-light)]">Rhythm</span>
            </div>
            <p className="text-sm font-bold text-[var(--color-cardio-text)] leading-tight">{rhythm}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart size={12} className="text-[var(--color-cardio-primary)]" />
              <span className="text-[10px] text-[var(--color-cardio-text-light)]">EF</span>
            </div>
            <p className="text-xl font-bold text-[var(--color-cardio-text)]">{ejectionFraction}%</p>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-[var(--color-cardio-text-light)] text-center mt-3">
        Updated {lastUpdated}
      </p>
    </div>
  );
}
