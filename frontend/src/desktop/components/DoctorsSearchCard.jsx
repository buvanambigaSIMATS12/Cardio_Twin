import React from 'react';
import { Search, Filter, X } from 'lucide-react';

const specialties = ['All', 'Cardiology', 'Internal Medicine', 'Cardiac Surgery', 'Electrophysiology', 'Pediatric Cardiology'];

export default function DoctorsSearchCard({ query = '', onQueryChange, activeSpecialty = 'All', onSpecialtyChange }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange?.(e.target.value)}
            placeholder="Search doctors by name, specialty, or hospital..."
            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-[var(--color-cardio-text)]
              focus:outline-none focus:ring-2 focus:ring-[var(--color-cardio-primary)]/30 focus:border-[var(--color-cardio-primary)] transition-colors"
          />
          {query && (
            <button
              onClick={() => onQueryChange?.('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Specialty filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={14} className="text-slate-400 mr-1 shrink-0" />
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => onSpecialtyChange?.(spec)}
              className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all
                ${activeSpecialty === spec
                  ? 'bg-[var(--color-cardio-primary)] text-white shadow-sm'
                  : 'bg-slate-100 text-[var(--color-cardio-text-light)] hover:bg-slate-200'
                }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
