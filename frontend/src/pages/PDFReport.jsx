import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Heart, FileText } from 'lucide-react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function PDFReport() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, vitalsRes, ecgRes, twinRes, medsRes] = await Promise.all([
          api.get('/tracking/weekly-summary'),
          api.get('/tracking/vitals'),
          api.get('/ecg/history'),
          api.get('/twin/detail'),
          api.get('/tracking/medications')
        ]);

        const latestVital = vitalsRes.data.length > 0 ? vitalsRes.data[vitalsRes.data.length - 1] : null;
        const latestEcg = ecgRes.data.length > 0 ? ecgRes.data[0] : null;
        const twinDetail = twinRes.data;

        setData({
          summary: summaryRes.data,
          latestVital,
          ecgHistory: ecgRes.data.slice(0, 3), // Last 3
          twinDetail,
          medications: medsRes.data
        });

        // Trigger AI Recommendations
        const bp = latestVital ? `${latestVital.systolic_bp}/${latestVital.diastolic_bp}` : 'Unknown';
        const diagnosis = latestEcg ? latestEcg.diagnosis : 'Unknown';
        const risk_score = twinDetail ? twinDetail.risk_score : 'Unknown';
        
        const prompt = `Give me 5 brief cardiac health recommendations based on: BP ${bp}, ECG diagnosis ${diagnosis}, Risk score ${risk_score}. Format as a numbered list.`;
        
        const aiRes = await api.post('/chat/ask', { message: prompt });
        setAiRecommendations(aiRes.data.reply);

      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold">Generating report...</div>;
  }

  if (!data) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold">Failed to load data</div>;
  }

  const { summary, latestVital, ecgHistory, twinDetail, medications } = data;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      
      {/* Print styles injected directly */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white !important;
          }
          .print-break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}} />

      {/* App Header (No-Print) */}
      <div className="bg-white px-4 pt-12 pb-4 flex items-center shadow-sm shrink-0 sticky top-0 z-10 no-print">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="text-xl font-bold ml-2 flex-1">Health Report</h1>
        <button onClick={handlePrint} className="p-2 bg-[var(--color-cardio-primary)] text-white rounded-full hover:brightness-95 transition-colors shadow-md">
          <Download size={20} />
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto no-print">
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 flex items-start gap-3">
          <FileText className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">Your personalized PDF health report is ready. Tap the download icon in the top right to save or print it.</p>
        </div>
      </div>

      {/* The Printable Area */}
      <div id="print-area" className="bg-white p-8 max-w-4xl mx-auto m-6 rounded-2xl shadow-sm border border-slate-200 text-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[var(--color-cardio-primary)] mb-2">
              <Heart size={32} fill="currentColor" />
              <span className="text-2xl font-black tracking-tight text-slate-900">CardioTwin</span>
            </div>
            <h1 className="text-3xl font-bold">Comprehensive Health Report</h1>
          </div>
          <div className="text-right text-sm">
            <p><strong>Patient:</strong> {user?.full_name || 'N/A'}</p>
            <p><strong>Age:</strong> {user?.age || 'N/A'}</p>
            <p><strong>Date:</strong> {today}</p>
          </div>
        </div>

        {/* Section 1 & 4: Overall Health & Risk */}
        <div className="grid grid-cols-2 gap-6 mb-8 print-break-inside-avoid">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Overall Health Score</h2>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-slate-800">{summary?.health_score || '--'}</span>
              <span className="text-lg font-bold text-slate-500 mb-1">/ 100</span>
            </div>
            <p className="text-sm font-bold text-slate-600 mt-2">{summary?.health_label || 'Status Unknown'}</p>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Digital Twin Risk</h2>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-red-500">{twinDetail?.risk_score || '--'}%</span>
            </div>
            <p className="text-sm font-bold text-slate-600 mt-2">{twinDetail?.state_description || 'Baseline'}</p>
          </div>
        </div>

        {/* Section 2: Vitals Summary */}
        <div className="mb-8 print-break-inside-avoid">
          <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4">Latest Vitals</h2>
          {latestVital ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="p-3 rounded-tl-lg font-bold">Metric</th>
                  <th className="p-3 font-bold">Latest Value</th>
                  <th className="p-3 rounded-tr-lg font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-medium">Blood Pressure</td>
                  <td className="p-3">{latestVital.systolic_bp}/{latestVital.diastolic_bp} mmHg</td>
                  <td className="p-3"><span className="font-bold">{summary?.bp_label || 'Unknown'}</span></td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-medium">Heart Rate</td>
                  <td className="p-3">{latestVital.heart_rate} bpm</td>
                  <td className="p-3"><span className="font-bold text-green-600">Normal</span></td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-medium">SpO2</td>
                  <td className="p-3">{latestVital.spo2 ? `${latestVital.spo2}%` : '--'}</td>
                  <td className="p-3"><span className="font-bold text-green-600">{latestVital.spo2 >= 95 ? 'Normal' : 'Check'}</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Blood Sugar</td>
                  <td className="p-3">{latestVital.blood_sugar ? `${latestVital.blood_sugar} mg/dL` : '--'}</td>
                  <td className="p-3"><span className="font-bold">{latestVital.blood_sugar > 126 ? 'High' : 'Normal'}</span></td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 italic">No vitals recorded.</p>
          )}
        </div>

        {/* Section 3: ECG History */}
        <div className="mb-8 print-break-inside-avoid">
          <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4">Recent ECG Scans</h2>
          {ecgHistory.length > 0 ? (
            <div className="space-y-3">
              {ecgHistory.map(scan => {
                const date = new Date(scan.scan_date).toLocaleDateString();
                return (
                  <div key={scan.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-medium">{date}</span>
                    <span className="font-bold">{scan.diagnosis}</span>
                    <span className="text-sm bg-slate-200 px-2 py-1 rounded font-bold">{Math.round(scan.confidence)}% Confidence</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 italic">No ECG scans recorded.</p>
          )}
        </div>

        {/* Section 5: Medications */}
        <div className="mb-8 print-break-inside-avoid">
          <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4">Active Medications</h2>
          {medications.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {medications.map(med => (
                <li key={med.id} className="text-sm">
                  <strong>{med.name}</strong> - {med.dosage} ({med.frequency})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">No active medications.</p>
          )}
        </div>

        {/* Section 6: AI Recommendations */}
        <div className="mb-12 print-break-inside-avoid">
          <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4">AI Recommendations</h2>
          {aiRecommendations ? (
            <div className="prose prose-sm prose-slate max-w-none">
              <div dangerouslySetInnerHTML={{ __html: aiRecommendations.replace(/\n/g, '<br/>') }} />
            </div>
          ) : (
            <p className="text-slate-500 italic">Generating recommendations...</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-6 text-center text-xs text-slate-500 mt-auto">
          <p>Generated by CardioTwin on {today}.</p>
          <p>This report is generated by AI and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.</p>
        </div>

      </div>
    </div>
  );
}
