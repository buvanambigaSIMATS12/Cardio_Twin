import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill } from 'lucide-react';
import api from '../api';

export default function AddMedication() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    start_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tracking/medications', formData);
      navigate(-1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <div className="bg-white px-4 pt-12 pb-4 flex items-center shadow-sm shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="text-xl font-bold ml-2">Add Medication</h1>
      </div>

      <div className="flex-1 p-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Pill size={32} />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Medication Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Aspirin"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-cardio-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Dosage</label>
              <input 
                type="text" 
                value={formData.dosage}
                onChange={e => setFormData({...formData, dosage: e.target.value})}
                placeholder="e.g. 10mg"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-cardio-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Frequency</label>
              <select 
                value={formData.frequency}
                onChange={e => setFormData({...formData, frequency: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-cardio-primary)]"
              >
                <option>Once daily</option>
                <option>Twice daily</option>
                <option>Three times daily</option>
                <option>As needed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
              <input 
                type="date"
                value={formData.start_date}
                onChange={e => setFormData({...formData, start_date: e.target.value})}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-cardio-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Notes (Optional)</label>
              <textarea 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="e.g. Take after meals"
                rows="3"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-cardio-primary)] resize-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[var(--color-cardio-primary)] text-white font-bold py-4 rounded-xl mt-4 active:scale-95 transition-transform disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Medication'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
