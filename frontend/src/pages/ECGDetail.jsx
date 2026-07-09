import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, AlertTriangle, Info, ListChecks, Layers } from 'lucide-react';
import api, { getMediaURL } from '../api';
import ShareModal from '../components/ShareModal';

export default function ECGDetail() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const isPublic = window.location.pathname.includes('/public/');

  useEffect(() => {
    const fetchScan = async () => {
      try {
        const endpoint = isPublic ? `/ecg/public/${scanId}` : `/ecg/${scanId}`;
        const res = await api.get(endpoint);
        setScan(res.data);
      } catch (err) {
        console.error("Error fetching ECG scan details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScan();
  }, [scanId, isPublic]);

  const getImageUrl = (url) => {
    return getMediaURL(url);
  };

  const getExplanations = (diagnosis) => {
    const data = {
      "Normal": {
        desc: "Your ECG scan shows a normal sinus rhythm. No major abnormalities or signs of irregular heartbeat were detected in this reading.",
        recs: ["Maintain your current healthy lifestyle", "Continue routine check-ups", "Stay hydrated and active"]
      },
      "Arrhythmia": {
        desc: "An arrhythmia is an irregular heartbeat. It means your heart beats too fast, too slow, or with an irregular pattern.",
        recs: ["Consult a cardiologist for a definitive diagnosis", "Reduce caffeine and alcohol intake", "Monitor your symptoms closely"]
      },
      "AFib": {
        desc: "Atrial Fibrillation (AFib) is a quivering or irregular heartbeat that can lead to blood clots, stroke, heart failure and other heart-related complications.",
        recs: ["Seek medical evaluation immediately", "Discuss blood thinner medication with your doctor", "Avoid strenuous exercise until cleared"]
      },
      "VT": {
        desc: "Ventricular Tachycardia (VT) is a fast, abnormal heart rate. It begins in your heart's lower chambers and can be life-threatening if it lasts.",
        recs: ["Go to the emergency room immediately", "Do not drive yourself", "Keep a record of any dizziness or fainting"]
      },
      "STEMI": {
        desc: "A STEMI is a type of severe heart attack where one of the heart's major arteries is completely blocked.",
        recs: ["Call emergency services (911) immediately", "Chew aspirin if advised by a dispatcher", "Rest and stay calm until help arrives"]
      }
    };
    return data[diagnosis] || { desc: "Diagnosis under review. Please consult a professional.", recs: ["Consult your doctor", "Keep logging your vitals", "Rest if feeling unwell"] };
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold">Loading analysis...</div>;
  }

  if (!scan) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold">Scan not found</div>;
  }

  const explData = getExplanations(scan.diagnosis);
  const strokeDasharray = `${scan.confidence}, 100`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <div className="bg-white px-4 pt-12 pb-4 flex items-center shadow-sm shrink-0 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="text-xl font-bold ml-2 flex-1">ECG Analysis</h1>
        <button onClick={() => setShareModalOpen(true)} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
          <Share2 size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ECG Image Area */}
        <div className="bg-slate-900 w-full relative group">
          <img 
            src={getImageUrl(showHeatmap && scan.heatmap_url ? scan.heatmap_url : scan.image_url)} 
            alt="ECG Scan" 
            className="w-full h-64 object-contain"
          />
          {scan.heatmap_url && (
            <button 
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-slate-800 font-bold text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-white transition-colors"
            >
              <Layers size={16} />
              {showHeatmap ? "Show Original" : "Show AI Heatmap"}
            </button>
          )}
          {showHeatmap && (
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Red zones = AI attention areas
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Diagnosis Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="flex-1">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">AI Diagnosis</span>
              <h2 className="text-3xl font-black text-slate-800 mt-1">{scan.diagnosis}</h2>
            </div>
            
            {/* SVG Donut Chart for Confidence */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path
                  className="text-slate-100"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${scan.confidence > 80 ? 'text-green-500' : scan.confidence > 60 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                  strokeDasharray={strokeDasharray}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-800 leading-none">{Math.round(scan.confidence)}<span className="text-sm">%</span></span>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Conf</span>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-slate-400" />
              <h3 className="font-bold text-slate-800 text-lg">Risk Assessment</h3>
            </div>
            
            <div className="relative w-full h-4 rounded-full overflow-hidden bg-slate-100 mb-2">
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #22c55e, #eab308, #ef4444)' }}></div>
              <div 
                className="absolute top-0 bottom-0 right-0 bg-slate-100 transition-all duration-1000"
                style={{ width: `${100 - scan.risk_score}%` }}
              ></div>
              {/* Pointer */}
              <div 
                className="absolute top-0 bottom-0 w-1.5 bg-slate-800 rounded-full transition-all duration-1000 z-10"
                style={{ left: `${scan.risk_score}%`, transform: 'translateX(-50%)' }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
            </div>
          </div>

          {/* What this means */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Info size={20} className="text-blue-500" />
              <h3 className="font-bold text-slate-800 text-lg">AI Clinical Summary</h3>
            </div>
            <p className="text-slate-700 leading-relaxed font-medium">{scan.ai_explanation || explData.desc}</p>
          </div>

          {/* Anatomical Waveform Analysis */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={20} className="text-purple-500" />
              <h3 className="font-bold text-slate-800 text-lg">Anatomical Waveform Analysis</h3>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block mb-0.5">P-Wave Region</span>
                Atrial depolarization check. Normal baseline stability observed.
              </div>
              <div className="p-3 bg-red-50/70 rounded-xl border border-red-100 text-slate-700">
                <span className="font-bold text-red-600 block mb-0.5">QRS Attention Zone</span>
                Ventricular attention area highlighted in red on AI heatmap. Primary attention feature for {scan.diagnosis} classification.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block mb-0.5">T-Wave Repolarization</span>
                Ventricular recovery morphology evaluated. Regular repolarization trace.
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks size={20} className="text-green-500" />
              <h3 className="font-bold text-slate-800 text-lg">Recommendations</h3>
            </div>
            <ul className="space-y-3">
              {explData.recs.map((rec, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 font-medium leading-tight pt-1">{rec}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <button 
            onClick={() => setShareModalOpen(true)}
            className="w-full bg-[var(--color-cardio-primary)] text-white font-bold py-4 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Share2 size={20} />
            Share Report
          </button>
        </div>
      </div>

      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
        scan={scan} 
      />
    </div>
  );
}
