import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Cigarette, Activity as ActivityIcon } from 'lucide-react';
import api from '../../api';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({
    history_high_bp: null,
    history_diabetes: null,
    history_smoking: null,
    family_history_heart: null,
    activity_level: null,
  });

  const updateAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // map smoking answers to boolean
      const smokingBool = answers.history_smoking === 'Current' || answers.history_smoking === 'Former';
      const payload = {
        ...answers,
        history_smoking: smokingBool
      };
      
      await api.post('/auth/onboarding', payload);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderProgress = () => {
    return (
      <div className="flex gap-2 mt-6 justify-center">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`h-1.5 w-10 rounded-full ${s <= step ? 'bg-white' : 'bg-white/30'}`}></div>
        ))}
      </div>
    );
  };

  const isCurrentStepValid = () => {
    switch (step) {
      case 1: return answers.history_high_bp !== null;
      case 2: return answers.history_diabetes !== null;
      case 3: return answers.history_smoking !== null;
      case 4: return answers.family_history_heart !== null;
      case 5: return answers.activity_level !== null;
      default: return false;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-[var(--color-cardio-primary)] text-white px-6 pt-10 pb-6 shadow-sm shrink-0">
        <h1 className="text-xl font-bold text-center">Medical history</h1>
        {renderProgress()}
        <p className="text-right text-xs font-medium mt-2 text-white/80">Step {step} of 5</p>
      </div>

      <div className="flex-1 px-6 py-8 flex flex-col overflow-y-auto">
        
        {step === 1 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right fade-in duration-300">
            <h2 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">Do you have a history of high blood pressure?</h2>
            <p className="text-slate-500 mb-10">This personalises your heart risk model</p>
            <div className="flex gap-4">
              <button onClick={() => updateAnswer('history_high_bp', true)} className={`flex-1 aspect-square rounded-[2rem] border-2 flex flex-col items-center justify-center gap-3 transition-all ${answers.history_high_bp === true ? 'border-[var(--color-cardio-primary)] bg-green-50 text-[var(--color-cardio-primary)]' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                <Check size={40} className="currentColor" />
                <span className="font-bold text-xl currentColor">Yes</span>
              </button>
              <button onClick={() => updateAnswer('history_high_bp', false)} className={`flex-1 aspect-square rounded-[2rem] border-2 flex flex-col items-center justify-center gap-3 transition-all ${answers.history_high_bp === false ? 'border-red-500 bg-red-50 text-red-500' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                <X size={40} className="currentColor" />
                <span className="font-bold text-xl currentColor">No</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right fade-in duration-300">
            <h2 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">Do you have diabetes or pre-diabetes?</h2>
            <div className="flex gap-4">
              <button onClick={() => updateAnswer('history_diabetes', true)} className={`flex-1 aspect-square rounded-[2rem] border-2 flex flex-col items-center justify-center gap-3 transition-all ${answers.history_diabetes === true ? 'border-[var(--color-cardio-primary)] bg-green-50 text-[var(--color-cardio-primary)]' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                <Check size={40} className="currentColor" />
                <span className="font-bold text-xl currentColor">Yes</span>
              </button>
              <button onClick={() => updateAnswer('history_diabetes', false)} className={`flex-1 aspect-square rounded-[2rem] border-2 flex flex-col items-center justify-center gap-3 transition-all ${answers.history_diabetes === false ? 'border-red-500 bg-red-50 text-red-500' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                <X size={40} className="currentColor" />
                <span className="font-bold text-xl currentColor">No</span>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right fade-in duration-300">
            <h2 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">Are you a current or former smoker?</h2>
            <div className="flex flex-col gap-3">
              {['Never', 'Former', 'Current'].map(opt => (
                <button key={opt} onClick={() => updateAnswer('history_smoking', opt)} className={`p-4 rounded-2xl border-2 font-bold text-lg text-left transition-all flex items-center justify-between ${answers.history_smoking === opt ? 'border-[var(--color-cardio-primary)] bg-green-50 text-[var(--color-cardio-primary)]' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>
                  {opt}
                  {answers.history_smoking === opt && <Check size={24} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right fade-in duration-300">
            <h2 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">Do you have a family history of heart disease?</h2>
            <p className="text-slate-500 mb-10">E.g., parents or siblings with heart issues before age 60.</p>
            <div className="flex gap-4">
              <button onClick={() => updateAnswer('family_history_heart', true)} className={`flex-1 aspect-square rounded-[2rem] border-2 flex flex-col items-center justify-center gap-3 transition-all ${answers.family_history_heart === true ? 'border-[var(--color-cardio-primary)] bg-green-50 text-[var(--color-cardio-primary)]' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                <Check size={40} className="currentColor" />
                <span className="font-bold text-xl currentColor">Yes</span>
              </button>
              <button onClick={() => updateAnswer('family_history_heart', false)} className={`flex-1 aspect-square rounded-[2rem] border-2 flex flex-col items-center justify-center gap-3 transition-all ${answers.family_history_heart === false ? 'border-red-500 bg-red-50 text-red-500' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                <X size={40} className="currentColor" />
                <span className="font-bold text-xl currentColor">No</span>
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right fade-in duration-300">
            <h2 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">What is your current activity level?</h2>
            <div className="flex flex-col gap-3">
              {[
                {id: 'Sedentary', desc: 'Little to no exercise'},
                {id: 'Moderate', desc: 'Light exercise 1-3 days/week'},
                {id: 'Active', desc: 'Exercise 3-5+ days/week'}
              ].map(opt => (
                <button key={opt.id} onClick={() => updateAnswer('activity_level', opt.id)} className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${answers.activity_level === opt.id ? 'border-[var(--color-cardio-primary)] bg-green-50 text-[var(--color-cardio-primary)]' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>
                  <div>
                    <div className="font-bold text-lg">{opt.id}</div>
                    <div className={`text-sm ${answers.activity_level === opt.id ? 'text-green-700' : 'text-slate-400'}`}>{opt.desc}</div>
                  </div>
                  {answers.activity_level === opt.id && <Check size={24} />}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 flex gap-4 shrink-0">
          {step > 1 && (
            <button onClick={handleBack} className="flex-1 border-2 border-[var(--color-cardio-primary)] text-[var(--color-cardio-primary)] py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform">
              Back
            </button>
          )}
          <button 
            onClick={step === 5 ? handleSubmit : handleNext}
            disabled={!isCurrentStepValid() || loading}
            className="flex-1 bg-[var(--color-cardio-primary)] text-white py-4 rounded-2xl font-bold text-lg shadow-md disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? 'Saving...' : step === 5 ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
