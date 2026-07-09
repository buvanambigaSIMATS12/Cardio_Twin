import React from 'react';
import { Package, AlertTriangle, Clock } from 'lucide-react';

export default function MedicationRefillCard({ refills = [] }) {
  const getDaysColor = (days) => {
    if (days <= 3) return 'bg-red-100 text-red-700';
    if (days <= 7) return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-700';
  };

  const getDaysIcon = (days) => {
    if (days <= 3) return <AlertTriangle size={12} />;
    return <Clock size={12} />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Upcoming Refills</h3>

      {refills.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
          <Package size={28} className="mb-2" />
          <p className="text-sm">No upcoming refills</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2">
          {refills.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                <Package size={16} className="text-violet-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--color-cardio-text)] truncate">{item.name}</p>
                <p className="text-[11px] text-[var(--color-cardio-text-light)]">
                  {item.dosage} · {item.remaining} remaining
                </p>
              </div>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full shrink-0 ${getDaysColor(item.daysLeft)}`}>
                {getDaysIcon(item.daysLeft)}
                {item.daysLeft}d left
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
