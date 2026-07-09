import React, { useState } from 'react';
import { Palette, Type, LayoutList, PanelLeft } from 'lucide-react';

const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0
      ${enabled ? 'bg-[var(--color-cardio-primary)]' : 'bg-slate-200'}`}
  >
    <span
      className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
        ${enabled ? 'left-[22px]' : 'left-[3px]'}`}
    />
  </button>
);



const fontSizes = ['Small', 'Medium', 'Large'];

export default function AppearanceCard() {

  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'Medium');
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('compactMode') === 'true');
  const [sidebarLeft, setSidebarLeft] = useState(() => localStorage.getItem('sidebarLeft') !== 'false');



  const handleFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
  };

  const handleCompactMode = () => {
    const next = !compactMode;
    setCompactMode(next);
    localStorage.setItem('compactMode', next);
  };

  const handleSidebarLeft = () => {
    const next = !sidebarLeft;
    setSidebarLeft(next);
    localStorage.setItem('sidebarLeft', next);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
          <Palette size={14} className="text-rose-500" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Appearance</h3>
      </div>

      <div className="space-y-5 flex-1">


        {/* Font size */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cardio-text-light)] mb-2 flex items-center gap-1">
            <Type size={11} /> Font Size
          </label>
          <div className="flex gap-2">
            {fontSizes.map((size) => (
              <button
                key={size}
                onClick={() => handleFontSize(size)}
                className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all
                  ${fontSize === size
                    ? 'bg-[var(--color-cardio-primary)] text-white shadow-sm'
                    : 'bg-slate-100 text-[var(--color-cardio-text-light)] hover:bg-slate-200'
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-1">
          <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
              <LayoutList size={15} className="text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--color-cardio-text)]">Compact Mode</p>
              <p className="text-[11px] text-[var(--color-cardio-text-light)]">Reduce spacing for denser layouts</p>
            </div>
            <Toggle enabled={compactMode} onToggle={handleCompactMode} />
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
              <PanelLeft size={15} className="text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--color-cardio-text)]">Sidebar on Left</p>
              <p className="text-[11px] text-[var(--color-cardio-text-light)]">Position the navigation sidebar</p>
            </div>
            <Toggle enabled={sidebarLeft} onToggle={handleSidebarLeft} />
          </div>
        </div>
      </div>
    </div>
  );
}
