import React, { useState, useEffect } from 'react';
import { Info, RefreshCw, Smartphone, HardDrive, Cpu } from 'lucide-react';

export default function SystemInformationCard() {
  const [lastSynced, setLastSynced] = useState('—');
  const [storageUsed, setStorageUsed] = useState(0);
  const storageTotal = 500;

  useEffect(() => {
    // Compute last synced from localStorage timestamp (set by api interceptor pattern)
    const syncTime = localStorage.getItem('lastSynced');
    if (syncTime) {
      const d = new Date(syncTime);
      setLastSynced(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' — ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    } else {
      setLastSynced(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' — ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
      localStorage.setItem('lastSynced', new Date().toISOString());
    }

    // Estimate localStorage usage
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        total += (localStorage.getItem(key) || '').length;
      }
      // Convert bytes to MB (rough estimate: each char ~2 bytes in JS)
      const usedMB = Math.round((total * 2) / (1024 * 1024) * 100) / 100;
      setStorageUsed(Math.max(usedMB, 0.01));
    } catch {
      setStorageUsed(0);
    }
  }, []);

  const info = [
    { icon: Info,       label: 'App Version',    value: 'CardioTwin v2.4.1' },
    { icon: RefreshCw,  label: 'Last Synced',    value: lastSynced },
    { icon: Smartphone, label: 'Device',         value: `${navigator.userAgent.match(/Chrome\/\d+/) ? navigator.userAgent.match(/Chrome\/\d+/)[0].replace('/', ' ') : 'Browser'} · ${navigator.platform || 'Unknown'}` },
    { icon: Cpu,        label: 'Build',          value: 'Production · React 18.3' },
  ];

  const storagePct = storageTotal > 0 ? Math.min(Math.round((storageUsed / storageTotal) * 100), 100) : 0;
  const storageColor = storagePct >= 90 ? '#ef4444' : storagePct >= 70 ? '#f59e0b' : 'var(--color-cardio-primary)';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
          <Info size={14} className="text-slate-500" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">System Information</h3>
      </div>

      {/* Info rows */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {info.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} className="text-slate-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-cardio-text-light)]">{item.label}</span>
              </div>
              <p className="text-sm font-medium text-[var(--color-cardio-text)]">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Storage */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <HardDrive size={13} className="text-slate-400" />
            <span className="text-xs font-medium text-[var(--color-cardio-text)]">Local Storage</span>
          </div>
          <span className="text-xs text-[var(--color-cardio-text-light)]">
            {storageUsed < 1 ? `${(storageUsed * 1024).toFixed(0)} KB` : `${storageUsed.toFixed(1)} MB`} / {storageTotal} MB ({storagePct}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.max(storagePct, 1)}%`, backgroundColor: storageColor }}
          />
        </div>
      </div>
    </div>
  );
}
