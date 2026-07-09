import React, { useState, useContext } from 'react';
import { Shield, Share2, Clock, Download, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';

const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0
      ${enabled ? 'bg-[var(--color-cardio-primary)]' : 'bg-slate-200'}`}
  >
    <span
      className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
        ${enabled ? 'left-[22px]' : 'left-[3px]'}`}
    />
  </button>
);

const selectClass = `w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-[var(--color-cardio-text)]
  focus:outline-none focus:ring-2 focus:ring-[var(--color-cardio-primary)]/30 focus:border-[var(--color-cardio-primary)] transition-colors appearance-none cursor-pointer`;

export default function PrivacySecurityCard() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [twoFA, setTwoFA] = useState(() => localStorage.getItem('twoFA') === 'true');

  const [dataSharing, setDataSharing] = useState(() => localStorage.getItem('dataSharing') !== 'false');
  const [sessionTimeout, setSessionTimeout] = useState(() => localStorage.getItem('sessionTimeout') || '30 minutes');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleTwoFA = () => {
    const next = !twoFA;
    setTwoFA(next);
    localStorage.setItem('twoFA', next);
  };

  const toggleDataSharing = () => {
    const next = !dataSharing;
    setDataSharing(next);
    localStorage.setItem('dataSharing', next);
  };
  const handleSessionChange = (val) => {
    setSessionTimeout(val);
    localStorage.setItem('sessionTimeout', val);
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      logout();
      navigate('/splash');
    } catch (err) {
      console.error('Failed to delete account', err);
    }
  };

  const toggles = [
    { icon: Shield,      label: 'Two-Factor Authentication', desc: 'Require OTP on every login for extra security',       enabled: twoFA,       onToggle: toggleTwoFA },
    { icon: Share2,      label: 'Data Sharing with Doctor',  desc: 'Allow your cardiologist to access health records',     enabled: dataSharing, onToggle: toggleDataSharing },
  ];

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
            <Shield size={14} className="text-violet-500" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Privacy & Security</h3>
        </div>

        {/* Toggles */}
        <div className="space-y-1 flex-1">
          {toggles.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-cardio-text)]">{t.label}</p>
                  <p className="text-[11px] text-[var(--color-cardio-text-light)]">{t.desc}</p>
                </div>
                <Toggle enabled={t.enabled} onToggle={t.onToggle} />
              </div>
            );
          })}
        </div>

        {/* Session timeout */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cardio-text-light)] mb-1.5 flex items-center gap-1">
            <Clock size={11} /> Session Timeout
          </label>
          <select value={sessionTimeout} onChange={(e) => handleSessionChange(e.target.value)} className={selectClass}>
            {['15 minutes', '30 minutes', '1 hour', '4 hours', 'Never'].map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
          <button className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg bg-slate-100 text-[var(--color-cardio-text)] hover:bg-slate-200 transition-colors">
            <Download size={13} /> Export My Data
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={13} /> Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-800 mb-2">Delete Account?</h3>
            <p className="text-center text-slate-500 text-sm mb-6">This will permanently delete your CardioTwin account and all associated health data. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-3 font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
