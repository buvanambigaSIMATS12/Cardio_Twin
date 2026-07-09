import React from 'react';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function ECGHistoryTable({ records = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
      <h3 className="text-sm font-bold text-[var(--color-cardio-text)] mb-4">ECG History</h3>

      {records.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
          <Clock size={28} className="mb-2" />
          <p className="text-sm">No ECG records yet</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-cardio-text-light)] py-2.5 pr-4">Date</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-cardio-text-light)] py-2.5 pr-4">Diagnosis</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-cardio-text-light)] py-2.5 pr-4">Confidence</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-cardio-text-light)] py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((row, i) => {
                const isNormal = row.status === 'Normal';
                return (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 pr-4 text-[var(--color-cardio-text)] font-medium">{row.date}</td>
                    <td className="py-3 pr-4 text-[var(--color-cardio-text)]">{row.diagnosis}</td>
                    <td className="py-3 pr-4">
                      <span className="font-semibold text-[var(--color-cardio-text)]">{row.confidence}%</span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full
                        ${isNormal ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isNormal
                          ? <CheckCircle size={11} />
                          : <AlertTriangle size={11} />
                        }
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
