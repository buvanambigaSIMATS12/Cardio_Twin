import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
      {/* Left — Project Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-800">CardioTwin Desktop</h1>
      </div>

      {/* Right — Search, Notifications, User */}
      <div className="flex items-center gap-3">
        {/* Search Placeholder */}
        <div className="hidden lg:flex relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            readOnly
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700
              placeholder:text-slate-400 focus:outline-none w-56 cursor-default"
          />
        </div>

        {/* Notification Icon Placeholder */}
        <button
          className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell size={20} className="text-slate-500" />
          {/* Static badge placeholder */}
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* User Profile Placeholder */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <span className="hidden xl:block text-sm font-medium text-slate-700">
            User
          </span>
        </div>
      </div>
    </header>
  );
}
