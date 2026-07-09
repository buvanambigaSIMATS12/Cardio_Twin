import React, { useState } from 'react';
import { Pill, Search, CheckCircle, AlertTriangle, Clock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export default function MedicationListTable({ medications = [], onDelete }) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortAsc
      ? <ChevronUp size={12} className="inline ml-0.5" />
      : <ChevronDown size={12} className="inline ml-0.5" />;
  };

  const filtered = medications
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()) ||
                 m.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
      return sortAsc ? cmp : -cmp;
    });

  const statusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
            <CheckCircle size={11} /> Active
          </span>
        );
      case 'Paused':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
            <Clock size={11} /> Paused
          </span>
        );
      case 'Discontinued':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
            <AlertTriangle size={11} /> Stopped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[var(--color-cardio-text)]">All Medications</h3>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-[var(--color-cardio-text)]
              focus:outline-none focus:ring-2 focus:ring-[var(--color-cardio-primary)]/30 focus:border-[var(--color-cardio-primary)] transition-colors w-44"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
          <Pill size={28} className="mb-2" />
          <p className="text-sm">{search ? 'No matches found' : 'No medications added'}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  { key: 'name',      label: 'Medication' },
                  { key: 'dosage',    label: 'Dosage' },
                  { key: 'frequency', label: 'Frequency' },
                  { key: 'category',  label: 'Category' },
                  { key: 'prescriber',label: 'Prescriber' },
                  { key: 'status',    label: 'Status' },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-cardio-text-light)] py-2.5 pr-4 cursor-pointer select-none hover:text-[var(--color-cardio-text)] transition-colors"
                  >
                    {col.label}<SortIcon field={col.key} />
                  </th>
                ))}
                {onDelete && (
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-cardio-text-light)] py-2.5 pr-4">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((med, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                        <Pill size={13} className="text-[var(--color-cardio-primary)]" />
                      </div>
                      <span className="font-medium text-[var(--color-cardio-text)]">{med.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-cardio-text)]">{med.dosage}</td>
                  <td className="py-3 pr-4 text-[var(--color-cardio-text)]">{med.frequency}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-[var(--color-cardio-text)]">
                      {med.category}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-cardio-text-light)]">{med.prescriber}</td>
                  <td className="py-3">{statusBadge(med.status)}</td>
                  {onDelete && med.id && (
                    <td className="py-3">
                      <button
                        onClick={() => onDelete(med.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete medication"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
