import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertTriangle, RefreshCw, Stethoscope } from 'lucide-react';
import api from '../../api';

import DoctorsSearchCard from '../components/DoctorsSearchCard';
import DoctorProfileCard from '../components/DoctorProfileCard';
import DoctorsListTable from '../components/DoctorsListTable';
import NearbyHospitalsCard from '../components/NearbyHospitalsCard';

/* ── Helpers: map API response → component-expected shape ── */

const SPECIALTY_BADGES = {
  'Interventional Cardiologist': ['Interventional', 'Angioplasty', 'Stenting'],
  'Cardiac Electrophysiologist': ['Ablation', 'Pacemaker', 'Arrhythmia'],
  'Preventive Cardiologist': ['Preventive', 'Lipidology', 'Hypertension'],
  'Heart Failure Specialist': ['Heart Failure', 'Transplant', 'LVAD'],
  'Echocardiographer': ['Echocardiography', 'Imaging', 'Stress Test'],
  'Vascular Cardiologist': ['Vascular', 'PAD', 'Aneurysm'],
  'Cardiology': ['Cardiology', 'Heart Care', 'Prevention'],
  'Cardiac Surgery': ['CABG', 'Valve Repair', 'Minimally Invasive'],
  'Internal Medicine': ['Diabetes', 'Hypertension', 'Geriatric'],
};

function normalizeDoctor(d, index) {
  const specialty = d.specialty || 'Cardiology';
  return {
    name: d.name || 'Dr. Unknown',
    specialty,
    hospital: d.hospital || 'Medical Center',
    experience: d.experience_years ? `${d.experience_years} years` : '10+ years',
    rating: parseFloat(d.rating) || 4.5,
    reviews: parseInt(d.reviews) || 0,
    phone: d.phone || '',
    email: '',
    available: index % 3 !== 2, // Vary availability
    nextSlot: '',
    badges: SPECIALTY_BADGES[specialty] || [specialty],
    distance: d.distance || '',
    id: d.id,
  };
}

function normalizeHospital(h) {
  return {
    name: h.name || 'Hospital',
    distance: h.distance || '',
    departments: Math.floor(Math.random() * 12) + 5,
    emergency: true,
    phone: '',
    specialties: ['Cardiology', 'Emergency', 'Internal Medicine'],
    lat: h.lat ?? null,
    lng: h.lng ?? null,
  };
}

/* ── Doctors Page ─────────────────────────────────────────── */

export default function DoctorsPage() {
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('All');

  const [allDoctors, setAllDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docRes, hospRes] = await Promise.all([
        api.get('/search/doctors'),
        api.get('/search/hospitals'),
      ]);
      setAllDoctors((docRes.data || []).map(normalizeDoctor));
      setHospitals((hospRes.data || []).map(normalizeHospital));
    } catch (err) {
      console.error('Failed to load doctors/hospitals', err);
      setError('Unable to load doctors. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return allDoctors.filter((d) => {
      const matchesQuery = !query ||
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.specialty.toLowerCase().includes(query.toLowerCase()) ||
        d.hospital.toLowerCase().includes(query.toLowerCase());
      const matchesSpec = specialty === 'All' || d.specialty === specialty;
      return matchesQuery && matchesSpec;
    });
  }, [query, specialty, allDoctors]);

  /* Pick top 2 available doctors for the featured cards */
  const featured = filtered.filter(d => d.available).slice(0, 2);
  /* If not enough available, pad with top-rated */
  while (featured.length < 2 && filtered.length > featured.length) {
    const next = filtered.find(d => !featured.includes(d));
    if (next) featured.push(next);
    else break;
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 size={36} className="animate-spin text-[var(--color-cardio-primary)] mb-4" />
        <p className="text-sm font-medium">Loading doctors &amp; hospitals…</p>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center py-32 text-slate-500">
        <AlertTriangle size={36} className="text-amber-500 mb-4" />
        <p className="text-sm font-medium mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[var(--color-cardio-primary)] text-white hover:opacity-90 transition-opacity"
        >
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    );
  }

  /* ── Empty state (no data at all from backend) ── */
  if (allDoctors.length === 0 && hospitals.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center py-32 text-slate-400">
        <Stethoscope size={36} className="mb-4" />
        <p className="text-sm font-medium">No doctors or hospitals available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">

      {/* Row 1: Search & Filters */}
      <DoctorsSearchCard
        query={query}
        onQueryChange={setQuery}
        activeSpecialty={specialty}
        onSpecialtyChange={setSpecialty}
      />

      {/* Row 2: Featured Doctor Profiles */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {featured.map((doc, i) => (
            <DoctorProfileCard key={doc.id || i} doctor={doc} />
          ))}
        </div>
      )}

      {/* Row 3: Full Doctor List + Nearby Hospitals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DoctorsListTable doctors={filtered} />
        </div>
        <NearbyHospitalsCard hospitals={hospitals} />
      </div>

    </div>
  );
}
