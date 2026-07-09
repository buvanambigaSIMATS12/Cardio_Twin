import React, { useState } from 'react';
import { ArrowLeft, Bell, Globe, Database, Smartphone, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AppSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    dataSync: true
  });

  const toggle = (key) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
  };

  const handleClearCache = () => {
    localStorage.clear();
    alert('Cache cleared successfully. You will be logged out.');
    navigate('/splash');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-[var(--color-cardio-primary)] text-white px-4 py-6 shadow-sm rounded-b-3xl shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">App Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-8">
        
        {/* General */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase px-4">General</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button className="w-full flex items-center px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors">
              <Globe size={20} className="text-slate-400 mr-3" />
              <span className="flex-1 text-left text-slate-700 font-medium">Language</span>
              <span className="text-slate-400 text-sm mr-2">English</span>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
          </div>
        </div>



        {/* Data & Storage */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase px-4">Data & Storage</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <Database size={20} className="text-slate-400" />
                <span className="text-slate-700 font-medium">Background Sync</span>
              </div>
              <button 
                onClick={() => toggle('dataSync')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.dataSync ? 'bg-[var(--color-cardio-primary)]' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.dataSync ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <hr className="border-slate-100 mx-4" />
            <button onClick={handleClearCache} className="w-full flex items-center px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors">
              <Smartphone size={20} className="text-slate-400 mr-3" />
              <span className="flex-1 text-left text-slate-700 font-medium">Clear Cache</span>
              <span className="text-slate-400 text-sm mr-2">124 MB</span>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
          </div>
        </div>

        <div className="text-center text-slate-400 text-xs mt-8 mb-4">
          <p>CardioTwin v1.0.0</p>
        </div>

      </div>
    </div>
  );
}
