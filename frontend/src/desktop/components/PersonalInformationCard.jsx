import React from 'react';
import { User } from 'lucide-react';

export default function PersonalInformationCard({ info = {} }) {
  const fields = [
    { label: 'Date of Birth', value: info.dob },
    { label: 'Gender',        value: info.gender },
    { label: 'Height',        value: info.height },
    { label: 'Weight',        value: info.weight },
    { label: 'BMI',           value: info.bmi },
    { label: 'Phone',         value: info.phone },
    { label: 'Email',         value: info.email },
    { label: 'Address',       value: info.address, span: true },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
          <User size={14} className="text-[var(--color-cardio-primary)]" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Information</h3>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 flex-1">
        {fields.map((f) => (
          <div key={f.label} className={f.span ? 'col-span-2' : ''}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cardio-text-light)] mb-1">{f.label}</p>
            <p className="text-sm font-medium text-[var(--color-cardio-text)]">{f.value || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
