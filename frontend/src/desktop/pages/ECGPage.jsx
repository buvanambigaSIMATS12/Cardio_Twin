import React, { useState, useEffect } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import api, { getMediaURL } from '../../api';

import ECGUploadPanel from '../components/ECGUploadPanel';
import ECGPreviewPanel from '../components/ECGPreviewPanel';
import ECGDiagnosisCard from '../components/ECGDiagnosisCard';
import ECGHistoryTable from '../components/ECGHistoryTable';

/* ── Helpers ─────────────────────────────────────────────── */

const RISK_MAP = {
  Normal: 'Low',
  Arrhythmia: 'Moderate',
  AFib: 'High',
  VT: 'High',
  STEMI: 'High',
};

const deriveStatus = (diagnosis) =>
  diagnosis === 'Normal' ? 'normal' : 'abnormal';

const formatDate = (iso) => {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* ── ECG Page ────────────────────────────────────────────── */

export default function ECGPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setError(null);
      const res = await api.get('/ecg/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching ECG history:', err);
      setError('Failed to load ECG history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUploadSuccess = () => {
    fetchHistory();
  };

  /* Derive latest scan from history (backend returns desc order) */
  const latestScan = history.length > 0 ? history[0] : null;

  /* Map API records → table shape expected by ECGHistoryTable */
  const tableRecords = history.map((scan) => ({
    date: formatDate(scan.scan_date),
    diagnosis: scan.diagnosis,
    confidence: Math.round(scan.confidence * 10) / 10,
    status: scan.diagnosis === 'Normal' ? 'Normal' : 'Abnormal',
  }));

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 size={36} className="animate-spin mb-4 text-[var(--color-cardio-primary)]" />
        <p className="text-sm font-semibold">Loading ECG data…</p>
      </div>
    );
  }

  /* ── Empty State ── */
  if (!loading && history.length === 0 && !error) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Upload panel still visible so users can upload their first ECG */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ECGUploadPanel onUploadSuccess={handleUploadSuccess} />
          <ECGPreviewPanel label="ECG Image Preview" />
        </div>

        {/* Friendly empty state */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <Activity size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-[var(--color-cardio-text)] mb-2">No ECG scans available</h3>
          <p className="text-sm text-[var(--color-cardio-text-light)] max-w-md">
            Upload your first ECG using the panel above. Our AI will analyse the scan and provide an instant diagnosis with a Grad-CAM heatmap.
          </p>
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center py-32 text-slate-400">
        <p className="text-sm font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  /* ── Data Loaded ── */
  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Top Row: Upload + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ECGUploadPanel onUploadSuccess={handleUploadSuccess} />
        <ECGPreviewPanel
          label="ECG Image Preview"
          imageSrc={latestScan ? getMediaURL(latestScan.image_url) : undefined}
        />
      </div>

      {/* Bottom Row: Diagnosis + History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ECGDiagnosisCard
          diagnosis={latestScan ? latestScan.diagnosis : '--'}
          confidence={latestScan ? Math.round(latestScan.confidence * 10) / 10 : 0}
          risk={latestScan ? (RISK_MAP[latestScan.diagnosis] || 'Unknown') : 'Unknown'}
          date={latestScan ? formatDate(latestScan.scan_date) : '--'}
          status={latestScan ? deriveStatus(latestScan.diagnosis) : 'normal'}
        />
        <ECGHistoryTable records={tableRecords} />
      </div>
    </div>
  );
}
