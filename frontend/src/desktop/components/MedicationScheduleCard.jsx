import React from 'react';
import { Clock, CheckCircle, Circle, Sun, Sunset, Moon, Pill } from 'lucide-react';

const slotConfig = {
  morning:   { label: 'Morning',   time: '8:00 AM',  icon: Sun,    bg: 'bg-amber-50',  color: 'text-amber-500' },
  afternoon: { label: 'Afternoon', time: '2:00 PM',  icon: Sunset, bg: 'bg-orange-50', color: 'text-orange-500' },
  evening:   { label: 'Evening',   time: '9:00 PM',  icon: Moon,   bg: 'bg-indigo-50', color: 'text-indigo-500' },
};

export default function MedicationScheduleCard({ schedule = [], onMarkTaken }) {
  const totalMeds = schedule.reduce((sum, s) => sum + s.medications.length, 0);
  const takenCount = schedule.reduce(
    (sum, s) => sum + s.medications.filter((m) => m.taken).length,
    0
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Schedule</h3>
        <span className="text-xs font-medium text-[var(--color-cardio-text-light)]">
          {takenCount}/{totalMeds} completed
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-[var(--color-cardio-primary)] rounded-full transition-all duration-500"
          style={{ width: totalMeds > 0 ? `${(takenCount / totalMeds) * 100}%` : '0%' }}
        />
      </div>

      <div className="flex-1 space-y-4">
        {schedule.map((slot) => {
          const cfg = slotConfig[slot.slot] || slotConfig.morning;
          const SlotIcon = cfg.icon;
          return (
            <div key={slot.slot}>
              {/* Slot header */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                  <SlotIcon size={14} className={cfg.color} />
                </div>
                <span className="text-sm font-semibold text-[var(--color-cardio-text)]">{cfg.label}</span>
                <span className="text-[11px] text-[var(--color-cardio-text-light)]">{cfg.time}</span>
              </div>

              {/* Medications in this slot */}
              <div className="ml-9 space-y-1.5">
                {slot.medications.map((med) => {
                  const done = med.taken;
                  return (
                    <div
                      key={med.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors
                        ${done ? 'bg-green-50/60' : 'hover:bg-slate-50'}`}
                    >
                      {done
                        ? <CheckCircle size={16} className="text-[var(--color-cardio-primary)] shrink-0" />
                        : <Circle size={16} className="text-slate-300 shrink-0" />
                      }
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${done ? 'text-[var(--color-cardio-text-light)] line-through' : 'text-[var(--color-cardio-text)]'}`}>
                          {med.name}
                        </p>
                        <p className="text-[11px] text-[var(--color-cardio-text-light)]">{med.dosage}</p>
                      </div>
                      {done ? (
                        <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md shrink-0">
                          Taken ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => onMarkTaken && onMarkTaken(med.id)}
                          className="text-[11px] font-bold text-white bg-[var(--color-cardio-primary)] px-3 py-1.5 rounded-lg shrink-0 hover:opacity-90 active:scale-95 transition-all"
                        >
                          Take
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {schedule.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
          <Clock size={28} className="mb-2" />
          <p className="text-sm">No medications scheduled today</p>
        </div>
      )}
    </div>
  );
}
