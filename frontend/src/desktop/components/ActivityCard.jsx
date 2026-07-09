import React from 'react';
import { Activity, HeartPulse, Pill, ClipboardList, Clock } from 'lucide-react';

const typeConfig = {
  vital:      { icon: Activity,      bg: 'bg-green-50',  color: 'text-[var(--color-cardio-primary)]' },
  ecg:        { icon: HeartPulse,    bg: 'bg-rose-50',   color: 'text-rose-500' },
  medication: { icon: Pill,          bg: 'bg-blue-50',   color: 'text-blue-500' },
  symptom:    { icon: ClipboardList, bg: 'bg-amber-50',  color: 'text-amber-500' },
};

export default function ActivityCard({ activities = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Recent Activity</h3>

      {activities.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
          <Clock size={28} className="mb-2" />
          <p className="text-sm">No activity yet</p>
        </div>
      ) : (
        <div className="flex-1 space-y-1.5">
          {activities.map((item, i) => {
            const cfg = typeConfig[item.type] || typeConfig.vital;
            const Icon = cfg.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={15} className={cfg.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-cardio-text)] truncate">{item.title}</p>
                  <p className="text-[11px] text-[var(--color-cardio-text-light)] truncate">{item.description}</p>
                </div>
                <span className="text-[11px] text-[var(--color-cardio-text-light)] whitespace-nowrap shrink-0">
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
