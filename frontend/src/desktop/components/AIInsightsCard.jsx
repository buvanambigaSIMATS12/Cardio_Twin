import React from 'react';
import {
  Lightbulb, AlertTriangle, Info, Bell,
  Heart, Activity, Pill, TrendingUp, Clock,
} from 'lucide-react';

const severityConfig = {
  info:    { badge: 'bg-blue-100 text-blue-700',   icon: Info },
  warning: { badge: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  alert:   { badge: 'bg-red-100 text-red-700',     icon: Bell },
};

const categoryIcons = {
  cardiac:    Heart,
  vitals:     Activity,
  medication: Pill,
  trend:      TrendingUp,
  general:    Lightbulb,
};

export default function AIInsightsCard({ insights = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Insights</h3>
        <Lightbulb size={16} className="text-[var(--color-cardio-primary)]" />
      </div>

      {insights.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
          <Clock size={28} className="mb-2" />
          <p className="text-sm">No insights available yet</p>
          <p className="text-xs mt-1">Log vitals and upload ECGs to generate AI insights</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3">
          {insights.map((ins, i) => {
            const sev = severityConfig[ins.severity] || severityConfig.info;
            const CatIcon = categoryIcons[ins.category] || categoryIcons.general;
            const SevIcon = sev.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <CatIcon size={16} className="text-[var(--color-cardio-primary)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold text-[var(--color-cardio-text)]">{ins.title}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${sev.badge}`}>
                      <SevIcon size={10} />
                      {ins.severity.charAt(0).toUpperCase() + ins.severity.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-cardio-text-light)] leading-relaxed">{ins.description}</p>
                  {ins.time && <p className="text-[10px] text-slate-400 mt-1">{ins.time}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
