import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen px-6 py-12 items-center justify-between">
      <div className="flex flex-col items-center mt-20 text-center">
        <div className="bg-[var(--color-cardio-primary)] p-6 rounded-[2rem] shadow-sm mb-8">
          <Heart size={40} color="white" fill="white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">CardioTwin</h1>
        <p className="text-slate-500 font-medium px-4">
          Monitor, Predict & <br/> Simulate Your Heart Health
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <button 
          onClick={() => navigate('/login')}
          className="w-full bg-[var(--color-cardio-primary)] text-white py-4 rounded-2xl font-bold text-lg shadow-sm hover:bg-[var(--color-cardio-primary-dark)] active:scale-95 transition-transform"
        >
          Login
        </button>
        <button 
          onClick={() => navigate('/register')}
          className="w-full bg-white text-[var(--color-cardio-primary)] border-2 border-[var(--color-cardio-primary)] py-4 rounded-2xl font-bold text-lg hover:bg-green-50 active:scale-95 transition-transform"
        >
          Create Account
        </button>
        <p className="text-center text-xs text-slate-400 mt-6 mb-4">
          Your heart. Your data. Your twin.
        </p>
      </div>
    </div>
  );
}
