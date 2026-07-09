import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';

export default function ECGPreviewPanel({ imageSrc, label = 'ECG Preview' }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => { setZoom(1); setRotation(0); };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[var(--color-cardio-text)]">{label}</h3>

        {/* Toolbar */}
        <div className="flex items-center gap-1">
          <button onClick={handleZoomIn} title="Zoom In"
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <ZoomIn size={16} className="text-slate-500" />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out"
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <ZoomOut size={16} className="text-slate-500" />
          </button>
          <button onClick={handleRotate} title="Rotate"
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <RotateCw size={16} className="text-slate-500" />
          </button>
          <button onClick={handleReset} title="Reset"
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <Maximize2 size={16} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center min-h-[260px]">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="ECG Scan"
            className="max-w-full max-h-full object-contain transition-transform duration-300"
            style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
          />
        ) : (
          /* Placeholder ECG waveform (SVG) */
          <div className="flex flex-col items-center gap-3">
            <svg width="280" height="80" viewBox="0 0 280 80" fill="none" className="text-[var(--color-cardio-primary)]">
              <polyline
                points="0,40 30,40 40,40 50,20 55,60 60,10 65,70 70,35 80,40 120,40 135,40 145,15 150,55 155,5 160,65 165,32 175,40 210,40 230,40 238,25 242,50 246,18 250,58 254,38 260,40 280,40"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-xs text-[var(--color-cardio-text-light)]">Upload an ECG to preview here</p>
          </div>
        )}
      </div>

      {/* Zoom indicator */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[11px] text-[var(--color-cardio-text-light)]">
          Zoom: {Math.round(zoom * 100)}% · Rotation: {rotation}°
        </span>
        <span className="text-[11px] text-[var(--color-cardio-text-light)]">
          Click toolbar to adjust view
        </span>
      </div>
    </div>
  );
}
