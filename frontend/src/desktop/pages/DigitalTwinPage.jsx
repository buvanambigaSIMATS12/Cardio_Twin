import React, { useState, useEffect } from 'react';
import { Loader2, Dumbbell, Utensils, Moon, CircleSlash } from 'lucide-react';
import api from '../../api';

import HeartStatusCard from '../components/HeartStatusCard';
import RiskGaugeCard from '../components/RiskGaugeCard';
import RiskTimelineCard from '../components/RiskTimelineCard';
import LifestyleFactorsCard from '../components/LifestyleFactorsCard';
import SimulationPanel from '../components/SimulationPanel';
import AIInsightsCard from '../components/AIInsightsCard';

/* ── Helpers ─────────────────────────────────────────────── */

const deriveRiskLevel = (score) => {
  if (score > 50) return 'High';
  if (score > 30) return 'Moderate';
  return 'Low';
};

const deriveHeartStatus = (riskScore) => {
  if (riskScore > 50) return 'Critical';
  if (riskScore > 30) return 'At Risk';
  return 'Healthy';
};

const formatTimeAgo = (isoDate) => {
  if (!isoDate) return '--';
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

/** Build lifestyle factors from insights risk_factors */
const buildLifestyleFactors = (riskFactors) => {
  return [
    {
      key: 'exercise',
      label: 'Exercise',
      score: riskFactors?.activity_level === 'Active' ? 85 : riskFactors?.activity_level === 'Moderate' ? 60 : 30,
      status: riskFactors?.activity_level || 'Sedentary',
      icon: Dumbbell,
      color: riskFactors?.activity_level === 'Active' ? 'text-green-600' : riskFactors?.activity_level === 'Moderate' ? 'text-amber-600' : 'text-red-600',
      bg: riskFactors?.activity_level === 'Active' ? 'bg-green-50' : riskFactors?.activity_level === 'Moderate' ? 'bg-amber-50' : 'bg-red-50',
      barColor: riskFactors?.activity_level === 'Active' ? 'bg-green-500' : riskFactors?.activity_level === 'Moderate' ? 'bg-amber-500' : 'bg-red-500',
    },
    {
      key: 'bp',
      label: 'Blood Pressure',
      score: riskFactors?.high_bp ? 35 : 90,
      status: riskFactors?.high_bp ? 'High' : 'Normal',
      icon: Utensils,
      color: riskFactors?.high_bp ? 'text-red-600' : 'text-green-600',
      bg: riskFactors?.high_bp ? 'bg-red-50' : 'bg-green-50',
      barColor: riskFactors?.high_bp ? 'bg-red-500' : 'bg-green-500',
    },
    {
      key: 'diabetes',
      label: 'Diabetes',
      score: riskFactors?.diabetes ? 30 : 95,
      status: riskFactors?.diabetes ? 'Yes' : 'None',
      icon: Moon,
      color: riskFactors?.diabetes ? 'text-red-600' : 'text-green-600',
      bg: riskFactors?.diabetes ? 'bg-red-50' : 'bg-green-50',
      barColor: riskFactors?.diabetes ? 'bg-red-500' : 'bg-green-500',
    },
    {
      key: 'smoking',
      label: 'Smoking',
      score: riskFactors?.smoking ? 15 : 100,
      status: riskFactors?.smoking ? 'Active' : 'None',
      icon: CircleSlash,
      color: riskFactors?.smoking ? 'text-red-600' : 'text-green-600',
      bg: riskFactors?.smoking ? 'bg-red-50' : 'bg-green-50',
      barColor: riskFactors?.smoking ? 'bg-red-500' : 'bg-green-500',
    },
  ];
};

/** Build AI insight items from the insights API response */
const buildInsights = (insightsData) => {
  if (!insightsData) return [];
  const items = [];
  const rs = insightsData.risk_score;
  const hs = insightsData.health_score;
  const bp = insightsData.latest_bp;
  const popAvg = insightsData.population_avg_risk;

  // Risk comparison
  if (rs !== undefined && popAvg !== undefined) {
    items.push({
      severity: rs > popAvg ? 'warning' : 'info',
      category: 'trend',
      title: rs > popAvg
        ? `Risk ${Math.round(rs - popAvg)}% above population average`
        : `Risk ${Math.round(popAvg - rs)}% below population average`,
      description: `Your cardiac risk score is ${Math.round(rs)}% compared to the population average of ${Math.round(popAvg)}% for your age group (${insightsData.age_group || '--'}).`,
    });
  }

  // Health score
  if (hs !== undefined) {
    items.push({
      severity: hs >= 70 ? 'info' : hs >= 50 ? 'warning' : 'alert',
      category: 'cardiac',
      title: `Health score: ${hs}/100`,
      description: hs >= 70
        ? 'Your overall cardiac health score is in a good range. Keep maintaining your lifestyle habits.'
        : 'Your health score indicates room for improvement. Consider reviewing your vitals and lifestyle factors.',
    });
  }

  // Blood pressure
  if (bp && bp !== '--/--') {
    const [sys] = bp.split('/').map(Number);
    if (sys > 140) {
      items.push({
        severity: 'alert',
        category: 'vitals',
        title: `Blood pressure elevated (${bp} mmHg)`,
        description: 'Your latest blood pressure reading is above the normal range. Consider consulting your doctor and reducing sodium intake.',
      });
    } else if (sys > 120) {
      items.push({
        severity: 'warning',
        category: 'vitals',
        title: `Blood pressure slightly elevated (${bp} mmHg)`,
        description: 'Your blood pressure is in the pre-hypertension range. Monitor regularly and maintain a healthy diet.',
      });
    }
  }

  // Risk factors
  const rf = insightsData.risk_factors;
  if (rf) {
    if (rf.smoking) {
      items.push({
        severity: 'alert',
        category: 'general',
        title: 'Smoking is a major risk factor',
        description: 'Active smoking significantly increases your cardiovascular risk. Consider a cessation program.',
      });
    }
    if (rf.diabetes) {
      items.push({
        severity: 'warning',
        category: 'medication',
        title: 'Diabetes management is critical',
        description: 'Consistent blood sugar monitoring and medication adherence are essential for reducing cardiac risk.',
      });
    }
  }

  return items;
};

/* ── Digital Twin Page ──────────────────────────────────────── */

export default function DigitalTwinPage() {
  const [twin, setTwin] = useState(null);
  const [latestVitals, setLatestVitals] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setError(null);
        const [twinRes, vitalsRes, timelineRes, insightsRes] = await Promise.all([
          api.get('/twin/detail'),
          api.get('/tracking/vitals').catch(() => ({ data: [] })),
          api.get('/twin/timeline').catch(() => ({ data: [] })),
          api.get('/twin/insights').catch(() => ({ data: null })),
        ]);
        setTwin(twinRes.data);
        setLatestVitals(Array.isArray(vitalsRes.data) ? vitalsRes.data[0] || null : null);
        setTimeline(Array.isArray(timelineRes.data) ? timelineRes.data : []);
        setInsightsData(insightsRes.data);
      } catch (err) {
        console.error('Error loading Digital Twin data:', err);
        setError('Failed to load Digital Twin data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 size={36} className="animate-spin mb-4 text-[var(--color-cardio-primary)]" />
        <p className="text-sm font-semibold">Loading Digital Twin…</p>
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

  /* ── Derived values ── */
  const riskScore = twin?.risk_score ?? 15;
  const riskLevel = deriveRiskLevel(riskScore);
  const heartStatus = deriveHeartStatus(riskScore);

  // HeartStatusCard props
  const bpm = latestVitals?.heart_rate ?? 72;
  const lastUpdated = latestVitals?.recorded_at ? formatTimeAgo(latestVitals.recorded_at) : '--';

  // RiskGaugeCard factors
  const riskFactors = [];
  if (insightsData?.risk_factors?.high_bp) riskFactors.push('Blood Pressure');
  if (insightsData?.risk_factors?.diabetes) riskFactors.push('Diabetes');
  if (insightsData?.risk_factors?.smoking) riskFactors.push('Smoking');
  if (riskFactors.length === 0) riskFactors.push('Age', 'Lifestyle');

  // RiskTimelineCard data
  const timelinePoints = timeline.map((t) => Math.round(t.risk_score));
  const timelineLabels = timeline.map((t) => {
    const d = new Date(t.recorded_at);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // LifestyleFactorsCard
  const lifestyleFactors = buildLifestyleFactors(insightsData?.risk_factors);

  // AIInsightsCard
  const insightItems = buildInsights(insightsData);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">

      {/* Row 1: Heart Status, Risk Gauge, Risk Timeline (spans 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <HeartStatusCard
          bpm={bpm}
          rhythm={twin?.state_description || 'Baseline'}
          ejectionFraction={Math.max(30, Math.min(75, 100 - Math.round(riskScore)))}
          status={heartStatus}
          lastUpdated={lastUpdated}
        />
        <RiskGaugeCard
          riskPercent={Math.round(riskScore)}
          level={riskLevel}
          factors={riskFactors}
        />
        <RiskTimelineCard points={timelinePoints} labels={timelineLabels} />
      </div>

      {/* Row 2: Lifestyle Factors, Simulation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LifestyleFactorsCard factors={lifestyleFactors} />
        <SimulationPanel baselineRisk={riskScore} />
      </div>

      {/* Row 3: AI Insights (full width) */}
      <div className="grid grid-cols-1 gap-6">
        <AIInsightsCard insights={insightItems} />
      </div>

    </div>
  );
}
