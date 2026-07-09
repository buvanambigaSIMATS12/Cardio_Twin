import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Trash2, AlertTriangle } from 'lucide-react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function PrivacySecurity() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdToast, setPwdToast] = useState('');



  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdToast('New passwords do not match');
      setTimeout(() => setPwdToast(''), 3000);
      return;
    }
    try {
      await api.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword });
      setPwdToast('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdToast(''), 3000);
    } catch (err) {
      setPwdToast('Failed to change password');
      setTimeout(() => setPwdToast(''), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      logout();
      navigate('/splash');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <div className="bg-white px-4 pt-12 pb-4 flex items-center shadow-sm shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="text-xl font-bold ml-2">Privacy & Security</h1>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
              <Key size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
          </div>
          
          {pwdToast && <div className="absolute top-2 right-2 left-2 text-center text-sm font-medium text-green-700 bg-green-100 p-2 rounded-lg animate-in fade-in">{pwdToast}</div>}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <input 
              type="password" 
              placeholder="Current Password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-[var(--color-cardio-primary)]"
              required
            />
            <input 
              type="password" 
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-[var(--color-cardio-primary)]"
              required
            />
            <input 
              type="password" 
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-[var(--color-cardio-primary)]"
              required
            />
            <button type="submit" className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform">
              Update Password
            </button>
          </form>
        </div>



        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 text-red-500 rounded-xl">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Data & Privacy</h2>
          </div>

          <p className="text-slate-500 text-sm mb-6">Deleting your account will permanently remove all your vitals, ECG scans, and digital twin data. This action cannot be undone.</p>
          
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="w-full border-2 border-red-500 text-red-500 font-bold py-3 rounded-xl hover:bg-red-50 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            <Trash2 size={20} />
            Delete my account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-6 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">Delete Account?</h3>
            <p className="text-center text-slate-500 mb-8">Are you sure you want to permanently delete your CardioTwin account and all associated health data?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-4 font-bold text-slate-600 bg-slate-100 rounded-2xl active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="flex-1 py-4 font-bold text-white bg-red-500 rounded-2xl active:scale-95 transition-transform shadow-md shadow-red-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
