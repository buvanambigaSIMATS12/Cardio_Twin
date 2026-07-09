import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, HeartPulse, Activity, User, History } from 'lucide-react';

function MobileLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Hide bottom nav on auth screens
  const hideNavPaths = ['/splash', '/landing', '/login', '/register', '/onboarding'];
  const showNav = !hideNavPaths.includes(currentPath);

  const navItems = [
    { name: 'Home',  path: '/',      icon: <Home size={24} /> },
    { name: 'History', path: '/history', icon: <History size={24} /> },
    { name: 'Twin',  path: '/twin',   icon: <HeartPulse size={24} /> },
    { name: 'Sim',   path: '/sim',    icon: <Activity size={24} /> },
    { name: 'Me',    path: '/profile',icon: <User size={24} /> }
  ];

  return (
    <div className="flex justify-center bg-gray-200 h-[100dvh] overflow-hidden">
      {/* Mobile constraint wrapper for desktop viewing */}
      <div className="w-full max-w-md bg-[var(--color-cardio-bg)] h-full relative shadow-2xl overflow-hidden flex flex-col">
        
        {/* Main Content Area */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${showNav ? 'pb-20' : ''}`}>
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        {showNav && (
          <nav className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center py-3 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-3xl">
            {navItems.map((item) => {
              const isActive = item.path === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.path);
              return (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={`flex flex-col items-center gap-1 ${isActive ? 'text-[var(--color-cardio-primary)]' : 'text-gray-400'}`}
                >
                  <div className={`p-1.5 rounded-xl ${isActive ? 'bg-green-50' : ''}`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

export default MobileLayout;
