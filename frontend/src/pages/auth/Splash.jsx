import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/landing');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[var(--color-cardio-bg)] to-green-50">
      <div className="flex flex-col items-center animate-pulse">
        <div className="bg-[var(--color-cardio-primary)] p-5 rounded-3xl shadow-lg mb-6">
          <HeartPulse size={48} color="white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight mb-2">CardioTwin</h1>
        <p className="text-sm text-slate-500 font-medium">Your Heart. Your Twin.</p>
      </div>
      {/* Small loading bar at bottom */}
      <div className="absolute bottom-12 w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[var(--color-cardio-primary)] w-1/2 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
