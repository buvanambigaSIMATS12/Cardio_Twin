import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pill, CheckCircle2, Circle } from 'lucide-react';
import api from '../api';

export default function MedicationTracker() {
  const navigate = useNavigate();
  const [medications, setMedications] = useState([]);
  const [adherence, setAdherence] = useState({ today_adherence: 0, weekly_adherence: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [medsRes, adhereRes] = await Promise.all([
        api.get('/tracking/medications'),
        api.get('/tracking/medications/adherence')
      ]);
      setMedications(medsRes.data);
      setAdherence(adhereRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const markTaken = async (id) => {
    try {
      await api.post(`/tracking/medications/${id}/taken`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (adherence.today_adherence / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <div className="bg-white px-4 pt-12 pb-4 flex items-center shadow-sm shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="text-xl font-bold ml-2 flex-1">Medication Tracker</h1>
        <button onClick={() => navigate('/medications/add')} className="p-2 bg-[var(--color-cardio-primary)] text-white rounded-full active:scale-90 transition-transform">
          <Plus size={24} />
        </button>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">My Medications</h2>
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading...</div>
          ) : medications.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center shadow-sm">
              <Pill size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No medications added yet.<br/>Tap + to add one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {medications.map(med => (
                <div key={med.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Pill size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{med.name}</h3>
                    <p className="text-sm text-slate-500">{med.dosage} • {med.frequency}</p>
                  </div>
                  <button 
                    onClick={() => !med.taken_today && markTaken(med.id)}
                    disabled={med.taken_today}
                    className={`shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-colors ${
                      med.taken_today 
                        ? 'bg-green-50 text-green-500' 
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100 active:bg-slate-200'
                    }`}
                  >
                    {med.taken_today ? (
                      <>
                        <CheckCircle2 size={24} className="mb-1" />
                        <span className="text-[10px] font-bold">TAKEN</span>
                      </>
                    ) : (
                      <>
                        <Circle size={24} className="mb-1" />
                        <span className="text-[10px] font-bold">MARK</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {medications.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-100"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="text-[var(--color-cardio-primary)] transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-bold text-slate-800">{Math.round(adherence.today_adherence)}%</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Today's Adherence</h3>
              <p className="text-slate-500 text-sm">Keep up the good work! Taking medications on time reduces your cardiac risk significantly.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
