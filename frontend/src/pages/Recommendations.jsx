import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Apple, Moon, MessageSquare, ChevronRight } from 'lucide-react';
import api from '../api';

const categoryConfig = {
  Exercise: { icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  Diet: { icon: Apple, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
  Lifestyle: { icon: Moon, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
};

export default function Recommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Exercise');

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const response = await api.post('/ai/recommendations');
        setRecommendations(response.data);
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  const handleLearnMore = (rec) => {
    // Pass initial message to chatbot via state
    navigate('/chat', { state: { initialMessage: `Can you tell me more about: ${rec.title}? I need details on how to incorporate this into my routine safely.` } });
  };

  const tabs = ['Exercise', 'Diet', 'Lifestyle'];
  const currentRecs = recommendations.filter(r => r.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">AI Recommendations</h1>
          <p className="text-xs text-slate-500">Personalized for your heart</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex p-1 bg-slate-200/50 rounded-xl mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
                <div className="flex gap-4 mb-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                </div>
                <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {currentRecs.map((rec, idx) => {
              const conf = categoryConfig[rec.category] || categoryConfig.Lifestyle;
              const Icon = conf.icon;
              
              const diffColor = 
                rec.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                rec.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700';

              return (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                  <div className="flex items-start gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${conf.bg} ${conf.color}`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{rec.title}</h3>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${diffColor}`}>
                        {rec.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {rec.description}
                  </p>
                  
                  <button 
                    onClick={() => handleLearnMore(rec)}
                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors border ${conf.border} ${conf.color} hover:${conf.bg}`}
                  >
                    <MessageSquare size={16} /> Learn More
                  </button>
                </div>
              );
            })}
            
            {currentRecs.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                No recommendations found for this category.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
