import React, { useState } from 'react';
import { SlidersHorizontal, Play, RotateCcw, Loader2 } from 'lucide-react';
import api from '../../api';

const initialParams = {
  weight_kg:      { label: 'Weight',          unit: 'kg',  min: 40,  max: 150, step: 1,   value: 78  },
  sleep_hours:    { label: 'Sleep Hours',     unit: 'hrs', min: 3,   max: 10,  step: 0.5, value: 7   },
  med_adherence:  { label: 'Med Adherence',   unit: '%',   min: 0,   max: 100, step: 5,   value: 90  },
};

export default function SimulationPanel({ baselineRisk = 15 }) {
  const [params, setParams] = useState(initialParams);
  const [hasChanged, setHasChanged] = useState(false);
  const [projectedRisk, setProjectedRisk] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const displayBaseline = Math.round(baselineRisk * 10) / 10;
  const displayProjected = projectedRisk !== null ? projectedRisk : displayBaseline;
  const riskDelta = (displayProjected - displayBaseline).toFixed(1);

  const handleSlider = (key, val) => {
    setParams((prev) => ({
      ...prev,
      [key]: { ...prev[key], value: Number(val) },
    }));
    setHasChanged(true);
    // Clear previous result when sliders change
    setProjectedRisk(null);
  };

  const handleReset = () => {
    setParams(initialParams);
    setHasChanged(false);
    setProjectedRisk(null);
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const res = await api.post('/twin/simulate', {
        sleep_hours: params.sleep_hours.value,
        weight_kg: params.weight_kg.value,
        med_adherence: params.med_adherence.value,
      });
      setProjectedRisk(res.data.simulated_risk_score);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const deltaColor = riskDelta > 0 ? 'text-red-500' : riskDelta < 0 ? 'text-[var(--color-cardio-primary)]' : 'text-slate-400';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">What-If Simulation</h3>
        <SlidersHorizontal size={16} className="text-[var(--color-cardio-primary)]" />
      </div>

      {/* Sliders */}
      <div className="space-y-4 flex-1">
        {Object.entries(params).map(([key, p]) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--color-cardio-text)]">{p.label}</span>
              <span className="text-xs font-bold text-[var(--color-cardio-text)]">
                {p.value} <span className="font-normal text-[var(--color-cardio-text-light)]">{p.unit}</span>
              </span>
            </div>
            <input
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              value={p.value}
              onChange={(e) => handleSlider(key, e.target.value)}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--color-cardio-primary) ${((p.value - p.min) / (p.max - p.min)) * 100}%, #e2e8f0 ${((p.value - p.min) / (p.max - p.min)) * 100}%)`,
              }}
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
              <span>{p.min}</span>
              <span>{p.max}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Result comparison */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[10px] text-[var(--color-cardio-text-light)] mb-1">Baseline</p>
            <p className="text-lg font-bold text-[var(--color-cardio-text)]">{displayBaseline}%</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-cardio-text-light)] mb-1">Projected</p>
            <p className="text-lg font-bold text-[var(--color-cardio-text)]">{displayProjected}%</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-cardio-text-light)] mb-1">Change</p>
            <p className={`text-lg font-bold ${deltaColor}`}>
              {riskDelta > 0 ? '+' : ''}{riskDelta}%
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleReset}
            disabled={!hasChanged}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-cardio-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {simulating
              ? <><Loader2 size={13} className="animate-spin" /> Running…</>
              : <><Play size={13} /> Run Simulation</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
