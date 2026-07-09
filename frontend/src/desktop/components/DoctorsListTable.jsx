import React from 'react';
import { Star, CheckCircle, Clock, Stethoscope } from 'lucide-react';

export default function DoctorsListTable({ doctors = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <h3 className="text-sm font-bold text-[var(--color-cardio-text)] mb-4">All Doctors</h3>

      {doctors.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
          <Stethoscope size={28} className="mb-2" />
          <p className="text-sm">No doctors found</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-cardio-text-light)] py-2.5 pr-4">Doctor</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-cardio-text-light)] py-2.5 pr-4">Specialty</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-cardio-text-light)] py-2.5 pr-4">Hospital</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-cardio-text-light)] py-2.5 pr-4">Rating</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-cardio-text-light)] py-2.5 pr-4">Experience</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-cardio-text-light)] py-2.5">Availability</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc, i) => {
                const initials = doc.name.replace('Dr. ', '').split(' ').map(w => w[0]).join('').slice(0, 2);
                return (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    {/* Doctor name + avatar */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
                          {initials}
                        </div>
                        <span className="font-medium text-[var(--color-cardio-text)]">{doc.name}</span>
                      </div>
                    </td>
                    {/* Specialty */}
                    <td className="py-3 pr-4">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-[var(--color-cardio-text)]">
                        {doc.specialty}
                      </span>
                    </td>
                    {/* Hospital */}
                    <td className="py-3 pr-4 text-[var(--color-cardio-text-light)]">{doc.hospital}</td>
                    {/* Rating */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-400" fill="#fbbf24" />
                        <span className="font-semibold text-[var(--color-cardio-text)]">{doc.rating}</span>
                      </div>
                    </td>
                    {/* Experience */}
                    <td className="py-3 pr-4 text-[var(--color-cardio-text)]">{doc.experience}</td>
                    {/* Availability */}
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full
                        ${doc.available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {doc.available
                          ? <><CheckCircle size={11} /> Available</>
                          : <><Clock size={11} /> Unavailable</>
                        }
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
