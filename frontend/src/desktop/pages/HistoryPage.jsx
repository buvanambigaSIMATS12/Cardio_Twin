import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Activity, HeartPulse, Pill, CalendarDays } from 'lucide-react';
import api from '../../api';

import HistoryStatsCard from '../components/HistoryStatsCard';
import HealthMetricsChart from '../components/HealthMetricsChart';
import ECGHistoryTable from '../components/ECGHistoryTable';
import ActivityTimeline from '../components/ActivityTimeline';

/* ── Helpers ─────────────────────────────────────────────── */

const formatDate = (iso) => {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateLabel = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

/** Group a flat activity list (sorted desc) into date-based groups for ActivityTimeline */
function groupActivitiesByDate(activities) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = {};

  activities.forEach((item) => {
    const d = new Date(item.timestamp);
    const dayKey = d.toDateString();

    if (!groups[dayKey]) {
      const itemDate = new Date(d);
      itemDate.setHours(0, 0, 0, 0);

      let label;
      if (itemDate.getTime() === today.getTime()) {
        label = `Today — ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      } else if (itemDate.getTime() === yesterday.getTime()) {
        label = `Yesterday — ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      } else {
        label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      groups[dayKey] = { date: label, sortKey: itemDate.getTime(), events: [] };
    }

    groups[dayKey].events.push({
      type: item.type,
      title: item.title,
      description: item.description,
      time: formatTime(item.timestamp),
    });
  });

  return Object.values(groups).sort((a, b) => b.sortKey - a.sortKey);
}

/* ── History Page ─────────────────────────────────────────── */

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [vitals, setVitals] = useState([]);
  const [ecgScans, setEcgScans] = useState([]);
  const [activities, setActivities] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/tracking/vitals');
        setVitals(res.data);
      } catch (err) {
        console.error('Failed to fetch vitals:', err);
      }

      try {
        const res = await api.get('/ecg/history');
        setEcgScans(res.data);
      } catch (err) {
        console.error('Failed to fetch ECG history:', err);
      }

      try {
        const res = await api.get('/tracking/history');
        setActivities(res.data);
      } catch (err) {
        console.error('Failed to fetch activity history:', err);
      }

      try {
        const res = await api.get('/tracking/medications/adherence');
        setAdherence(res.data);
      } catch (err) {
        console.error('Failed to fetch medication adherence:', err);
      }

      try {
        const res = await api.get('/tracking/streak');
        setStreak(res.data);
      } catch (err) {
        console.error('Failed to fetch streak:', err);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[var(--color-cardio-primary)]" />
      </div>
    );
  }

  /* ── Derive HistoryStatsCard stats ── */
  const totalEcgs = ecgScans.length;
  const avgHR = vitals.length > 0
    ? Math.round(vitals.reduce((sum, v) => sum + v.heart_rate, 0) / vitals.length)
    : 0;
  const medAdherence = adherence ? `${Math.round(adherence.today_adherence)}%` : '--';
  const medChange = adherence
    ? (adherence.today_adherence >= 80 ? 'On track' : 'Needs attention')
    : '';
  const daysTracked = streak ? streak.current_streak : 0;

  const stats = [
    { key: 'ecgs',      label: 'Total ECGs',     value: String(totalEcgs), change: `${totalEcgs} scan${totalEcgs !== 1 ? 's' : ''} recorded`, icon: HeartPulse,   iconBg: 'bg-rose-50',  iconColor: 'text-rose-500' },
    { key: 'avgHR',     label: 'Avg Heart Rate',  value: String(avgHR),    change: 'bpm (all time)',                                          icon: Activity,     iconBg: 'bg-green-50', iconColor: 'text-[var(--color-cardio-primary)]' },
    { key: 'adherence', label: 'Med Adherence',    value: medAdherence,     change: medChange,                                                 icon: Pill,         iconBg: 'bg-blue-50',  iconColor: 'text-blue-500' },
    { key: 'tracked',   label: 'Days Tracked',     value: String(daysTracked), change: streak ? `Longest: ${streak.longest_streak}d` : '',      icon: CalendarDays, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
  ];

  /* ── Derive HealthMetricsChart data ── */
  // Vitals come newest-first; reverse to chronological and take up to 30 entries
  const chronoVitals = [...vitals].reverse().slice(-30);
  const metricsData = chronoVitals.map((v) => ({
    heartRate: v.heart_rate,
    bpSystolic: v.systolic_bp,
    spo2: v.spo2 ?? 0,
  }));
  const metricsLabels = chronoVitals.map((v) => formatDateLabel(v.recorded_at));

  /* ── Derive ECGHistoryTable records ── */
  const ecgRecords = ecgScans.map((scan) => ({
    date: formatDate(scan.scan_date),
    diagnosis: scan.diagnosis,
    confidence: Math.round(scan.confidence * 10) / 10,
    status: scan.diagnosis === 'Normal' ? 'Normal' : 'Abnormal',
  }));

  /* ── Derive ActivityTimeline groups ── */
  const timelineGroups = groupActivitiesByDate(activities);

  /* ── Render ── */
  return (
    <div className="max-w-[1600px] mx-auto space-y-6">

      {/* Row 1: Stat tiles */}
      <HistoryStatsCard stats={stats} />

      {/* Row 2: Health Metrics Chart (full width) */}
      <div className="grid grid-cols-1 gap-6">
        {metricsData.length > 0 ? (
          <HealthMetricsChart data={metricsData} labels={metricsLabels} />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center py-12 text-slate-400">
            <p className="text-sm">No vitals data to chart yet</p>
          </div>
        )}
      </div>

      {/* Row 3: ECG History + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ECGHistoryTable records={ecgRecords} />
        <ActivityTimeline groups={timelineGroups} />
      </div>

    </div>
  );
}
