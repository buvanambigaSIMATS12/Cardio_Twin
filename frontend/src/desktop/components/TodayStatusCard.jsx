import React from 'react';
import { Activity, Heart, Wind } from 'lucide-react';

const statConfig = {
  bp:        { label: 'Blood Pressure', unit: 'mmHg', icon: Activity, iconBg: 'bg-green-50',  iconColor: 'text-[var(--color-cardio-primary)]' },
  heartRate: { label: 'Heart Rate',     unit: 'bpm',  icon: Heart,    iconBg: 'bg-rose-50',   iconColor: 'text-rose-500' },
  spo2:      { label: 'SpO2',           unit: '%',    icon: Wind,     iconBg: 'bg-blue-50',   iconColor: 'text-blue-500' },
};

export default function TodayStatusCard({ bp = '--/--', heartRate = '--', spo2 = '--' }) {
  const stats = [
    { key: 'bp',        value: bp },
    { key: 'heartRate', value: heartRate },
    { key: 'spo2',      value: spo2 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Today's Status</h3>

      <div className="flex-1 flex flex-col gap-3 justify-center">
        {stats.map(({ key, value }) => {
          const cfg = statConfig[key];
          const Icon = cfg.icon;
          return (
            <div key={key} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${cfg.iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={16} className={cfg.iconColor} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[var(--color-cardio-text-light)]">{cfg.label}</p>
                <p className="text-sm font-bold text-[var(--color-cardio-text)]">
                  {value} <span className="text-xs font-normal text-[var(--color-cardio-text-light)]">{cfg.unit}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
