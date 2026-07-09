import React from 'react';
import { TrendingDown, TrendingUp, Clock } from 'lucide-react';

export default function RiskTimelineCard({ points = [], labels = [] }) {
  /* ── Empty state ── */
  if (points.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col col-span-1 xl:col-span-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Risk Timeline</h3>
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
          <Clock size={28} className="mb-2" />
          <p className="text-sm">No timeline data yet</p>
        </div>
      </div>
    );
  }

  /* ── Trend direction ── */
  const isImproving = points.length >= 2 && points[points.length - 1] <= points[0];
  const TrendIcon = isImproving ? TrendingDown : TrendingUp;
  const trendLabel = isImproving ? 'Improving' : 'Worsening';
  const trendColor = isImproving ? 'text-[var(--color-cardio-primary)]' : 'text-red-500';

  const w = 700, h = 140, px = 40, py = 16;
  const plotW = w - px * 2;
  const plotH = h - py * 2;
  const maxVal = Math.max(...points, 30);

  const coords = points.map((v, i) => ({
    x: px + (i / (points.length - 1)) * plotW,
    y: py + plotH - (v / maxVal) * plotH,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${h - py} L ${coords[0].x} ${h - py} Z`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col col-span-1 xl:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Risk Timeline</h3>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon size={14} />
          <span className="text-xs font-semibold">{trendLabel}</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full">
          <defs>
            <linearGradient id="riskAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-cardio-primary)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--color-cardio-primary)" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = py + plotH * (1 - frac);
            return <line key={frac} x1={px} y1={y} x2={w - px} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#riskAreaGrad)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="var(--color-cardio-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots */}
          {coords.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r="3.5" fill="white" stroke="var(--color-cardio-primary)" strokeWidth="2" />
          ))}

          {/* X-axis labels */}
          {coords.map((c, i) => (
            <text key={i} x={c.x} y={h - 2} textAnchor="middle" className="text-[9px] fill-slate-400" style={{ fontSize: '9px' }}>
              {labels[i]}
            </text>
          ))}
        </svg>
      </div>

      <p className="text-[10px] text-[var(--color-cardio-text-light)] text-center mt-2">
        Monthly cardiovascular risk trend — based on vitals, ECG & lifestyle data
      </p>
    </div>
  );
}
