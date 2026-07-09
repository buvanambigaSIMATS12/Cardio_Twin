import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getMediaURL } from '../api';
import { UploadCloud, FileImage, FileCheck, RefreshCw, Activity, Clock, Info, ChevronDown, ChevronUp } from 'lucide-react';

function ECGUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/ecg/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <div className="bg-[var(--color-cardio-primary)] text-white px-4 py-6 shadow-sm flex items-center justify-between">
        <div className="w-8"></div>
        <h1 className="text-xl font-semibold">ECG Analysis</h1>
        <button onClick={() => navigate('/ecg/history')} className="p-2 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">
          <Clock size={20} />
        </button>
      </div>

      <div className="p-6 flex-1 max-w-lg mx-auto w-full space-y-6">
        
        {/* Photo Guidance Tips */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl overflow-hidden transition-all shadow-sm">
          <button 
            onClick={() => setShowTips(!showTips)}
            className="w-full p-4 flex items-center justify-between text-left font-bold text-blue-900"
          >
            <div className="flex items-center gap-2">
              <Info size={18} className="text-blue-600" />
              <span>Tips for a Clear ECG Photo</span>
            </div>
            {showTips ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showTips && (
            <div className="px-4 pb-4 text-xs text-blue-800 space-y-1.5 border-t border-blue-100 pt-3">
              <p>• Lay the printed paper strip flat on a well-lit table.</p>
              <p>• Avoid harsh shadows, camera flash glare, or wrinkled folds over grid lines.</p>
              <p>• Ensure the full rhythm strip or all 12 leads are captured clearly within frame.</p>
              <p>• Hold the camera steady directly above the paper to avoid angle distortion.</p>
            </div>
          )}
        </div>

        {/* Upload Zone */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Upload your ECG</h2>
          <p className="text-sm text-slate-500 mb-6">Upload a photo or scanned copy of your ECG strip for instant ML analysis.</p>

          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <FileCheck size={48} className="text-green-500 mb-3" />
              ) : (
                <UploadCloud size={48} className="text-slate-400 mb-3" />
              )}
              <p className="mb-2 text-sm text-slate-600 font-semibold">
                {file ? file.name : "Click to select file"}
              </p>
              <p className="text-xs text-slate-500">PNG, JPG or PDF</p>
            </div>
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
          </label>

          <button 
            onClick={handleUpload}
            disabled={!file || loading}
            className={`mt-6 w-full flex items-center justify-center py-4 rounded-xl font-bold text-white transition-all ${
              !file || loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-[var(--color-cardio-primary)] hover:opacity-90 shadow-md'
            }`}
          >
            {loading ? (
              <><RefreshCw className="animate-spin mr-2" size={20} /> Analyzing...</>
            ) : (
              <><Activity className="mr-2" size={20} /> Start Analysis</>
            )}
          </button>
        </div>

        {/* Results Card */}
        {result && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${result.diagnosis.toLowerCase().includes('normal') ? 'bg-green-100' : 'bg-red-100'}`}>
                <Activity size={24} className={result.diagnosis.toLowerCase().includes('normal') ? 'text-green-600' : 'text-red-600'} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Diagnosis</p>
                <h3 className={`text-xl font-bold ${result.diagnosis.toLowerCase().includes('normal') ? 'text-green-600' : 'text-red-600'}`}>
                  {result.diagnosis}
                </h3>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-600">AI Confidence</span>
                <span className="text-sm font-bold text-slate-800">{result.confidence}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${result.confidence}%` }}></div>
              </div>
            </div>

            {result.heatmap_url && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-600 mb-2">Explainable AI Heatmap</p>
                <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200">
                  <img src={getMediaURL(result.heatmap_url)} alt="Grad-CAM Heatmap" className="w-full h-auto object-cover" />
                </div>
              </div>
            )}

            <button
              onClick={() => navigate(`/ecg/result/${result.id}`)}
              className="mt-6 w-full bg-[var(--color-cardio-primary)] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all"
            >
              <Info size={18} /> View Detailed AI Explanation & Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ECGUpload;
