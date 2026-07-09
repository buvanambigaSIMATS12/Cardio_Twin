import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../api';

export default function RiskTimeline() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentState, setCurrentState] = useState('');
  
  const [projNoTreatment, setProjNoTreatment] = useState(0);
  const [projAdherence, setProjAdherence] = useState(0);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await api.get('/twin/timeline');
        const history = response.data;
        
        let chartData = [];
        let lastRealScore = 15.0; // default
        let lastDate = new Date();

        // Process historical data
        if (history.length > 0) {
          // Take the last 30 historical records if there are many, or just map them
          const recentHistory = history.slice(-30);
          
          chartData = recentHistory.map((record) => ({
            date: new Date(record.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            actualRisk: record.risk_score,
            projectedNoTreatment: null,
            projectedAdherence: null
          }));
          
          const lastRecord = recentHistory[recentHistory.length - 1];
          lastRealScore = lastRecord.risk_score;
          lastDate = new Date(lastRecord.recorded_at);
          
          setCurrentScore(lastRecord.risk_score);
          setCurrentState(lastRecord.state_description || 'Stable');
          
          // Connect the last actual point to the projection lines
          chartData[chartData.length - 1].projectedNoTreatment = lastRealScore;
          chartData[chartData.length - 1].projectedAdherence = lastRealScore;
        } else {
          // No history, create a fake today point
          chartData.push({
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            actualRisk: 15.0,
            projectedNoTreatment: 15.0,
            projectedAdherence: 15.0
          });
          setCurrentScore(15.0);
          setCurrentState('No data available');
        }

        // Project 30 days into the future
        let finalNoTreatment = lastRealScore;
        let finalAdherence = lastRealScore;
        
        // Let's add 5 projection points (every 6 days) to keep chart clean
        for (let i = 1; i <= 30; i++) {
          finalNoTreatment = Math.min(100, finalNoTreatment + 0.8);
          finalAdherence = Math.max(0, finalAdherence - 0.5);
          
          if (i % 6 === 0 || i === 30) {
            const nextDate = new Date(lastDate);
            nextDate.setDate(nextDate.getDate() + i);
            chartData.push({
              date: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              actualRisk: null,
              projectedNoTreatment: parseFloat(finalNoTreatment.toFixed(1)),
              projectedAdherence: parseFloat(finalAdherence.toFixed(1))
            });
          }
        }
        
        setProjNoTreatment(finalNoTreatment);
        setProjAdherence(finalAdherence);
        setData(chartData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch timeline', err);
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Risk Timeline</h1>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Chart Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Cardiac Risk Projection</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value}%`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                
                {/* Actual Risk - Solid Green */}
                <Line 
                  type="monotone" 
                  dataKey="actualRisk" 
                  name="Historical Risk" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
                
                {/* Projected No Treatment - Dashed Red */}
                <Line 
                  type="monotone" 
                  dataKey="projectedNoTreatment" 
                  name="Without Treatment" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls
                />
                
                {/* Projected Adherence - Dashed Blue */}
                <Line 
                  type="monotone" 
                  dataKey="projectedAdherence" 
                  name="Full Adherence" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current State Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Current State</p>
              <p className="font-bold text-slate-800">{currentState}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-slate-800">{currentScore.toFixed(1)}<span className="text-lg text-slate-500">%</span></p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Risk Score</p>
          </div>
        </div>

        {/* Counterfactuals */}
        <h3 className="text-lg font-bold text-slate-800 pt-2 px-1">30-Day Projection</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 mb-3 shadow-sm">
              <TrendingUp size={16} />
            </div>
            <p className="text-xs font-semibold text-red-600 mb-1">Without Treatment</p>
            <p className="text-2xl font-black text-slate-800">{projNoTreatment.toFixed(1)}%</p>
            <p className="text-xs text-slate-500 mt-2 line-clamp-2">Risk increases due to unmanaged factors.</p>
          </div>
          
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-500 mb-3 shadow-sm">
              <TrendingDown size={16} />
            </div>
            <p className="text-xs font-semibold text-blue-600 mb-1">Full Adherence</p>
            <p className="text-2xl font-black text-slate-800">{projAdherence.toFixed(1)}%</p>
            <p className="text-xs text-slate-500 mt-2 line-clamp-2">Risk reduction via daily tracking & meds.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
