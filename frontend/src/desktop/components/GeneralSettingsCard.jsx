import React, { useState } from 'react';
import { Globe, Clock, Calendar, Ruler } from 'lucide-react';

const selectClass = `w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-[var(--color-cardio-text)]
  focus:outline-none focus:ring-2 focus:ring-[var(--color-cardio-primary)]/30 focus:border-[var(--color-cardio-primary)] transition-colors appearance-none cursor-pointer`;

export default function GeneralSettingsCard() {
  const [language, setLanguage] = useState(() => localStorage.getItem('settingsLanguage') || 'English');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('settingsTimezone') || 'Asia/Kolkata (IST)');
  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('settingsDateFormat') || 'DD/MM/YYYY');
  const [units, setUnits] = useState(() => localStorage.getItem('settingsUnits') || 'metric');

  const handleChange = (setter, key) => (val) => {
    setter(val);
    localStorage.setItem(key, val);
  };

  const fields = [
    { icon: Globe,    label: 'Language',    value: language,   onChange: handleChange(setLanguage, 'settingsLanguage'),   options: ['English', 'Hindi', 'Tamil', 'Telugu', 'Spanish', 'French'] },
    { icon: Clock,    label: 'Timezone',    value: timezone,   onChange: handleChange(setTimezone, 'settingsTimezone'),   options: ['Asia/Kolkata (IST)', 'US/Eastern (EST)', 'US/Pacific (PST)', 'Europe/London (GMT)', 'Asia/Tokyo (JST)'] },
    { icon: Calendar, label: 'Date Format', value: dateFormat, onChange: handleChange(setDateFormat, 'settingsDateFormat'), options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
  ];

  const handleUnits = (u) => {
    setUnits(u);
    localStorage.setItem('settingsUnits', u);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
          <Globe size={14} className="text-[var(--color-cardio-primary)]" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">General</h3>
      </div>

      <div className="space-y-4 flex-1">
        {fields.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.label}>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cardio-text-light)] mb-1.5 block">{f.label}</label>
              <select value={f.value} onChange={(e) => f.onChange(e.target.value)} className={selectClass}>
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          );
        })}

        {/* Units toggle */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cardio-text-light)] mb-1.5 block">
            <Ruler size={11} className="inline mr-1" />
            Measurement Units
          </label>
          <div className="flex gap-2">
            {['metric', 'imperial'].map((u) => (
              <button
                key={u}
                onClick={() => handleUnits(u)}
                className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all
                  ${units === u
                    ? 'bg-[var(--color-cardio-primary)] text-white shadow-sm'
                    : 'bg-slate-100 text-[var(--color-cardio-text-light)] hover:bg-slate-200'
                  }`}
              >
                {u === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lb, in)'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
