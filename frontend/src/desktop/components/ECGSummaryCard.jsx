import React from 'react';
import { Activity, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ECGSummaryCard({ diagnosis = '--', confidence = 0, date = '--', status = 'normal' }) {
  const isNormal = status === 'normal';

  const statusBadge = isNormal
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';

  const StatusIcon = isNormal ? CheckCircle : AlertTriangle;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Latest ECG</h3>
        <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${statusBadge}`}>
          <StatusIcon size={12} /> {diagnosis}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-4 justify-center">
        {/* Diagnosis */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <Activity size={20} className="text-[var(--color-cardio-primary)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-cardio-text-light)]">Diagnosis</p>
            <p className="text-lg font-bold text-[var(--color-cardio-text)]">{diagnosis}</p>
          </div>
        </div>

        {/* Confidence + Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[11px] text-[var(--color-cardio-text-light)]">Confidence</p>
            <p className="text-sm font-bold text-[var(--color-cardio-text)]">{confidence}%</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[11px] text-[var(--color-cardio-text-light)]">Date</p>
            <p className="text-sm font-bold text-[var(--color-cardio-text)]">{date}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
