import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Mail, Info } from 'lucide-react';

export default function HelpFAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "How does the Digital Twin work?",
      a: "Your Digital Twin is a personalized heart model created from your medical history, vitals, and ECG scans. It calculates your overall cardiac risk and allows you to simulate how lifestyle changes (like better sleep or weight loss) can improve your heart health."
    },
    {
      q: "How do I upload an ECG scan?",
      a: "Go to the ECG tab in the bottom navigation. Tap 'Upload New Scan', select a clear photo of your 12-lead ECG, and our AI will analyze it within seconds for signs of arrhythmia, fibrillation, or other abnormalities."
    },
    {
      q: "Is my data secure?",
      a: "Yes. Your data is encrypted and stored securely. You can manage your privacy settings or delete your account at any time from the Privacy & Security menu in your Profile."
    },
    {
      q: "What should I do if my risk score is high?",
      a: "A high risk score indicates you should consult a healthcare professional. You can use the AI Recommendations feature to get tailored lifestyle advice, but CardioTwin does not replace medical diagnosis or treatment."
    },
    {
      q: "How do I log my daily vitals?",
      a: "Tap the '+' button on the Dashboard or go to the Daily Check page to enter your blood pressure, heart rate, SpO2, and blood sugar. Logging vitals regularly improves the accuracy of your Digital Twin."
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <div className="bg-white px-4 pt-12 pb-4 flex items-center shadow-sm shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="text-xl font-bold ml-2">Help & FAQ</h1>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Info size={20} className="text-blue-500" />
            How to use
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                >
                  <span className="font-bold text-slate-700">{faq.q}</span>
                  {openIndex === idx ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>
                {openIndex === idx && (
                  <div className="p-4 bg-white text-slate-600 text-sm leading-relaxed border-t border-slate-100 animate-in slide-in-from-top-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Mail size={20} className="text-purple-500" />
            Contact Support
          </h2>
          <p className="text-slate-500 text-sm mb-6">Need more help? Our support team is here for you.</p>
          <a 
            href="mailto:support@cardiotwin.app"
            className="flex items-center justify-center gap-2 w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 active:scale-95 transition-all"
          >
            <Mail size={18} />
            Email Support
          </a>
        </div>

        <div className="flex flex-col items-center justify-center pt-8 pb-4 opacity-50">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-cardio-primary)]">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </div>
          <p className="text-slate-600 font-bold">About CardioTwin</p>
          <p className="text-slate-400 text-sm mt-1">Version 1.0.0</p>
          <p className="text-slate-400 text-sm mt-1">Built with ❤️ for cardiac health</p>
        </div>
      </div>
    </div>
  );
}
