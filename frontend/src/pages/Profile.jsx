import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Bell, Shield, HelpCircle, ChevronRight, Download, Edit2 } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/splash');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <div className="bg-[var(--color-cardio-primary)] text-white px-4 py-8 shadow-sm rounded-b-3xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[var(--color-cardio-primary)] text-2xl font-bold shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
              <p className="text-indigo-100 opacity-90 text-sm">Personal Health Profile</p>
            </div>
          </div>
          <button onClick={() => navigate('/edit-profile')} className="p-2 bg-white/20 text-white rounded-full active:scale-95 transition-transform shadow-sm">
            <Edit2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 -mt-4 space-y-4 max-w-lg mx-auto w-full">
        
        {/* Account Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase px-4 pt-4 pb-2">Account</h2>
          
          <button onClick={() => navigate('/edit-profile')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <User size={20} className="text-slate-400" /> Personal Information
            </div>
            <ChevronRight size={20} className="text-slate-300" />
          </button>
          <hr className="border-slate-100 mx-4" />

          <button onClick={() => navigate('/emergency-contacts')} className="w-full flex items-center px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <Shield size={20} className="text-red-400 mr-3" />
            <span className="flex-1 text-left text-slate-700 font-medium">Emergency Contacts</span>
            <ChevronRight size={20} className="text-slate-300" />
          </button>
          <hr className="border-slate-100 mx-4" />
          
          <button onClick={() => navigate('/report')} className="w-full flex items-center px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <Download size={20} className="text-slate-400 mr-3" />
            <span className="flex-1 text-left text-slate-700 font-medium">Download Health Report</span>
            <ChevronRight size={20} className="text-slate-300" />
          </button>
          <hr className="border-slate-100 mx-4" />

          <button onClick={() => navigate('/privacy')} className="w-full flex items-center px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <Shield size={20} className="text-slate-400 mr-3" />
            <span className="flex-1 text-left text-slate-700 font-medium">Privacy & Security</span>
            <ChevronRight size={20} className="text-slate-300" />
          </button>
          <hr className="border-slate-100 mx-4" />
          
          <button onClick={() => navigate('/notifications')} className="w-full flex items-center px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <Bell size={20} className="text-slate-400 mr-3" />
            <span className="flex-1 text-left text-slate-700 font-medium">Notifications</span>
            <ChevronRight size={20} className="text-slate-300" />
          </button>
        </div>

        {/* Support */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase px-4 pt-4 pb-2">Support</h2>
          
          <button onClick={() => navigate('/settings')} className="w-full flex items-center px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <Settings size={20} className="text-slate-400 mr-3" />
            <span className="flex-1 text-left text-slate-700 font-medium">App Settings</span>
            <ChevronRight size={20} className="text-slate-300" />
          </button>
          <hr className="border-slate-100 mx-4" />
          
          <button onClick={() => navigate('/help')} className="w-full flex items-center px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <HelpCircle size={20} className="text-slate-400 mr-3" />
            <span className="flex-1 text-left text-slate-700 font-medium">Help & Feedback</span>
            <ChevronRight size={20} className="text-slate-300" />
          </button>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-red-100 text-red-600 font-bold active:bg-red-50 transition-colors mt-8"
        >
          <LogOut size={20} className="mr-2" /> Log Out
        </button>

      </div>
    </div>
  );
}
