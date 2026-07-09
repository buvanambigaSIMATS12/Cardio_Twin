import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingDown, TrendingUp, Loader2, Brain, CheckCircle, Target, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import api from '../api';

export default function WeeklySummary() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    api.get('/tracking/weekly-summary')
      .then(res => {
        setData(res.data);
        // Fetch AI insights after data loads
        setAiLoading(true);
        const d = res.data;
        api.post('/ai/weekly-insights', {
          health_score: d.health_score,
          health_score_delta: d.health_score_delta,
          avg_bp: d.avg_bp,
          days_logged: d.days_logged,
          trend_direction: d.trend_direction,
          ecg_status: d.ecg_status,
        }).then(r => setAiInsights(r.data))
          .catch(() => {})
          .finally(() => setAiLoading(false));
      })
      .catch(err => {
        console.error(err);
        setError('Could not load summary. Please log some vitals first!');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="animate-spin text-[var(--color-cardio-primary)]" size={36} />
    </div>
  );

  if (error) return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="bg-[var(--color-cardio-primary)] text-white px-4 py-6 flex items-center shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-semibold flex-1 text-center pr-10">Weekly Summary</h1>
      </div>
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
        <p className="text-slate-500 text-lg">{error}</p>
        <button
          onClick={() => navigate('/daily-check')}
          className="mt-6 bg-[var(--color-cardio-primary)] text-white px-6 py-3 rounded-xl font-bold"
        >
          Log Today's Vitals
        </button>
      </div>
    </div>
  );

  const trend = data.risk_trend.filter(d => d.risk !== null);
  const isImproving = data.trend_direction === 'IMPROVING';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-6">
      <div className="bg-[var(--color-cardio-primary)] text-white px-4 py-6 flex items-center shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold flex-1 text-center pr-10">Weekly Summary</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full">
        <p className="text-center text-slate-500 font-medium">{data.week_start} — {data.week_end}</p>

        {/* Health Score Card */}
        <div className="bg-green-50 rounded-3xl p-6 shadow-sm border border-green-100 flex flex-col items-center">
          <h2 className="text-xs font-bold tracking-wider text-[var(--color-cardio-primary)] uppercase mb-2">HEALTH SCORE</h2>
          <div className="text-6xl font-bold text-[var(--color-cardio-primary)] mb-2">{data.health_score}</div>
          <span className="bg-[var(--color-cardio-primary)] text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            {data.health_label.toUpperCase()}
          </span>
          <div className={`flex items-center text-sm font-medium ${isImproving ? 'text-green-600' : 'text-red-500'}`}>
            {isImproving
              ? <TrendingUp size={16} className="mr-1" />
              : <TrendingDown size={16} className="mr-1" />}
            {Math.abs(data.health_score_delta)} points {isImproving ? 'up' : 'down'} vs last week
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 mb-1">Avg BP</span>
            <span className={`text-2xl font-bold ${data.bp_label === 'High' ? 'text-red-500' : data.bp_label === 'Elevated' ? 'text-orange-500' : 'text-[var(--color-cardio-primary)]'}`}>
              {data.avg_bp}
            </span>
            <span className={`text-[10px] font-medium mt-1 ${data.bp_label === 'High' ? 'text-red-400' : data.bp_label === 'Elevated' ? 'text-orange-400' : 'text-[var(--color-cardio-primary)]'}`}>
              {data.bp_label}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 mb-1">ECG Scans</span>
            <span className="text-2xl font-bold text-[var(--color-cardio-primary)]">{data.ecg_count}</span>
            <span className={`text-[10px] font-medium mt-1 ${data.ecg_status === 'Abnormal' ? 'text-red-400' : 'text-[var(--color-cardio-primary)]'}`}>
              {data.ecg_status}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 mb-1">Vitals Logged</span>
            <span className={`text-2xl font-bold ${data.med_adherence < 60 ? 'text-orange-500' : 'text-[var(--color-cardio-primary)]'}`}>
              {data.med_adherence}%
            </span>
            <span className={`text-[10px] font-medium mt-1 ${data.med_adherence < 60 ? 'text-orange-400' : 'text-[var(--color-cardio-primary)]'}`}>
              {data.med_label}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 mb-1">Days Logged</span>
            <span className="text-2xl font-bold text-[var(--color-cardio-primary)]">{data.days_logged}</span>
            <span className="text-[10px] text-[var(--color-cardio-primary)] font-medium mt-1">
              {data.days_logged >= 5 ? 'On Track' : 'Keep Going'}
            </span>
          </div>
        </div>

        {/* 7-Day Risk Trend */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-800">7-Day Risk Trend</h2>
            <span className={`text-[10px] font-bold px-2 py-1 rounded ${isImproving ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {data.trend_direction}
            </span>
          </div>

          {trend.length > 0 ? (
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.risk_trend}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    formatter={(val) => val !== null ? [`${val}%`, 'Risk'] : ['No data', '']}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <ReferenceLine y={50} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="risk"
                    stroke={isImproving ? '#22c55e' : '#ef4444'}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
              Log vitals daily to see your trend chart
            </div>
          )}
        </div>

        {/* AI Weekly Insights */}
        {aiLoading && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-3">
            <Loader2 className="animate-spin text-[var(--color-cardio-primary)] shrink-0" size={20} />
            <p className="text-sm text-slate-500">AI is analysing your week...</p>
          </div>
        )}
        {aiInsights && !aiLoading && (
          <div className="bg-gradient-to-br from-[var(--color-cardio-primary)] to-emerald-600 rounded-3xl p-6 shadow-md text-white">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={20} className="text-white/80" />
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">AI Weekly Insights</p>
            </div>
            <h3 className="text-lg font-black mb-2">{aiInsights.headline}</h3>
            <p className="text-white/85 text-sm leading-relaxed mb-4">{aiInsights.summary}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/15 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle size={14} className="text-white/80" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">This Week's Wins</p>
                </div>
                {aiInsights.wins.map((w, i) => (
                  <p key={i} className="text-xs text-white/90 font-medium mb-1">• {w}</p>
                ))}
              </div>
              <div className="bg-white/15 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Target size={14} className="text-white/80" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Focus Areas</p>
                </div>
                {aiInsights.focus_areas.map((f, i) => (
                  <p key={i} className="text-xs text-white/90 font-medium mb-1">• {f}</p>
                ))}
              </div>
            </div>

            <div className="bg-white/15 rounded-2xl p-3 flex items-start gap-2">
              <Sparkles size={16} className="text-white/80 mt-0.5 shrink-0" />
              <p className="text-xs text-white/90 font-medium italic">{aiInsights.motivation}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
