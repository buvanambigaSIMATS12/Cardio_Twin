import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Plus, X, Heart, Zap, Wind, Droplets, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area, BarChart, Bar } from 'recharts';
import api from '../api';

const INITIAL_FORM = {
  systolic_bp: 120,
  diastolic_bp: 80,
  heart_rate: 72,
  spo2: 98,
  blood_sugar: 110,
};

function validateForm(form) {
  const errors = {};
  if (!form.systolic_bp || form.systolic_bp < 50 || form.systolic_bp > 300)
    errors.systolic_bp = 'Systolic BP must be 50–300';
  if (!form.diastolic_bp || form.diastolic_bp < 20 || form.diastolic_bp > 200)
    errors.diastolic_bp = 'Diastolic BP must be 20–200';
  if (!form.heart_rate || form.heart_rate < 20 || form.heart_rate > 250)
    errors.heart_rate = 'Heart rate must be 20–250';
  if (form.spo2 !== '' && form.spo2 !== null && form.spo2 !== undefined) {
    if (form.spo2 < 0 || form.spo2 > 100) errors.spo2 = 'SpO₂ must be 0–100';
  }
  if (form.blood_sugar !== '' && form.blood_sugar !== null && form.blood_sugar !== undefined) {
    if (form.blood_sugar < 0 || form.blood_sugar > 600) errors.blood_sugar = 'Blood sugar must be 0–600';
  }
  return errors;
}

export default function VitalsTracker() {
  const navigate = useNavigate();
  const [vitals, setVitals] = useState([]);
  const [activeTab, setActiveTab] = useState('bp');
  const [loading, setLoading] = useState(true);

  // Log Vitals form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState(null); // 'success' | 'error' | null

  const fetchVitals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/tracking/vitals');
      // Reverse to get chronological order for charts
      const formattedData = res.data.reverse().map(v => {
        const date = new Date(v.recorded_at);
        return {
          ...v,
          dateLabel: `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`
        };
      });
      setVitals(formattedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  const handleFormChange = (key, raw) => {
    const val = raw === '' ? '' : parseInt(raw, 10) || 0;
    setFormData(prev => ({ ...prev, [key]: val }));
    setFormErrors(prev => ({ ...prev, [key]: undefined }));
    setFormStatus(null);
  };

  const closeForm = () => {
    if (!submitting) {
      setShowForm(false);
      setFormData({ ...INITIAL_FORM });
      setFormErrors({});
      setFormStatus(null);
    }
  };

  const handleFormSubmit = async () => {
    const errs = validateForm(formData);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setSubmitting(true);
    setFormStatus(null);
    try {
      await api.post('/tracking/vitals', formData);
      setFormStatus('success');
      setTimeout(() => {
        setShowForm(false);
        setFormData({ ...INITIAL_FORM });
        setFormErrors({});
        setFormStatus(null);
        fetchVitals();
      }, 1200);
    } catch (err) {
      console.error('Failed to submit vitals:', err);
      setFormStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderTabs = () => (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
      {[
        { id: 'bp', label: 'Blood Pressure' },
        { id: 'hr', label: 'Heart Rate' },
        { id: 'spo2', label: 'SpO2' },
        { id: 'sugar', label: 'Blood Sugar' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
            activeTab === tab.id 
              ? 'bg-[var(--color-cardio-primary)] text-white' 
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const getLatest = (key) => vitals.length > 0 ? vitals[vitals.length - 1][key] : null;

  const getBpStatus = (sys, dia) => {
    if (!sys || !dia) return 'Unknown';
    if (sys < 120 && dia < 80) return 'Normal';
    if (sys >= 120 && sys <= 129 && dia < 80) return 'Elevated';
    if (sys >= 130 || dia >= 80) return 'High';
    return 'Normal';
  };

  const getBpStatusColor = (status) => {
    if (status === 'Normal') return 'text-green-500 bg-green-50';
    if (status === 'Elevated') return 'text-orange-500 bg-orange-50';
    if (status === 'High') return 'text-red-500 bg-red-50';
    return 'text-slate-500 bg-slate-50';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <div className="bg-white px-4 pt-12 pb-4 flex items-center shadow-sm shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="text-xl font-bold ml-2 flex-1">Vitals Charts</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[var(--color-cardio-primary)] text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Log Vitals
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {renderTabs()}

        {loading ? (
          <div className="text-center py-10 text-slate-400">Loading charts...</div>
        ) : vitals.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center shadow-sm">
            <Activity size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No vitals logged yet.<br/>Go to Sim tab to log vitals.</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Blood Pressure Chart */}
            {activeTab === 'bp' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-in fade-in">
                <h3 className="font-bold text-slate-800 mb-6">Blood Pressure (mmHg)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer>
                    <LineChart data={vitals}>
                      <XAxis dataKey="dateLabel" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis domain={['auto', 'auto']} tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Line type="monotone" dataKey="systolic_bp" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444', strokeWidth: 0}} name="Systolic" />
                      <Line type="monotone" dataKey="diastolic_bp" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 0}} name="Diastolic" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 font-medium block text-sm">Latest Reading</span>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${getBpStatusColor(getBpStatus(getLatest('systolic_bp'), getLatest('diastolic_bp')))}`}>
                      {getBpStatus(getLatest('systolic_bp'), getLatest('diastolic_bp'))}
                    </span>
                  </div>
                  <span className="font-bold text-lg text-slate-800">{getLatest('systolic_bp')}/{getLatest('diastolic_bp')} mmHg</span>
                </div>
              </div>
            )}

            {/* Heart Rate Chart */}
            {activeTab === 'hr' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-in fade-in">
                <h3 className="font-bold text-slate-800 mb-6">Heart Rate (bpm)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer>
                    <LineChart data={vitals}>
                      <XAxis dataKey="dateLabel" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis domain={['auto', 'auto']} tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <ReferenceLine y={60} stroke="#cbd5e1" strokeDasharray="3 3" />
                      <ReferenceLine y={100} stroke="#cbd5e1" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="heart_rate" stroke="var(--color-cardio-primary)" strokeWidth={3} dot={{r: 4, fill: 'var(--color-cardio-primary)', strokeWidth: 0}} name="Heart Rate" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Latest Reading</span>
                  <span className="font-bold text-lg text-slate-800">{getLatest('heart_rate')} bpm</span>
                </div>
              </div>
            )}

            {/* SpO2 Chart */}
            {activeTab === 'spo2' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-in fade-in">
                <h3 className="font-bold text-slate-800 mb-6">Blood Oxygen (%)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer>
                    <AreaChart data={vitals}>
                      <defs>
                        <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8}/>
                          <stop offset="40%" stopColor="#22c55e" stopOpacity={0.8}/>
                          <stop offset="40%" stopColor="#eab308" stopOpacity={0.8}/>
                          <stop offset="60%" stopColor="#eab308" stopOpacity={0.8}/>
                          <stop offset="60%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="dateLabel" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis domain={[90, 100]} tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <ReferenceLine y={95} stroke="#ef4444" strokeDasharray="3 3" />
                      <Area type="monotone" dataKey="spo2" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorSpo2)" name="SpO2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Latest Reading</span>
                  <span className="font-bold text-lg text-slate-800">{getLatest('spo2')}%</span>
                </div>
              </div>
            )}

            {/* Blood Sugar Chart */}
            {activeTab === 'sugar' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-in fade-in">
                <h3 className="font-bold text-slate-800 mb-6">Blood Sugar (mg/dL)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer>
                    <BarChart data={vitals}>
                      <XAxis dataKey="dateLabel" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 'auto']} tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="3 3" />
                      <ReferenceLine y={126} stroke="#ef4444" strokeDasharray="3 3" />
                      <Bar dataKey="blood_sugar" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Blood Sugar" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Latest Reading</span>
                  <span className="font-bold text-lg text-slate-800">{getLatest('blood_sugar') || '--'} mg/dL</span>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Log Vitals Slide-Up Sheet */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full bg-white rounded-t-3xl shadow-2xl"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Activity size={20} className="text-[var(--color-cardio-primary)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Log Vitals</h2>
                  <p className="text-xs text-slate-400">Enter your current readings</p>
                </div>
              </div>
              <button onClick={closeForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="px-6 space-y-5 pb-4">
              {/* Blood Pressure */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <span className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center">
                    <Heart size={14} className="text-rose-500" />
                  </span>
                  Blood Pressure
                  <span className="text-slate-400 font-normal">mmHg</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={formData.systolic_bp}
                    onChange={(e) => handleFormChange('systolic_bp', e.target.value)}
                    placeholder="120"
                    min={50}
                    max={300}
                    className={`flex-1 px-4 py-3 rounded-xl border ${
                      formErrors.systolic_bp ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'
                    } text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-cardio-primary)] transition-all`}
                  />
                  <span className="text-slate-400 font-bold text-lg">/</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={formData.diastolic_bp}
                    onChange={(e) => handleFormChange('diastolic_bp', e.target.value)}
                    placeholder="80"
                    min={20}
                    max={200}
                    className={`flex-1 px-4 py-3 rounded-xl border ${
                      formErrors.diastolic_bp ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'
                    } text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-cardio-primary)] transition-all`}
                  />
                </div>
                {(formErrors.systolic_bp || formErrors.diastolic_bp) && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.systolic_bp || formErrors.diastolic_bp}</p>
                )}
              </div>

              {/* Heart Rate */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <span className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center">
                    <Zap size={14} className="text-orange-500" />
                  </span>
                  Heart Rate
                  <span className="text-slate-400 font-normal">bpm</span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={formData.heart_rate}
                  onChange={(e) => handleFormChange('heart_rate', e.target.value)}
                  placeholder="72"
                  min={20}
                  max={250}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    formErrors.heart_rate ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'
                  } font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-cardio-primary)] transition-all`}
                />
                {formErrors.heart_rate && <p className="text-xs text-red-500 mt-1">{formErrors.heart_rate}</p>}
              </div>

              {/* SpO2 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <span className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                    <Wind size={14} className="text-blue-500" />
                  </span>
                  SpO₂
                  <span className="text-slate-400 font-normal">%</span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={formData.spo2}
                  onChange={(e) => handleFormChange('spo2', e.target.value)}
                  placeholder="98"
                  min={0}
                  max={100}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    formErrors.spo2 ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'
                  } font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-cardio-primary)] transition-all`}
                />
                {formErrors.spo2 && <p className="text-xs text-red-500 mt-1">{formErrors.spo2}</p>}
              </div>

              {/* Blood Sugar */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <span className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center">
                    <Droplets size={14} className="text-purple-500" />
                  </span>
                  Blood Sugar
                  <span className="text-slate-400 font-normal">mg/dL</span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={formData.blood_sugar}
                  onChange={(e) => handleFormChange('blood_sugar', e.target.value)}
                  placeholder="110"
                  min={0}
                  max={600}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    formErrors.blood_sugar ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'
                  } font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-cardio-primary)] transition-all`}
                />
                {formErrors.blood_sugar && <p className="text-xs text-red-500 mt-1">{formErrors.blood_sugar}</p>}
              </div>
            </div>

            {/* Status Messages */}
            {formStatus === 'success' && (
              <div className="mx-6 mb-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 text-green-600 text-sm font-medium">
                <CheckCircle2 size={16} /> Vitals saved successfully!
              </div>
            )}
            {formStatus === 'error' && (
              <div className="mx-6 mb-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-medium">
                <AlertCircle size={16} /> Failed to save. Please try again.
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-6 pb-8 pt-2 flex gap-3">
              <button
                onClick={closeForm}
                disabled={submitting}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={submitting || formStatus === 'success'}
                className={`flex-1 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all ${
                  formStatus === 'success'
                    ? 'bg-green-500'
                    : 'bg-[var(--color-cardio-primary)] hover:opacity-90 shadow-lg'
                } disabled:opacity-60`}
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving…</>
                ) : formStatus === 'success' ? (
                  <><CheckCircle2 size={16} /> Saved!</>
                ) : (
                  'Save Vitals'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
