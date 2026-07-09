import React from 'react';
import { MapPin, Building2, Phone, AlertCircle, CheckCircle } from 'lucide-react';

export default function NearbyHospitalsCard({ hospitals = [] }) {
  /* Derive map center from first hospital with valid coordinates, else use mobile default */
  const located = hospitals.find((h) => h.lat != null && h.lng != null);
  const centerLat = located ? located.lat : 11.93;
  const centerLng = located ? located.lng : 79.83;
  const offset = 0.025;
  const bbox = `${(centerLng - offset).toFixed(2)}%2C${(centerLat - offset).toFixed(2)}%2C${(centerLng + offset).toFixed(2)}%2C${(centerLat + offset).toFixed(2)}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${centerLat}%2C${centerLng}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Nearby Hospitals</h3>

      {/* OpenStreetMap embed — same approach as mobile Search page */}
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm h-48 mb-4 relative">
        <iframe
          title="Nearby Hospitals"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={mapSrc}
          style={{ border: 0 }}
        ></iframe>
        <span className="absolute bottom-1 right-1 bg-white/80 text-[9px] px-1.5 py-0.5 rounded text-slate-600 font-bold">
          OpenStreetMap
        </span>
      </div>

      {hospitals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
          <Building2 size={28} className="mb-2" />
          <p className="text-sm">No hospitals nearby</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2">
          {hospitals.map((h, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-[var(--color-cardio-text)] truncate">{h.name}</p>
                  {h.emergency && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 shrink-0">
                      <AlertCircle size={9} /> 24/7 ER
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-cardio-text-light)]">
                    <MapPin size={11} /> {h.distance}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-cardio-text-light)]">
                    <CheckCircle size={11} /> {h.departments} depts
                  </span>
                  {h.phone && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-cardio-text-light)]">
                      <Phone size={11} /> {h.phone}
                    </span>
                  )}
                </div>
                {h.specialties && h.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {h.specialties.map((s, j) => (
                      <span key={j} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
