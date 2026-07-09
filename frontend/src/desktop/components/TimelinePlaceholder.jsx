import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function TimelinePlaceholder() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Risk Timeline</h3>

      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl py-10 px-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
          <BarChart3 size={26} className="text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-[var(--color-cardio-text)]">Risk Timeline Chart</p>
        <p className="text-xs text-[var(--color-cardio-text-light)] mt-1">
          Interactive chart will appear here
        </p>
      </div>
    </div>
  );
}
