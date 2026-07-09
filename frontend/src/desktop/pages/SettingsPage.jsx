import React from 'react';

import GeneralSettingsCard from '../components/GeneralSettingsCard';
import AppearanceCard from '../components/AppearanceCard';
import NotificationSettingsCard from '../components/NotificationSettingsCard';
import PrivacySecurityCard from '../components/PrivacySecurityCard';
import SystemInformationCard from '../components/SystemInformationCard';

/* ── Settings Page ────────────────────────────────────────── */

export default function SettingsPage() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-6">

      {/* Row 1: General + Appearance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GeneralSettingsCard />
        <AppearanceCard />
      </div>

      {/* Row 2: Notifications + Privacy & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NotificationSettingsCard />
        <PrivacySecurityCard />
      </div>

      {/* Row 3: System Information (full width) */}
      <div className="grid grid-cols-1 gap-6">
        <SystemInformationCard />
      </div>

    </div>
  );
}
