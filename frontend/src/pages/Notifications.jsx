import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Pill, AlertTriangle, FileText, Flame, Trophy, CheckCheck } from 'lucide-react';
import api from '../api';

const typeConfig = {
  medication: { icon: Pill, color: 'text-blue-500', bg: 'bg-blue-50' },
  alert: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  summary: { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  streak: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
  achievement: { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' },
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAll = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Time formatter
  const timeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
            <p className="text-xs text-slate-500">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleReadAll}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
          >
            <CheckCheck size={14} /> Mark all
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-pulse flex gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(n => {
            const conf = typeConfig[n.type] || { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-100' };
            const Icon = conf.icon;
            
            return (
              <div 
                key={n.id} 
                onClick={() => handleRead(n.id, n.is_read)}
                className={`bg-white p-4 rounded-2xl border transition-all flex gap-4 cursor-pointer active:scale-[0.98] ${
                  n.is_read ? 'border-slate-100 opacity-70' : 'border-blue-100 shadow-sm shadow-blue-100'
                }`}
              >
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${conf.bg} ${conf.color}`}>
                    <Icon size={22} />
                  </div>
                  {!n.is_read && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm ${n.is_read ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-snug">
                    {n.body}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={40} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">All Caught Up!</h2>
            <p className="text-slate-500 text-sm">You have no new notifications at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
