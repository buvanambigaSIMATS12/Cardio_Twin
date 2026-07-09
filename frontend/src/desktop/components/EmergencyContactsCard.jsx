import React from 'react';
import { Phone, Mail, Users, ShieldCheck } from 'lucide-react';

export default function EmergencyContactsCard({ contacts = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
          <ShieldCheck size={14} className="text-red-500" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Contacts</h3>
      </div>

      {contacts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
          <Users size={28} className="mb-2" />
          <p className="text-sm">No emergency contacts added</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2.5">
          {contacts.map((c, i) => {
            const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2);
            return (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shrink-0 text-white text-xs font-bold">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[var(--color-cardio-text)]">{c.name}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[var(--color-cardio-primary)]">
                      {c.relationship}
                    </span>
                    {c.primary && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {c.phone && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-cardio-text-light)]">
                        <Phone size={11} /> {c.phone}
                      </span>
                    )}
                    {c.email && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-cardio-text-light)]">
                        <Mail size={11} /> {c.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
