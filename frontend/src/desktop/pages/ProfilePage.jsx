import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

import ProfileSummaryCard from '../components/ProfileSummaryCard';
import PersonalInformationCard from '../components/PersonalInformationCard';
import AccountStatisticsCard from '../components/AccountStatisticsCard';
import MedicalHistoryCard from '../components/MedicalHistoryCard';
import EmergencyContactsCard from '../components/EmergencyContactsCard';

/* ── Profile Page ─────────────────────────────────────────── */

export default function ProfilePage() {
  const { user } = useContext(AuthContext);

  const [ecgScans, setEcgScans] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [medications, setMedications] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [streak, setStreak] = useState(0);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ecgRes, vitalsRes, medsRes, sympRes, streakRes, contactsRes] = await Promise.all([
          api.get('/ecg/history'),
          api.get('/tracking/vitals'),
          api.get('/tracking/medications'),
          api.get('/tracking/symptoms'),
          api.get('/tracking/streak'),
          api.get('/tracking/emergency-contacts'),
        ]);
        setEcgScans(ecgRes.data || []);
        setVitals(vitalsRes.data || []);
        setMedications(medsRes.data || []);
        setSymptoms(sympRes.data || []);
        setStreak(streakRes.data?.current_streak || 0);
        setEmergencyContacts(contactsRes.data || []);
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* ── Derived data ──────────────────────────────────────── */

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

  const personalInfo = {
    gender: user?.gender || '—',
    email: user?.email || '—',
    age: user?.age ? `${user.age} years` : '—',
  };

  const accountStats = [
    { label: 'ECG Scans Uploaded',  value: ecgScans.length,    color: '#ef4444' },
    { label: 'Vitals Logged',       value: vitals.length,      color: 'var(--color-cardio-primary)' },
    { label: 'Medications Tracked', value: medications.length, color: '#3b82f6' },
    { label: 'Symptoms Reported',   value: symptoms.length,    color: '#f59e0b' },
  ];

  const contactsForCard = emergencyContacts.map((c, i) => ({
    name: c.name,
    relationship: c.relationship,
    phone: c.phone,
    primary: i === 0,
  }));

  /* ── Render ────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--color-cardio-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">

      {/* Row 1: Profile Summary (full width) */}
      <ProfileSummaryCard
        name={user?.full_name || user?.name || 'User'}
        age={user?.age || 0}
        gender={user?.gender || ''}
        memberSince={memberSince}
        totalECGs={ecgScans.length}
        streak={streak}
      />

      {/* Row 2: Personal Info + Account Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalInformationCard info={personalInfo} />
        <AccountStatisticsCard stats={accountStats} />
      </div>

      {/* Row 3: Medical History + Emergency Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MedicalHistoryCard records={[]} />
        <EmergencyContactsCard contacts={contactsForCard} />
      </div>

    </div>
  );
}
