import React, { useState } from 'react';

const metricConfig = {
  heartRate:  { label: 'Heart Rate',     color: '#ef4444', unit: 'bpm' },
  bpSystolic: { label: 'BP Systolic',    color: 'var(--color-cardio-primary)', unit: 'mmHg' },
  spo2:       { label: 'SpO2',           color: '#3b82f6', unit: '%' },
};

export default function HealthMetricsChart({ data = [], labels = [] }) {
  const [activeMetrics, setActiveMetrics] = useState(new Set(['heartRate', 'bpSystolic', 'spo2']));

  const toggleMetric = (key) => {
    setActiveMetrics(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });
  };

  const w = 800, h = 200, px = 45, py = 20;
  const plotW = w - px * 2;
  const plotH = h - py * 2;

  /* Compute global Y range across active metrics */
  let allVals = [];
  data.forEach(d => {
    Object.keys(metricConfig).forEach(k => {
      if (activeMetrics.has(k) && d[k] != null) allVals.push(d[k]);
    });
  });
  const minVal = Math.min(...allVals) - 5;
  const maxVal = Math.max(...allVals) + 5;
  const range = maxVal - minVal || 1;

  const toCoords = (key) =>
    data.map((d, i) => ({
      x: px + (i / Math.max(data.length - 1, 1)) * plotW,
      y: py + plotH - ((d[key] - minVal) / range) * plotH,
    }));

  const toPath = (coords) =>
    coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

  /* Y-axis tick values */
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) =>
    Math.round(minVal + (range * i) / (yTicks - 1))
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Health Metrics Trend</h3>

        {/* Legend toggles */}
        <div className="flex items-center gap-3">
          {Object.entries(metricConfig).map(([key, cfg]) => {
            const active = activeMetrics.has(key);
            return (
              <button
                key={key}
                onClick={() => toggleMetric(key)}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all
                  ${active ? 'bg-slate-100 text-[var(--color-cardio-text)]' : 'bg-transparent text-slate-300'}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-opacity"
                  style={{ backgroundColor: cfg.color, opacity: active ? 1 : 0.3 }}
                />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full">
          <defs>
            {Object.entries(metricConfig).map(([key, cfg]) => (
              <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cfg.color} stopOpacity="0.10" />
                <stop offset="100%" stopColor={cfg.color} stopOpacity="0.01" />
              </linearGradient>
            ))}
          </defs>

          {/* Horizontal grid lines */}
          {yTickValues.map((val) => {
            const y = py + plotH - ((val - minVal) / range) * plotH;
            return (
              <g key={val}>
                <line x1={px} y1={y} x2={w - px} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                <text x={px - 6} y={y + 3} textAnchor="end" className="fill-slate-400" style={{ fontSize: '9px' }}>
                  {val}
                </text>
              </g>
            );
          })}

          {/* Plot each active metric */}
          {Object.keys(metricConfig).map((key) => {
            if (!activeMetrics.has(key)) return null;
            const coords = toCoords(key);
            const linePath = toPath(coords);
            const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${h - py} L ${coords[0].x} ${h - py} Z`;
            const cfg = metricConfig[key];
            return (
              <g key={key}>
                <path d={areaPath} fill={`url(#grad-${key})`} />
                <path d={linePath} fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {coords.map((c, i) => (
                  <circle key={i} cx={c.x} cy={c.y} r="3" fill="white" stroke={cfg.color} strokeWidth="1.5" />
                ))}
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((_, i) => {
            const x = px + (i / Math.max(data.length - 1, 1)) * plotW;
            return (
              <text key={i} x={x} y={h - 2} textAnchor="middle" className="fill-slate-400" style={{ fontSize: '9px' }}>
                {labels[i] || ''}
              </text>
            );
          })}
        </svg>
      </div>

      <p className="text-[10px] text-[var(--color-cardio-text-light)] text-center mt-2">
        30-day trend — click legend items to toggle metrics
      </p>
    </div>
  );
}
