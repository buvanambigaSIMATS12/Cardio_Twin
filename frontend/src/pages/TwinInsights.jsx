import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Heart, Flame, Shield, AlertTriangle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import api from '../api';

export default function TwinInsights() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get('/twin/insights');
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch insights', err);
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const { risk_score, population_avg_risk, health_score, population_avg_health, latest_bp, risk_factors, age_group } = data;

  // Extract systolic for chart
  const userSystolic = latest_bp !== '--/--' ? parseInt(latest_bp.split('/')[0]) : 0;

  const comparisonData = [
    {
      name: 'Risk Score (%)',
      You: risk_score,
      Average: population_avg_risk,
    },
    {
      name: 'Health Score',
      You: health_score,
      Average: population_avg_health,
    },
    {
      name: 'Systolic BP',
      You: userSystolic,
      Average: 120,
    }
  ];

  // SVG Gauge Calculations
  const rotation = (Math.min(Math.max(risk_score, 0), 100) / 100) * 180;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Twin Insights</h1>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Section 1: You vs Population */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-1">You vs Population</h2>
          <p className="text-sm text-slate-500 mb-6">Compared to average for age {age_group}</p>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={comparisonData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={90} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                
                {/* Your Bar with custom color logic */}
                <Bar dataKey="You" name="You" radius={[0, 4, 4, 0]}>
                  {
                    comparisonData.map((entry, index) => {
                      let color = '#22c55e'; // default green
                      if (entry.name === 'Risk Score (%)' && entry.You > entry.Average) color = '#ef4444';
                      if (entry.name === 'Systolic BP' && entry.You > 130) color = '#ef4444';
                      if (entry.name === 'Health Score' && entry.You < entry.Average) color = '#ef4444';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })
                  }
                </Bar>
                <Bar dataKey="Average" name="Population Average" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 2: Your Risk Factors */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Your Risk Factors</h2>
          <div className="flex flex-wrap gap-3">
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold border ${risk_factors.high_bp ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
              <Activity size={16} /> High BP
            </div>
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold border ${risk_factors.diabetes ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
              <AlertTriangle size={16} /> Diabetes
            </div>
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold border ${risk_factors.smoking ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
              <Flame size={16} /> Smoking
            </div>
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold border ${risk_factors.activity_level !== 'Sedentary' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              <Activity size={16} /> {risk_factors.activity_level}
            </div>
          </div>
        </div>

        {/* Section 3: Risk Category Gauge */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-center">
          <h2 className="text-lg font-bold text-slate-800 mb-6 self-start">Risk Category</h2>
          
          <div className="relative w-64 h-32 mb-8">
            {/* SVG Arc Backgrounds */}
            <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f1f5f9" strokeWidth="30" strokeLinecap="round" />
              <path d="M 20 100 A 80 80 0 0 1 70 38" fill="none" stroke="#22c55e" strokeWidth="30" />
              <path d="M 70 38 A 80 80 0 0 1 130 38" fill="none" stroke="#eab308" strokeWidth="30" />
              <path d="M 130 38 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="30" />
              
              {/* Arrow Indicator */}
              <g transform={`translate(100, 100) rotate(${rotation - 90})`}>
                <polygon points="-5,0 5,0 0,-70" fill="#1e293b" />
                <circle cx="0" cy="0" r="10" fill="#1e293b" />
              </g>
            </svg>
            
            {/* Absolute positioning for labels */}
            <div className="absolute top-1/2 left-0 -translate-x-1/2 text-xs font-bold text-green-600">Low</div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-xs font-bold text-yellow-500">Moderate</div>
            <div className="absolute top-1/2 right-0 translate-x-1/2 text-xs font-bold text-red-500">High</div>
          </div>

          <div className="text-center">
            <p className="text-4xl font-black text-slate-800">{risk_score.toFixed(1)}%</p>
            <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-widest">
              {risk_score < 20 ? 'Low Risk' : risk_score < 40 ? 'Moderate Risk' : risk_score < 60 ? 'High Risk' : 'Critical Risk'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
