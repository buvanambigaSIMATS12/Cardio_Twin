import React from 'react';
import { Pill, CheckCircle, Circle } from 'lucide-react';

export default function MedicationCard({ adherence = 0, taken = 0, total = 0, medications = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Medication Adherence</h3>

      {/* Adherence bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-2xl font-bold text-[var(--color-cardio-text)]">{adherence}%</span>
          <span className="text-xs font-medium text-[var(--color-cardio-text-light)]">{taken}/{total} taken today</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-cardio-primary)] rounded-full transition-all duration-500"
            style={{ width: `${adherence}%` }}
          />
        </div>
      </div>

      {/* Medication list */}
      <div className="flex-1 space-y-2">
        {medications.map((med, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${med.taken ? 'bg-green-50' : 'bg-slate-100'}`}>
              {med.taken
                ? <CheckCircle size={14} className="text-[var(--color-cardio-primary)]" />
                : <Circle size={14} className="text-slate-300" />
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--color-cardio-text)] truncate">{med.name}</p>
              <p className="text-[11px] text-[var(--color-cardio-text-light)]">{med.dosage}</p>
            </div>
            <span className={`text-[11px] font-semibold ${med.taken ? 'text-[var(--color-cardio-primary)]' : 'text-slate-400'}`}>
              {med.taken ? 'Taken' : 'Pending'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
