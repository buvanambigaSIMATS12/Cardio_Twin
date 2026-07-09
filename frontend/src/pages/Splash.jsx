import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[var(--color-cardio-primary)] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-[-10%] left-[-20%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-96 h-96 bg-[var(--color-cardio-primary-dark)]/30 rounded-full blur-3xl"></div>
      
      <div className="z-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
        <div className="w-32 h-32 bg-white rounded-3xl p-1 shadow-2xl mb-6">
          <img src="/logo.png" alt="CardioTwin Logo" className="w-full h-full object-cover rounded-[1.35rem]" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">CardioTwin</h1>
        <p className="text-emerald-100 font-medium text-lg text-center max-w-xs">
          Your Intelligent Cardiac Health Companion
        </p>
      </div>

      <div className="absolute bottom-12 flex space-x-2 animate-pulse">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        <div className="w-2 h-2 bg-white/50 rounded-full"></div>
        <div className="w-2 h-2 bg-white/20 rounded-full"></div>
      </div>
    </div>
  );
}
