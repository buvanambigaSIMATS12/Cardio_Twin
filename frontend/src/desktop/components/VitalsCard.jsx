import React, { useState } from 'react';
import { Activity, Heart, Wind, Droplets, Plus } from 'lucide-react';
import LogVitalsModal from './LogVitalsModal';

const vitalConfig = {
  bp:         { label: 'Blood Pressure', unit: 'mmHg',  icon: Activity, iconBg: 'bg-green-50',  iconColor: 'text-[var(--color-cardio-primary)]' },
  heartRate:  { label: 'Heart Rate',     unit: 'bpm',   icon: Heart,    iconBg: 'bg-rose-50',   iconColor: 'text-rose-500' },
  spo2:       { label: 'SpO2',           unit: '%',     icon: Wind,     iconBg: 'bg-blue-50',   iconColor: 'text-blue-500' },
  bloodSugar: { label: 'Blood Sugar',    unit: 'mg/dL', icon: Droplets, iconBg: 'bg-amber-50',  iconColor: 'text-amber-500' },
};

export default function VitalsCard({ bp = '--/--', heartRate = '--', spo2 = '--', bloodSugar = '--', onVitalsLogged }) {
  const [modalOpen, setModalOpen] = useState(false);

  const vitals = [
    { key: 'bp',         value: bp },
    { key: 'heartRate',  value: heartRate },
    { key: 'spo2',       value: spo2 },
    { key: 'bloodSugar', value: bloodSugar },
  ];

  const handleSuccess = () => {
    onVitalsLogged?.();
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Vitals Overview</h3>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--color-cardio-primary), #059669)',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Log Vitals
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {vitals.map(({ key, value }) => {
            const cfg = vitalConfig[key];
            const Icon = cfg.icon;
            return (
              <div key={key} className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${cfg.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={cfg.iconColor} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-[var(--color-cardio-text-light)]">{cfg.label}</p>
                  <p className="text-sm font-bold text-[var(--color-cardio-text)]">
                    {value} <span className="text-[10px] font-normal text-[var(--color-cardio-text-light)]">{cfg.unit}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LogVitalsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}

