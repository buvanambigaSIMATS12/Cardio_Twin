import React from 'react';
import { Upload, FileHeart } from 'lucide-react';

export default function ECGUploadCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">ECG Analysis</h3>

      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl py-8 px-4">
        <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
          <FileHeart size={26} className="text-[var(--color-cardio-primary)]" />
        </div>
        <p className="text-sm font-semibold text-[var(--color-cardio-text)] mb-1">Upload ECG Scan</p>
        <p className="text-xs text-[var(--color-cardio-text-light)] text-center mb-4">
          AI-powered analysis with Grad-CAM heatmap
        </p>
        <button className="flex items-center gap-2 bg-[var(--color-cardio-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-cardio-primary-dark)] transition-colors cursor-pointer">
          <Upload size={16} /> Upload ECG
        </button>
      </div>
    </div>
  );
}
