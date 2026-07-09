import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitCompare, Layers, Activity, Calendar } from 'lucide-react';
import api, { getMediaURL } from '../api';

export default function ECGComparison() {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanAId, setScanAId] = useState('');
  const [scanBId, setScanBId] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/ecg/history');
        setScans(res.data);
        if (res.data.length >= 2) {
          setScanAId(res.data[0].id);
          setScanBId(res.data[1].id);
        } else if (res.data.length === 1) {
          setScanAId(res.data[0].id);
        }
      } catch (err) {
        console.error("Error fetching history for comparison:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getImageUrl = (url) => {
    return getMediaURL(url);
  };

  const scanA = scans.find(s => String(s.id) === String(scanAId));
  const scanB = scans.find(s => String(s.id) === String(scanBId));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold">
        Loading scan comparison...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 flex items-center shadow-sm shrink-0 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <div className="ml-2 flex items-center gap-2">
          <GitCompare size={20} className="text-[var(--color-cardio-primary)]" />
          <h1 className="text-xl font-bold text-slate-800">ECG Comparison</h1>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto w-full space-y-6">
        {scans.length < 2 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-sm font-medium text-center">
            You need at least two uploaded ECG scans in your history to compare them side-by-side.
          </div>
        )}

        {/* Comparison Selection Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Baseline Scan A</label>
            <select 
              value={scanAId} 
              onChange={e => setScanAId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[var(--color-cardio-primary)]"
            >
              <option value="">Select scan...</option>
              {scans.map(s => (
                <option key={s.id} value={s.id}>
                  Scan #{s.id} - {s.diagnosis} ({new Date(s.uploaded_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Follow-up Scan B</label>
            <select 
              value={scanBId} 
              onChange={e => setScanBId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[var(--color-cardio-primary)]"
            >
              <option value="">Select scan...</option>
              {scans.map(s => (
                <option key={s.id} value={s.id}>
                  Scan #{s.id} - {s.diagnosis} ({new Date(s.uploaded_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side by Side Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Panel A */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
            <div className="bg-slate-900 relative h-48 flex items-center justify-center">
              {scanA ? (
                <img src={getImageUrl(scanA.heatmap_url || scanA.image_url)} alt="Scan A" className="w-full h-full object-contain" />
              ) : (
                <span className="text-slate-600 text-sm font-bold">No scan selected</span>
              )}
              <span className="absolute top-3 left-3 bg-white/90 text-slate-900 text-xs font-black px-2.5 py-1 rounded-lg shadow">
                SCAN A
              </span>
            </div>
            {scanA && (
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Diagnosis</span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar size={12} /> {new Date(scanA.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mt-0.5">{scanA.diagnosis}</h3>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
                  <span className="text-slate-500">AI Confidence</span>
                  <span className="font-bold text-slate-800">{Math.round(scanA.confidence)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Panel B */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
            <div className="bg-slate-900 relative h-48 flex items-center justify-center">
              {scanB ? (
                <img src={getImageUrl(scanB.heatmap_url || scanB.image_url)} alt="Scan B" className="w-full h-full object-contain" />
              ) : (
                <span className="text-slate-600 text-sm font-bold">No scan selected</span>
              )}
              <span className="absolute top-3 left-3 bg-[var(--color-cardio-primary)] text-white text-xs font-black px-2.5 py-1 rounded-lg shadow">
                SCAN B
              </span>
            </div>
            {scanB && (
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Diagnosis</span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar size={12} /> {new Date(scanB.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mt-0.5">{scanB.diagnosis}</h3>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
                  <span className="text-slate-500">AI Confidence</span>
                  <span className="font-bold text-slate-800">{Math.round(scanB.confidence)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparative Analysis Summary Card */}
        {scanA && scanB && (
          <div className="bg-gradient-to-r from-blue-500 to-[var(--color-cardio-primary)] rounded-3xl p-6 text-white shadow-lg space-y-3">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Activity size={22} />
              <span>Comparative AI Evaluation</span>
            </div>
            <p className="text-sm text-blue-100 leading-relaxed font-medium">
              Comparing Scan #{scanA.id} ({scanA.diagnosis}) against Scan #{scanB.id} ({scanB.diagnosis}). 
              {scanA.diagnosis === scanB.diagnosis ? (
                " Both readings maintain consistent cardiac rhythm classifications across the recording intervals."
              ) : (
                ` Noticeable morphological shift observed between ${scanA.diagnosis} and ${scanB.diagnosis}. Please consult your healthcare provider regarding rhythm progression.`
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
