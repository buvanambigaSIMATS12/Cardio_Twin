import React from 'react';
import { HeartPulse, CalendarCheck, Flame, MapPin, Droplets, Calendar } from 'lucide-react';

export default function ProfileSummaryCard({
  name = 'Patient',
  age = 0,
  gender = '',
  bloodType = '',
  memberSince = '',
  location = '',
  totalECGs = 0,
  appointments = 0,
  streak = 0,
}) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-6 flex-wrap">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0 text-white font-bold text-2xl shadow-md">
          {initials}
        </div>

        {/* Name & meta */}
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-xl font-bold text-[var(--color-cardio-text)]">{name}</h2>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs text-[var(--color-cardio-text-light)]">{age} yrs · {gender}</span>
            {bloodType && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                <Droplets size={10} /> {bloodType}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-cardio-text-light)]">
                <MapPin size={11} /> {location}
              </span>
            )}
            {memberSince && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-cardio-text-light)]">
                <Calendar size={11} /> Member since {memberSince}
              </span>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-5">
          {[
            { icon: HeartPulse, label: 'ECGs', value: totalECGs, color: 'text-rose-500', bg: 'bg-rose-50' },
            { icon: CalendarCheck, label: 'Appointments', value: appointments, color: 'text-blue-500', bg: 'bg-blue-50' },
            { icon: Flame, label: 'Day Streak', value: streak, color: 'text-orange-500', bg: 'bg-orange-50' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={s.color} />
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--color-cardio-text)] leading-tight">{s.value}</p>
                  <p className="text-[10px] text-[var(--color-cardio-text-light)]">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
