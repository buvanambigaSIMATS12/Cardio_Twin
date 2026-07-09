import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function RiskGaugeCard({
  riskPercent = 12,
  level = 'Low',
  factors = ['Age', 'Cholesterol', 'Blood Pressure'],
}) {
  /* Semicircle gauge geometry */
  const cx = 120, cy = 110, r = 90;
  const startAngle = Math.PI;                   // 180°
  const endAngle = 0;                           // 0°
  const totalArc = Math.PI;                     // 180°
  const arcLength = Math.PI * r;                // half circumference
  const filledLength = (riskPercent / 100) * arcLength;

  const arcPath = (radius) => {
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  };

  /* Needle position */
  const needleAngle = startAngle - (riskPercent / 100) * totalArc;
  const needleX = cx + (r - 10) * Math.cos(needleAngle);
  const needleY = cy + (r - 10) * Math.sin(needleAngle);

  const levelColor =
    level === 'Low' ? 'text-[var(--color-cardio-primary)]' :
    level === 'Moderate' ? 'text-amber-500' : 'text-red-500';

  const levelBg =
    level === 'Low' ? 'bg-green-100 text-green-700' :
    level === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">10-Year Risk</h3>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${levelBg}`}>{level}</span>
      </div>

      {/* Gauge */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <svg width="240" height="130" viewBox="0 0 240 130" className="overflow-visible">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          {/* Background track */}
          <path d={arcPath(r)} fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
          {/* Filled arc */}
          <path
            d={arcPath(r)}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${arcLength}`}
            strokeDashoffset={arcLength - filledLength}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
          {/* Needle dot */}
          <circle cx={needleX} cy={needleY} r="6" fill="white" stroke="#334155" strokeWidth="2.5" />
        </svg>

        {/* Center value */}
        <div className="flex flex-col items-center -mt-8">
          <span className={`text-3xl font-bold ${levelColor}`}>{riskPercent}%</span>
          <span className="text-xs text-[var(--color-cardio-text-light)] mt-0.5">Cardiovascular Risk</span>
        </div>

        {/* Contributing factors */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {factors.map((f) => (
            <span key={f} className="flex items-center gap-1 text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded-full">
              <ShieldCheck size={10} />
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
