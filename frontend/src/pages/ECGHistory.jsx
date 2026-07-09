import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Share2, ChevronRight, GitCompare } from 'lucide-react';
import api, { getMediaURL } from '../api';
import ShareModal from '../components/ShareModal';

export default function ECGHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModalScan, setShareModalScan] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/ecg/history');
        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching ECG history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getImageUrl = (url) => {
    return getMediaURL(url);
  };

  const getConfidenceColor = (conf) => {
    if (conf > 80) return 'bg-green-100 text-green-700';
    if (conf >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <div className="bg-white px-4 pt-12 pb-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-800" />
          </button>
          <h1 className="text-xl font-bold ml-2">ECG History</h1>
        </div>
        {history.length >= 2 && (
          <button 
            onClick={() => navigate('/ecg/compare')}
            className="flex items-center gap-1.5 bg-blue-50 text-blue-600 font-bold text-xs px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
          >
            <GitCompare size={16} /> Compare
          </button>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="text-center py-10 text-slate-400">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center shadow-sm mt-10">
            <Activity size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium mb-6">No ECG scans yet.<br/>Upload your first ECG to get started.</p>
            <button 
              onClick={() => navigate('/ecg')}
              className="bg-[var(--color-cardio-primary)] text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform"
            >
              Upload ECG
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map(scan => {
              const date = new Date(scan.scan_date);
              const formattedDate = `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()} · ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
              
              return (
                <div key={scan.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img src={getImageUrl(scan.image_url)} alt="ECG Thumbnail" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-800">{scan.diagnosis}</h3>
                      <div className="flex items-center gap-2 mt-1 mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getConfidenceColor(scan.confidence)}`}>
                          {Math.round(scan.confidence)}% Confidence
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{formattedDate}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-slate-50">
                    <button 
                      onClick={() => navigate(`/ecg/result/${scan.id}`)}
                      className="flex-1 flex justify-center items-center gap-1 py-2 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      View Details <ChevronRight size={16} />
                    </button>
                    <button 
                      onClick={() => setShareModalScan(scan)}
                      className="px-4 flex justify-center items-center py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ShareModal 
        isOpen={!!shareModalScan} 
        onClose={() => setShareModalScan(null)} 
        scan={shareModalScan} 
      />
    </div>
  );
}
