import React from 'react';
import { AlertTriangle, ShieldAlert, Info, CheckCircle } from 'lucide-react';

const severityConfig = {
  high:    { icon: ShieldAlert,   bg: 'bg-red-50',    border: 'border-red-200',  color: 'text-red-600',   badge: 'bg-red-100 text-red-700' },
  medium:  { icon: AlertTriangle, bg: 'bg-amber-50',  border: 'border-amber-200', color: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  low:     { icon: Info,          bg: 'bg-blue-50',   border: 'border-blue-200',  color: 'text-blue-600',  badge: 'bg-blue-100 text-blue-700' },
};

export default function MedicationInteractionsCard({ interactions = [] }) {
  const highCount = interactions.filter(i => i.severity === 'high').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Drug Interactions</h3>
        {highCount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
            <ShieldAlert size={11} /> {highCount} Critical
          </span>
        )}
      </div>

      {interactions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
          <CheckCircle size={28} className="mb-2 text-[var(--color-cardio-primary)]" />
          <p className="text-sm font-medium text-[var(--color-cardio-text)]">No Interactions Detected</p>
          <p className="text-xs text-[var(--color-cardio-text-light)] mt-1">Your medications are compatible</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2.5">
          {interactions.map((item, i) => {
            const cfg = severityConfig[item.severity] || severityConfig.low;
            const Icon = cfg.icon;
            return (
              <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${cfg.border} ${cfg.bg} transition-colors`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <Icon size={16} className={cfg.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[var(--color-cardio-text)]">{item.drugs}</p>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${cfg.badge}`}>
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-cardio-text-light)] leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
