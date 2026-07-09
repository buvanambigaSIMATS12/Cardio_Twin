import React, { useState } from 'react';
import {
  Activity, HeartPulse, Pill, ClipboardList, Stethoscope,
  Calendar, ChevronDown, ChevronUp,
} from 'lucide-react';

const typeConfig = {
  vital:      { icon: Activity,      bg: 'bg-green-50',  color: 'text-[var(--color-cardio-primary)]', label: 'Vitals' },
  ecg:        { icon: HeartPulse,    bg: 'bg-rose-50',   color: 'text-rose-500',                      label: 'ECG' },
  medication: { icon: Pill,          bg: 'bg-blue-50',   color: 'text-blue-500',                      label: 'Medication' },
  symptom:    { icon: ClipboardList, bg: 'bg-amber-50',  color: 'text-amber-500',                     label: 'Symptom' },
  appointment:{ icon: Stethoscope,   bg: 'bg-violet-50', color: 'text-violet-500',                    label: 'Appointment' },
};

export default function ActivityTimeline({ groups = [] }) {
  const [expandedGroup, setExpandedGroup] = useState(0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Activity Timeline</h3>

      {groups.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
          <Calendar size={28} className="mb-2" />
          <p className="text-sm">No activity recorded</p>
        </div>
      ) : (
        <div className="flex-1 space-y-1">
          {groups.map((group, gi) => {
            const isOpen = expandedGroup === gi;
            return (
              <div key={gi}>
                {/* Date header */}
                <button
                  onClick={() => setExpandedGroup(isOpen ? -1 : gi)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-slate-400" />
                    <span className="text-xs font-semibold text-[var(--color-cardio-text)]">{group.date}</span>
                    <span className="text-[10px] text-[var(--color-cardio-text-light)]">
                      {group.events.length} event{group.events.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {isOpen
                    ? <ChevronUp size={14} className="text-slate-400" />
                    : <ChevronDown size={14} className="text-slate-400" />
                  }
                </button>

                {/* Events */}
                {isOpen && (
                  <div className="ml-4 border-l-2 border-slate-100 pl-4 space-y-1 pb-2">
                    {group.events.map((event, ei) => {
                      const cfg = typeConfig[event.type] || typeConfig.vital;
                      const Icon = cfg.icon;
                      return (
                        <div key={ei} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors relative">
                          {/* Dot on timeline */}
                          <div className="absolute -left-[22px] top-4 w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-300" />

                          <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                            <Icon size={15} className={cfg.color} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-[var(--color-cardio-text)]">{event.title}</p>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-[var(--color-cardio-text-light)]">
                                {cfg.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--color-cardio-text-light)] mt-0.5">{event.description}</p>
                          </div>
                          <span className="text-[11px] text-[var(--color-cardio-text-light)] whitespace-nowrap shrink-0 mt-0.5">
                            {event.time}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
