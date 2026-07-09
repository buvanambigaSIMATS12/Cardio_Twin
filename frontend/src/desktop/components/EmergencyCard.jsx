import React from 'react';
import { AlertTriangle, Phone } from 'lucide-react';

export default function EmergencyCard() {
  return (
    <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle size={18} className="text-red-500" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-red-600">Emergency</h3>
      </div>

      <p className="text-xs text-red-500/80 mb-4 flex-1">
        In case of chest pain or cardiac emergency, call for help immediately.
      </p>

      <div className="space-y-2">
        <a
          href="tel:112"
          className="flex items-center justify-center gap-2 w-full bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors"
        >
          <Phone size={14} /> Call 112
        </a>
        <button className="w-full bg-white text-red-600 py-2.5 rounded-xl font-semibold text-sm border border-red-200 hover:bg-red-50 transition-colors cursor-pointer">
          Emergency Contacts
        </button>
      </div>
    </div>
  );
}
