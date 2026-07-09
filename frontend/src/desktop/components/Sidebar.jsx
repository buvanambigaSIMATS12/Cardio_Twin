import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Activity, HeartPulse, Pill,
  History, Search, User, Settings,
  ChevronLeft, ChevronRight, Heart
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard',    path: '/',               icon: LayoutDashboard },
  { name: 'ECG',          path: '/ecg',             icon: Activity },
  { name: 'Digital Twin', path: '/twin',            icon: HeartPulse },
  { name: 'Medications',  path: '/medications',     icon: Pill },
  { name: 'History',      path: '/history',         icon: History },
  { name: 'Doctors',      path: '/doctors',         icon: Search },
  { name: 'Profile',      path: '/profile',         icon: User },
  { name: 'Settings',     path: '/settings',        icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`desktop-sidebar ${collapsed ? 'desktop-sidebar-collapsed' : 'desktop-sidebar-expanded'}
        bg-slate-900 flex flex-col h-screen sticky top-0 z-30 overflow-hidden shrink-0`}
    >
      {/* Brand */}
      <div className="flex items-center h-16 px-4 border-b border-slate-800 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center shrink-0">
          <Heart size={20} className="text-white" fill="white" />
        </div>
        <span className="nav-label ml-3 text-white font-bold text-lg tracking-tight">
          CardioTwin
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="section-label px-3 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Navigation
          </span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <div key={item.path} className="nav-item-wrapper relative">
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors duration-150 relative
                  ${active
                    ? 'bg-teal-500/15 text-teal-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-teal-400 rounded-r-full" />
                )}
                <Icon size={18} className="shrink-0 ml-1" />
                <span className="nav-label text-sm font-medium">{item.name}</span>
              </Link>
              {/* Tooltip shown only when sidebar is collapsed */}
              <div className="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg z-50 whitespace-nowrap">
                {item.name}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-12 border-t border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
