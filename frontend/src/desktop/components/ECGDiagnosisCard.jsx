import React from 'react';
import { CheckCircle, AlertTriangle, ShieldCheck, Calendar } from 'lucide-react';

export default function ECGDiagnosisCard({
  diagnosis = '--',
  confidence = 0,
  risk = 'Unknown',
  date = '--',
  status = 'normal'
}) {
  const isNormal = status === 'normal';

  const badgeStyle = isNormal
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';

  const riskColor =
    risk === 'Low' ? 'text-[var(--color-cardio-primary)]' :
    risk === 'Moderate' ? 'text-amber-500' :
    'text-red-500';

  const riskBg =
    risk === 'Low' ? 'bg-green-50' :
    risk === 'Moderate' ? 'bg-amber-50' :
    'bg-red-50';

  const StatusIcon = isNormal ? CheckCircle : AlertTriangle;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-[var(--color-cardio-text)]">AI Diagnosis</h3>
        <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${badgeStyle}`}>
          <StatusIcon size={12} /> {isNormal ? 'Normal' : 'Abnormal'}
        </span>
      </div>

      <div className="flex-1 space-y-4">
        {/* Diagnosis */}
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-[11px] font-medium text-[var(--color-cardio-text-light)] uppercase tracking-wider mb-1">Diagnosis</p>
          <p className="text-xl font-bold text-[var(--color-cardio-text)]">{diagnosis}</p>
        </div>

        {/* Confidence + Risk row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[11px] font-medium text-[var(--color-cardio-text-light)] uppercase tracking-wider mb-1">Confidence</p>
            <p className="text-2xl font-bold text-[var(--color-cardio-text)]">{confidence}%</p>
          </div>
          <div className={`${riskBg} rounded-xl p-4`}>
            <p className="text-[11px] font-medium text-[var(--color-cardio-text-light)] uppercase tracking-wider mb-1">Risk Level</p>
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className={riskColor} />
              <p className={`text-xl font-bold ${riskColor}`}>{risk}</p>
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">
          <Calendar size={18} className="text-[var(--color-cardio-text-light)] shrink-0" />
          <div>
            <p className="text-[11px] font-medium text-[var(--color-cardio-text-light)] uppercase tracking-wider">Analysis Date</p>
            <p className="text-sm font-bold text-[var(--color-cardio-text)]">{date}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
