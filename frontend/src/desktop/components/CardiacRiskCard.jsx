import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function CardiacRiskCard({ risk = 0, level = 'Unknown' }) {
  const color =
    level === 'Low Risk' ? 'text-[var(--color-cardio-primary)]' :
    level === 'Moderate Risk' ? 'text-amber-500' :
    'text-red-500';

  const bgColor =
    level === 'Low Risk' ? 'bg-green-50' :
    level === 'Moderate Risk' ? 'bg-amber-50' :
    'bg-red-50';

  const description =
    level === 'Low Risk' ? 'Your cardiac risk is within the healthy range.' :
    level === 'Moderate Risk' ? 'Some risk factors detected. Monitor closely.' :
    'Elevated risk. Consult your cardiologist.';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Cardiac Risk</h3>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`w-20 h-20 rounded-full ${bgColor} flex items-center justify-center mb-3`}>
          <ShieldAlert size={28} className={color} />
        </div>
        <p className={`text-3xl font-bold ${color}`}>{risk.toFixed(1)}%</p>
        <span className={`text-sm font-semibold mt-1 ${color}`}>{level}</span>
        <p className="text-xs text-[var(--color-cardio-text-light)] mt-2 text-center">{description}</p>
      </div>
    </div>
  );
}
