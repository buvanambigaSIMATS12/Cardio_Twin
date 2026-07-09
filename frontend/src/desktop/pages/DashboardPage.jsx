import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';

import HealthScoreCard from '../components/HealthScoreCard';
import CardiacRiskCard from '../components/CardiacRiskCard';
import TodayStatusCard from '../components/TodayStatusCard';
import EmergencyCard from '../components/EmergencyCard';
import ECGSummaryCard from '../components/ECGSummaryCard';
import VitalsCard from '../components/VitalsCard';
import MedicationCard from '../components/MedicationCard';
import TimelinePlaceholder from '../components/TimelinePlaceholder';
import ActivityCard from '../components/ActivityCard';
import RecommendationsCard from '../components/RecommendationsCard';

/* ── Helpers ─────────────────────────────────────────────── */

function getRelativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ── Dashboard Page ──────────────────────────────────────── */

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [medications, setMedications] = useState([]);
  const [adherence, setAdherence] = useState({ today_adherence: 0 });
  const [latestEcg, setLatestEcg] = useState(null);
  const [activities, setActivities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/twin/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch twin summary:', err);
    }

    try {
      const res = await api.get('/tracking/vitals');
      setVitals(res.data?.[0] || null);
    } catch (err) {
      console.error('Failed to fetch vitals:', err);
    }

    try {
      const res = await api.get('/tracking/medications');
      setMedications(res.data);
    } catch (err) {
      console.error('Failed to fetch medications:', err);
    }

    try {
      const res = await api.get('/tracking/medications/adherence');
      setAdherence(res.data);
    } catch (err) {
      console.error('Failed to fetch medication adherence:', err);
    }

    try {
      const res = await api.get('/ecg/history');
      setLatestEcg(res.data?.[0] || null);
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
      const res = await api.post('/ai/recommendations');
      setRecommendations(res.data);
    } catch (err) {
      console.error('Failed to fetch AI recommendations:', err);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !summary) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-cardio-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const healthLabel =
    summary.health_score >= 80
      ? 'Good'
      : summary.health_score >= 60
        ? 'Moderate'
        : 'At Risk';

  const riskLevel =
    summary.cardiac_risk > 50
      ? 'High Risk'
      : summary.cardiac_risk > 30
        ? 'Moderate Risk'
        : 'Low Risk';

  const heartRate = vitals?.heart_rate ?? '--';
  const spo2 = vitals?.spo2 ?? '--';
  const bloodSugar = summary.blood_sugar || '--';

  const mappedMeds = medications.map((m) => ({
    name: m.name,
    dosage: `${m.dosage} — ${m.frequency}`,
    taken: m.taken_today,
  }));

  const takenCount = medications.filter((m) => m.taken_today).length;

  const ecgDiagnosis = latestEcg?.diagnosis ?? '--';
  const ecgConfidence = latestEcg?.confidence ?? 0;

  const ecgDate = latestEcg
    ? new Date(latestEcg.scan_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : '--';

  const ecgStatus = latestEcg
    ? latestEcg.diagnosis?.toLowerCase() === 'normal'
      ? 'normal'
      : 'abnormal'
    : 'normal';

  const mappedActivities = activities.slice(0, 5).map((a) => ({
    type: a.type,
    title: a.title,
    description: a.description,
    time: getRelativeTime(a.timestamp),
  }));

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <HealthScoreCard
          score={summary.health_score}
          status={healthLabel}
        />

        <CardiacRiskCard
          risk={summary.cardiac_risk}
          level={riskLevel}
        />

        <TodayStatusCard
          bp={summary.bp}
          heartRate={heartRate}
          spo2={spo2}
        />

        <EmergencyCard />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        <ECGSummaryCard
          diagnosis={ecgDiagnosis}
          confidence={ecgConfidence}
          date={ecgDate}
          status={ecgStatus}
        />
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VitalsCard
          bp={summary.bp}
          heartRate={heartRate}
          spo2={spo2}
          bloodSugar={bloodSugar}
          onVitalsLogged={fetchData}
        />

        <MedicationCard
          adherence={Math.round(adherence.today_adherence)}
          taken={takenCount}
          total={medications.length}
          medications={mappedMeds}
        />
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 gap-6">
        <TimelinePlaceholder />
      </div>

      {/* Row 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityCard activities={mappedActivities} />

        <RecommendationsCard
          recommendations={recommendations.slice(0, 4)}
        />
      </div>

    </div>
  );
}