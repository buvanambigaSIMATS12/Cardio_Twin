import React from 'react';
import { Dumbbell, Utensils, Moon, Lightbulb } from 'lucide-react';

const categoryConfig = {
  Exercise:  { icon: Dumbbell,  badge: 'bg-green-100 text-green-700' },
  Diet:      { icon: Utensils,  badge: 'bg-amber-100 text-amber-700' },
  Lifestyle: { icon: Moon,      badge: 'bg-purple-100 text-purple-700' },
  General:   { icon: Lightbulb, badge: 'bg-blue-100 text-blue-700' },
};

export default function RecommendationsCard({ recommendations = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Recommendations</h3>
        <Lightbulb size={16} className="text-[var(--color-cardio-primary)]" />
      </div>

      {recommendations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
          <Lightbulb size={28} className="mb-2" />
          <p className="text-sm">No recommendations yet</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3">
          {recommendations.map((rec, i) => {
            const cfg = categoryConfig[rec.category] || categoryConfig.General;
            const Icon = cfg.icon;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={15} className="text-[var(--color-cardio-primary)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[var(--color-cardio-text)]">{rec.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-cardio-text-light)]">{rec.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
