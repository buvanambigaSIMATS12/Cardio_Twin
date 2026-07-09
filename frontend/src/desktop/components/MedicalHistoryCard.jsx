import React from 'react';
import { ClipboardList, AlertTriangle, Scissors, ShieldAlert, Clock } from 'lucide-react';

const categoryConfig = {
  condition: { icon: ClipboardList, bg: 'bg-blue-50',   color: 'text-blue-500',   badge: 'bg-blue-100 text-blue-700' },
  surgery:   { icon: Scissors,      bg: 'bg-violet-50', color: 'text-violet-500', badge: 'bg-violet-100 text-violet-700' },
  allergy:   { icon: ShieldAlert,   bg: 'bg-red-50',    color: 'text-red-500',    badge: 'bg-red-100 text-red-700' },
};

const severityBadge = {
  mild:     'bg-green-100 text-green-700',
  moderate: 'bg-amber-100 text-amber-700',
  severe:   'bg-red-100 text-red-700',
};

export default function MedicalHistoryCard({ records = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <ClipboardList size={14} className="text-blue-500" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Medical History</h3>
      </div>

      {records.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
          <Clock size={28} className="mb-2" />
          <p className="text-sm">No medical history recorded</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2">
          {records.map((item, i) => {
            const cfg = categoryConfig[item.category] || categoryConfig.condition;
            const Icon = cfg.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon size={15} className={cfg.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-medium text-[var(--color-cardio-text)]">{item.title}</p>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${cfg.badge}`}>
                      {item.category}
                    </span>
                    {item.severity && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${severityBadge[item.severity] || severityBadge.mild}`}>
                        {item.severity}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--color-cardio-text-light)] leading-relaxed">{item.description}</p>
                </div>
                <span className="text-[11px] text-[var(--color-cardio-text-light)] whitespace-nowrap shrink-0 mt-0.5">
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
