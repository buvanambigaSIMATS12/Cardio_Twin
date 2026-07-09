import React from 'react';
import { Activity, HeartPulse, Pill, CalendarDays } from 'lucide-react';

const defaultStats = [
  { key: 'ecgs',       label: 'Total ECGs',          value: '24',   change: '+3 this month',  icon: HeartPulse,   iconBg: 'bg-rose-50',   iconColor: 'text-rose-500' },
  { key: 'avgHR',      label: 'Avg Heart Rate',      value: '72',   change: 'bpm (last 30d)', icon: Activity,     iconBg: 'bg-green-50',  iconColor: 'text-[var(--color-cardio-primary)]' },
  { key: 'adherence',  label: 'Med Adherence',        value: '89%',  change: '+5% vs last mo', icon: Pill,         iconBg: 'bg-blue-50',   iconColor: 'text-blue-500' },
  { key: 'tracked',    label: 'Days Tracked',         value: '142',  change: 'since Jan 2026', icon: CalendarDays, iconBg: 'bg-amber-50',  iconColor: 'text-amber-500' },
];

export default function HistoryStatsCard({ stats = defaultStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.key} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
              <Icon size={20} className={stat.iconColor} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-[var(--color-cardio-text)] leading-tight">{stat.value}</p>
              <p className="text-[11px] text-[var(--color-cardio-text-light)] mt-0.5">{stat.change}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
