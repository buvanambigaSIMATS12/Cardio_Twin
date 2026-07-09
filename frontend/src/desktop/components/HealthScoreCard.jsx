import React from 'react';

export default function HealthScoreCard({ score = 0, status = 'Unknown' }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const size = 180;
  const strokeWidth = 13;

  const statusColor =
    status === 'Good' ? 'bg-green-100 text-green-700' :
    status === 'Moderate' ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Health Score</h3>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor}`}>{status}</span>
      </div>

      {/* SVG Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none"
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="var(--color-cardio-primary)" strokeWidth={strokeWidth} fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-[var(--color-cardio-text)]">{score}</span>
          <span className="text-xs font-medium text-[var(--color-cardio-text-light)] mt-0.5">/ 100</span>
        </div>
      </div>

      <p className="text-xs text-[var(--color-cardio-text-light)] mt-4 text-center">
        Based on vitals, ECG, and lifestyle data
      </p>
    </div>
  );
}
