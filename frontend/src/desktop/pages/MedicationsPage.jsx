import React, { useState, useEffect } from 'react';
import { Loader2, Plus, X, Pill } from 'lucide-react';
import api from '../../api';

import MedicationAdherenceCard from '../components/MedicationAdherenceCard';
import MedicationScheduleCard from '../components/MedicationScheduleCard';
import MedicationListTable from '../components/MedicationListTable';
import MedicationInteractionsCard from '../components/MedicationInteractionsCard';
import MedicationRefillCard from '../components/MedicationRefillCard';

/* ── Helpers ─────────────────────────────────────────────── */

/** Map frequency text → time-slot for the schedule card */
const frequencyToSlots = (freq) => {
  const f = (freq || '').toLowerCase();
  if (f.includes('twice')) return ['morning', 'evening'];
  if (f.includes('three')) return ['morning', 'afternoon', 'evening'];
  if (f.includes('night') || f.includes('evening')) return ['evening'];
  return ['morning']; // default: once daily → morning
};

/** Build schedule structure from flat medication list */
const buildSchedule = (medications) => {
  const slotMap = { morning: [], afternoon: [], evening: [] };
  medications.forEach((med) => {
    const slots = frequencyToSlots(med.frequency);
    slots.forEach((slot) => {
      slotMap[slot].push({
        id: med.id,
        name: med.name,
        dosage: med.dosage,
        form: 'Tablet',
        taken: med.taken_today,
      });
    });
  });
  return Object.entries(slotMap)
    .filter(([, meds]) => meds.length > 0)
    .map(([slot, meds]) => ({ slot, medications: meds }));
};

const buildTableRows = (medications) =>
  medications.map((med) => ({
    id: med.id,
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    category: '--',
    prescriber: '--',
    status: 'Active',
  }));

/** Build refill estimates from medications */
const buildRefills = (medications) =>
  medications.map((med) => {
    const startDate = med.start_date ? new Date(med.start_date) : new Date();
    const daysSinceStart = Math.max(1, Math.floor((Date.now() - startDate.getTime()) / 86400000));
    // Rough estimate: assume 30-tablet supply, consumed based on frequency
    const perDay = med.frequency?.toLowerCase().includes('twice') ? 2 :
                   med.frequency?.toLowerCase().includes('three') ? 3 : 1;
    const consumed = daysSinceStart * perDay;
    const remaining = Math.max(0, 30 - (consumed % 30));
    const daysLeft = Math.max(0, Math.floor(remaining / perDay));
    return {
      name: med.name,
      dosage: med.dosage,
      remaining: `${remaining} tablets`,
      daysLeft,
    };
  }).sort((a, b) => a.daysLeft - b.daysLeft);

/* ── Medications Page ────────────────────────────────────── */

export default function MedicationsPage() {
  const [medications, setMedications] = useState([]);
  const [adherence, setAdherence] = useState({ today_adherence: 0, weekly_adherence: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', dosage: '', frequency: 'Once daily' });
  const [addLoading, setAddLoading] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const [medsRes, adhereRes] = await Promise.all([
        api.get('/tracking/medications'),
        api.get('/tracking/medications/adherence'),
      ]);
      setMedications(medsRes.data);
      setAdherence(adhereRes.data);
    } catch (err) {
      console.error('Error fetching medications:', err);
      setError('Failed to load medications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkTaken = async (id) => {
    try {
      await api.post(`/tracking/medications/${id}/taken`);
      fetchData();
    } catch (err) {
      console.error('Error marking medication as taken:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tracking/medications/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting medication:', err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.dosage) return;
    setAddLoading(true);
    try {
      await api.post('/tracking/medications', {
        name: addForm.name,
        dosage: addForm.dosage,
        frequency: addForm.frequency,
        start_date: new Date().toISOString().split('T')[0],
      });
      setAddForm({ name: '', dosage: '', frequency: 'Once daily' });
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.error('Error adding medication:', err);
    } finally {
      setAddLoading(false);
    }
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 size={36} className="animate-spin mb-4 text-[var(--color-cardio-primary)]" />
        <p className="text-sm font-semibold">Loading medications…</p>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center py-32 text-slate-400">
        <p className="text-sm font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  /* ── Derived values ── */
  const takenCount = medications.filter((m) => m.taken_today).length;
  const totalCount = medications.length;
  const adherencePercent = Math.round(adherence.today_adherence);
  const schedule = buildSchedule(medications);
  const tableRows = buildTableRows(medications);
  const refills = buildRefills(medications);

  /* ── Empty State ── */
  if (!loading && medications.length === 0 && !error) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <Pill size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-[var(--color-cardio-text)] mb-2">No medications added yet</h3>
          <p className="text-sm text-[var(--color-cardio-text-light)] max-w-md mb-6">
            Add your first medication to start tracking adherence, scheduling, and refill reminders.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[var(--color-cardio-primary)] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-cardio-primary-dark)] transition-colors"
          >
            <Plus size={16} /> Add Medication
          </button>
        </div>

        {/* Add Modal */}
        {showAddModal && renderAddModal()}
      </div>
    );
  }

  /* ── Add Medication Modal ── */
  function renderAddModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 relative">
          <button
            onClick={() => setShowAddModal(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Pill size={20} className="text-[var(--color-cardio-primary)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-cardio-text)]">Add Medication</h3>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Medication Name</label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="e.g. Aspirin"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-cardio-primary)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dosage</label>
              <input
                type="text"
                value={addForm.dosage}
                onChange={(e) => setAddForm({ ...addForm, dosage: e.target.value })}
                placeholder="e.g. 10mg"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-cardio-primary)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Frequency</label>
              <select
                value={addForm.frequency}
                onChange={(e) => setAddForm({ ...addForm, frequency: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-cardio-primary)] transition-colors"
              >
                <option>Once daily</option>
                <option>Twice daily</option>
                <option>Three times daily</option>
                <option>Once at night</option>
                <option>As needed</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-cardio-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {addLoading ? 'Adding…' : 'Add Medication'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ── Data Loaded ── */
  return (
    <div className="max-w-[1600px] mx-auto space-y-6">

      {/* Add Medication button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[var(--color-cardio-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-cardio-primary-dark)] transition-colors"
        >
          <Plus size={16} /> Add Medication
        </button>
      </div>

      {/* Row 1: Adherence ring, Today's Schedule, Refills */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MedicationAdherenceCard
          adherence={adherencePercent}
          taken={takenCount}
          total={totalCount}
          streak={0}
          weeklyData={[]}
        />
        <div className="xl:col-span-2">
          <MedicationScheduleCard schedule={schedule} onMarkTaken={handleMarkTaken} />
        </div>
        <MedicationRefillCard refills={refills} />
      </div>

      {/* Row 2: Full medication table */}
      <div className="grid grid-cols-1 gap-6">
        <MedicationListTable medications={tableRows} onDelete={handleDelete} />
      </div>

      {/* Row 3: Drug Interactions (no backend endpoint — shows empty state) */}
      <div className="grid grid-cols-1 gap-6">
        <MedicationInteractionsCard interactions={[]} />
      </div>

      {/* Add Modal */}
      {showAddModal && renderAddModal()}
    </div>
  );
}
