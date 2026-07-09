import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Plus, History, Heart, Wind, Activity, AlertCircle, BatteryLow, Droplet, Check, Brain, Phone, RefreshCw, AlertTriangle, Shield, Zap } from 'lucide-react';
import api from '../api';

const commonSymptoms = [
  { id: 'Chest Pain', icon: Heart, colorClass: 'text-red-500', bgClass: 'bg-red-50', borderClass: 'border-red-500', activeBg: 'bg-red-500' },
  { id: 'Shortness of Breath', icon: Wind, colorClass: 'text-blue-500', bgClass: 'bg-blue-50', borderClass: 'border-blue-500', activeBg: 'bg-blue-500' },
  { id: 'Palpitations', icon: Activity, colorClass: 'text-orange-500', bgClass: 'bg-orange-50', borderClass: 'border-orange-500', activeBg: 'bg-orange-500' },
  { id: 'Dizziness', icon: AlertCircle, colorClass: 'text-yellow-500', bgClass: 'bg-yellow-50', borderClass: 'border-yellow-500', activeBg: 'bg-yellow-500' },
  { id: 'Fatigue', icon: BatteryLow, colorClass: 'text-slate-500', bgClass: 'bg-slate-50', borderClass: 'border-slate-500', activeBg: 'bg-slate-500' },
  { id: 'Swelling in legs', icon: Droplet, colorClass: 'text-purple-500', bgClass: 'bg-purple-50', borderClass: 'border-purple-500', activeBg: 'bg-purple-500' },
  { id: 'No symptoms today', icon: Check, colorClass: 'text-green-500', bgClass: 'bg-green-50', borderClass: 'border-green-500', activeBg: 'bg-green-500' },
];

const urgencyIcons = {
  Low: Shield,
  Moderate: AlertCircle,
  High: AlertTriangle,
  Emergency: Zap,
};

export default function SymptomLogger() {
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [view, setView] = useState('log');

  const fetchHistory = async () => {
    try {
      const res = await api.get('/tracking/symptoms');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (view === 'history') fetchHistory();
  }, [view]);

  const toggleSymptom = (symp) => {
    setSelectedSymptoms(prev =>
      prev.includes(symp) ? prev.filter(s => s !== symp) : [...prev, symp]
    );
    setAnalysis(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) return;
    setLoading(true);
    setAnalyzing(true);
    setAnalysis(null);
    try {
      // Log the symptom to DB
      await api.post('/tracking/symptoms', { symptoms: selectedSymptoms, severity, notes });

      // Get AI analysis simultaneously
      const aiRes = await api.post('/ai/symptom-analysis', {
        symptoms: selectedSymptoms,
        severity,
        notes,
      });
      setAnalysis(aiRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const resetForm = () => {
    setSelectedSymptoms([]);
    setSeverity(5);
    setNotes('');
    setAnalysis(null);
  };

  const UrgencyIcon = analysis ? (urgencyIcons[analysis.urgency] || Shield) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <div className="bg-white px-4 pt-12 pb-4 flex items-center shadow-sm shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="text-xl font-bold ml-2 flex-1">Symptom Logger</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-white shadow-sm border-b border-slate-100 shrink-0">
        <button
          onClick={() => { setView('log'); setAnalysis(null); }}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
            view === 'log' ? 'border-[var(--color-cardio-primary)] text-[var(--color-cardio-primary)]' : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Plus size={18} /> Log Symptoms
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
            view === 'history' ? 'border-[var(--color-cardio-primary)] text-[var(--color-cardio-primary)]' : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <History size={18} /> History
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === 'log' ? (
          <div className="p-6 space-y-5">
            {/* AI Analysis Result */}
            {analysis && (
              <div
                className="rounded-3xl p-5 border-2 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ borderColor: analysis.urgency_color, backgroundColor: analysis.urgency_color + '12' }}
              >
                {/* Urgency Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: analysis.urgency_color + '20' }}
                  >
                    {UrgencyIcon && <UrgencyIcon size={24} style={{ color: analysis.urgency_color }} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: analysis.urgency_color }}>
                      AI Analysis · {analysis.urgency} Urgency
                    </p>
                    <p className="text-slate-800 font-bold text-base">{analysis.seek_care_message}</p>
                  </div>
                </div>

                {/* Interpretation */}
                <p className="text-slate-700 text-sm leading-relaxed mb-4">{analysis.cardiac_interpretation}</p>

                {/* Possible causes */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Possible Causes</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.possible_causes.map((cause, i) => (
                      <span key={i} className="text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-700">
                        {cause}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Immediate actions */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Immediate Actions</p>
                  <ul className="space-y-2">
                    {analysis.immediate_actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="font-black mt-0.5" style={{ color: analysis.urgency_color }}>•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Emergency CTA */}
                {analysis.seek_care && analysis.urgency === 'Emergency' && (
                  <a
                    href="tel:112"
                    className="flex items-center justify-center gap-3 w-full bg-red-600 text-white py-3 rounded-2xl font-bold text-base mt-2 shadow-lg shadow-red-600/30"
                  >
                    <Phone size={20} /> Call 112 (Emergency)
                  </a>
                )}

                {/* Ask AI */}
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => navigate('/chat', { state: { initialMessage: `I'm experiencing: ${selectedSymptoms.join(', ')} with severity ${severity}/10. ${notes}. What should I do?` } })}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm"
                  >
                    <Brain size={16} /> Ask AI Cardiologist
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 bg-white text-slate-500 font-bold text-sm"
                  >
                    <RefreshCw size={16} /> Log Again
                  </button>
                </div>
              </div>
            )}

            {/* Symptom selector — hide after analysis */}
            {!analysis && (
              <>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center shrink-0">
                      <Stethoscope size={20} />
                    </div>
                    <h2 className="font-bold text-slate-800 text-lg">What are you feeling?</h2>
                  </div>
                  <p className="text-slate-500 text-sm mb-4">Select all symptoms you are currently experiencing.</p>

                  <div className="grid grid-cols-2 gap-3">
                    {commonSymptoms.map(symp => {
                      const isSelected = selectedSymptoms.includes(symp.id);
                      const Icon = symp.icon;
                      return (
                        <button
                          key={symp.id}
                          onClick={() => toggleSymptom(symp.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                            isSelected
                              ? `${symp.activeBg} text-white ${symp.borderClass} shadow-md`
                              : `${symp.bgClass} ${symp.colorClass} border-transparent hover:brightness-95`
                          }`}
                        >
                          <Icon size={24} className={isSelected ? 'text-white' : symp.colorClass} />
                          <span className={`text-xs font-bold text-center ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                            {symp.id}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h2 className="font-bold text-slate-800 text-lg mb-2">Severity</h2>
                  <p className="text-slate-500 text-sm mb-6">On a scale of 1 to 10, how severe are these symptoms?</p>
                  <div className="px-2">
                    <input
                      type="range" min="1" max="10" value={severity}
                      onChange={e => setSeverity(parseInt(e.target.value))}
                      style={{ background: 'linear-gradient(to right, #22c55e, #eab308, #ef4444)' }}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-800 [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <div className="flex justify-between mt-3 text-slate-400 text-xs font-bold px-1">
                      <span>Mild (1)</span>
                      <span className="text-slate-800 text-lg -mt-1">{severity}</span>
                      <span>Severe (10)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h2 className="font-bold text-slate-800 text-lg mb-4">Additional Notes</h2>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="What were you doing when it started? How long did it last?"
                    rows="3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedSymptoms.length === 0}
                  className="w-full bg-[var(--color-cardio-primary)] text-white font-bold py-4 rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><RefreshCw size={18} className="animate-spin" /> Analysing with AI...</>
                  ) : (
                    <><Brain size={18} /> Save & AI Analyse</>
                  )}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="p-6">
            {history.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center shadow-sm">
                <History size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No symptoms logged yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map(log => {
                  const date = new Date(log.logged_at);
                  const isSevere = log.severity >= 7;
                  return (
                    <div key={log.id} className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 ${isSevere ? 'border-l-4 border-l-red-500' : ''}`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-slate-400">
                          {date.toLocaleString('default', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isSevere ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                          Severity: {log.severity}/10
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {log.symptoms.split(',').map((s, i) => (
                          <span key={i} className="text-sm font-medium bg-orange-50 text-orange-700 px-3 py-1 rounded-lg">{s.trim()}</span>
                        ))}
                      </div>
                      {log.notes && (
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{log.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
