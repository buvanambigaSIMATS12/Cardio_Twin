import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Heart, Pill, ClipboardList, Clock } from 'lucide-react';
import api from '../api';

export default function ActivityHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/tracking/history');
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'vital': return <Activity size={20} className="text-blue-500" />;
      case 'ecg': return <Heart size={20} className="text-red-500" />;
      case 'medication': return <Pill size={20} className="text-purple-500" />;
      case 'symptom': return <ClipboardList size={20} className="text-orange-500" />;
      default: return <Clock size={20} className="text-slate-500" />;
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'vital': return 'bg-blue-50 border-blue-100';
      case 'ecg': return 'bg-red-50 border-red-100';
      case 'medication': return 'bg-purple-50 border-purple-100';
      case 'symptom': return 'bg-orange-50 border-orange-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="text-xl font-bold ml-2">Activity History</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center mt-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-cardio-primary)]"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center mt-12 text-slate-500">
            <Clock size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="font-medium">No recent activities found.</p>
          </div>
        ) : (
          <div className="space-y-4 relative">
            {/* Timeline vertical line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-200 z-0"></div>
            
            {history.map((item, index) => {
              const date = new Date(item.timestamp);
              const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

              return (
                <div key={item.id} className="relative z-10 flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border bg-white ${getColor(item.type).split(' ')[1]}`}>
                    {getIcon(item.type)}
                  </div>
                  <div className={`flex-1 rounded-2xl p-4 shadow-sm border ${getColor(item.type)}`}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-800 text-sm">{item.title}</h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-white/50 px-2 py-0.5 rounded-full">
                        {formattedDate} • {formattedTime}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
