import React, { useState } from 'react';
import { Bell, Pill, HeartPulse, CalendarCheck, BarChart3, Mail, Smartphone, MessageSquare } from 'lucide-react';

const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0
      ${enabled ? 'bg-[var(--color-cardio-primary)]' : 'bg-slate-200'}`}
  >
    <span
      className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
        ${enabled ? 'left-[22px]' : 'left-[3px]'}`}
    />
  </button>
);

const alertConfig = [
  { key: 'medReminders',   icon: Pill,          label: 'Medication Reminders',  desc: 'Daily reminders for scheduled medications' },
  { key: 'ecgAlerts',      icon: HeartPulse,    label: 'ECG Alerts',            desc: 'Notifications for abnormal ECG results' },
  { key: 'appointmentRem', icon: CalendarCheck,  label: 'Appointment Reminders', desc: '24-hour advance appointment alerts' },
  { key: 'weeklyReport',   icon: BarChart3,     label: 'Weekly Health Report',  desc: 'Summary of your weekly health metrics' },
  { key: 'abnormalVitals', icon: HeartPulse,    label: 'Abnormal Vitals',       desc: 'Alert when vitals exceed safe ranges' },
];

const channelConfig = [
  { key: 'email', icon: Mail,          label: 'Email' },
  { key: 'push',  icon: Smartphone,    label: 'Push' },
  { key: 'sms',   icon: MessageSquare, label: 'SMS' },
];

const defaultAlerts = {
  medReminders:   true,
  ecgAlerts:      true,
  appointmentRem: true,
  weeklyReport:   false,
  abnormalVitals: true,
};

const defaultChannels = {
  email: true,
  push:  true,
  sms:   false,
};

function loadJSON(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export default function NotificationSettingsCard() {
  const [alerts, setAlerts] = useState(() => loadJSON('notifAlerts', defaultAlerts));
  const [channels, setChannels] = useState(() => loadJSON('notifChannels', defaultChannels));

  const toggleAlert = (key) => {
    setAlerts(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('notifAlerts', JSON.stringify(next));
      return next;
    });
  };

  const toggleChannel = (key) => {
    setChannels(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('notifChannels', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <Bell size={14} className="text-blue-500" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notifications</h3>
      </div>

      {/* Alert toggles */}
      <div className="space-y-1 flex-1">
        {alertConfig.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.key} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-slate-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--color-cardio-text)]">{a.label}</p>
                <p className="text-[11px] text-[var(--color-cardio-text-light)]">{a.desc}</p>
              </div>
              <Toggle enabled={alerts[a.key]} onToggle={() => toggleAlert(a.key)} />
            </div>
          );
        })}
      </div>

      {/* Channels */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cardio-text-light)] mb-3">Delivery Channels</p>
        <div className="flex gap-3">
          {channelConfig.map((ch) => {
            const Icon = ch.icon;
            const active = channels[ch.key];
            return (
              <button
                key={ch.key}
                onClick={() => toggleChannel(ch.key)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all
                  ${active
                    ? 'bg-[var(--color-cardio-primary)] text-white shadow-sm'
                    : 'bg-slate-100 text-[var(--color-cardio-text-light)] hover:bg-slate-200'
                  }`}
              >
                <Icon size={13} /> {ch.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
