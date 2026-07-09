import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, Heart, Building2, User, FileText, ChevronRight, X, Loader2, MapPin } from 'lucide-react';
import api from '../api';

const HEART_DISEASES = [
  { name: 'Atrial Fibrillation', abbr: 'AFib', severity: 'Moderate' },
  { name: 'Coronary Artery Disease', abbr: 'CAD', severity: 'Severe' },
  { name: 'Heart Failure', abbr: 'HF', severity: 'Severe' },
  { name: 'Hypertension', abbr: 'HTN', severity: 'Moderate' },
  { name: 'Myocardial Infarction', abbr: 'MI', severity: 'Critical' },
  { name: 'Arrhythmia', abbr: 'ARR', severity: 'Moderate' },
  { name: 'Cardiomyopathy', abbr: 'CMP', severity: 'Severe' },
  { name: 'Aortic Stenosis', abbr: 'AS', severity: 'Severe' },
  { name: 'Mitral Valve Prolapse', abbr: 'MVP', severity: 'Mild' },
  { name: 'Pericarditis', abbr: 'PER', severity: 'Moderate' },
];

const severityColors = {
  Mild: 'bg-green-100 text-green-700',
  Moderate: 'bg-orange-100 text-orange-700',
  Severe: 'bg-red-100 text-red-700',
  Critical: 'bg-red-200 text-red-800',
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h2 className="text-red-500 font-bold mb-4">Search Page Error</h2>
          <pre className="text-xs bg-slate-100 p-4 rounded overflow-auto">{this.state.error?.toString()}</pre>
          <button onClick={() => window.history.back()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Go Back</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function SearchContent() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [locality, setLocality] = useState('');
  const [locInput, setLocInput] = useState('');
  const [showLocModal, setShowLocModal] = useState(false);
  
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');

  const fetchData = async (lat = null, lng = null, loc = null) => {
    setLoading(true);
    try {
      const params = {};
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
      }
      if (loc) {
        params.locality = loc;
      }
      const [docRes, hospRes] = await Promise.all([
        api.get('/search/doctors', { params }),
        api.get('/search/hospitals', { params })
      ]);
      setDoctors(docRes.data);
      setHospitals(hospRes.data);
    } catch (err) {
      console.error("Failed to load search data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation denied or error, falling back to default/DB", error);
          fetchData(); // fallback
        },
        { timeout: 10000 }
      );
    } else {
      fetchData(); // fallback
    }
  }, []);

  const handleLocalitySearch = (e) => {
    e.preventDefault();
    if (!locInput.trim()) return;
    setLocality(locInput.trim());
    setShowLocModal(false);
    fetchData(null, null, locInput.trim());
  };


  const handleDiseaseClick = (disease) => {
    navigate('/chat', { state: { initialMessage: `Explain ${disease.name} — symptoms, causes, and treatment.` } });
  };

  const safeQuery = (query || "").toLowerCase();
  const filteredDiseases = HEART_DISEASES.filter(d => (d.name || "").toLowerCase().includes(safeQuery) || (d.abbr || "").toLowerCase().includes(safeQuery));
  const filteredDoctors = (doctors || []).filter(d => (d.name || "").toLowerCase().includes(safeQuery) || (d.specialty || "").toLowerCase().includes(safeQuery));
  const filteredHospitals = (hospitals || []).filter(h => (h.name || "").toLowerCase().includes(safeQuery));

  const renderSearchInput = () => (
    <div className="p-4 bg-white sticky top-0 z-10 border-b border-slate-100 shadow-sm flex items-center gap-3">
      <button onClick={() => { if(view!=='home') setView('home'); else navigate(-1); }} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
        <ArrowLeft size={24} className="text-slate-800" />
      </button>
      <div className="relative flex-1">
        <SearchIcon size={18} className="absolute left-4 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search doctors, hospitals, diseases..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            if (e.target.value && view === 'home') setView('all');
          }}
          className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-11 pr-10 text-slate-700 focus:outline-none focus:border-[var(--color-cardio-primary)]"
        />
        {query && <button onClick={() => setQuery('')} className="absolute right-4 top-3.5"><X size={18} className="text-slate-400" /></button>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[var(--color-cardio-primary)]" />
      </div>
    );
  }

  // Categories View
  if (view === 'home' && !query) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        {renderSearchInput()}
        <div className="p-4 space-y-6 mt-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-2">Categories</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setView('diseases')} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform">
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                <Heart size={28} />
              </div>
              <span className="font-bold text-slate-700">Diseases A-Z</span>
            </button>
            <button onClick={() => setView('doctors')} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                <User size={28} />
              </div>
              <span className="font-bold text-slate-700">Find Doctors</span>
            </button>
            <button onClick={() => setView('hospitals')} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform">
              <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                <Building2 size={28} />
              </div>
              <span className="font-bold text-slate-700">Hospitals</span>
            </button>
            <button onClick={() => navigate('/chat')} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform">
              <div className="w-14 h-14 bg-[var(--color-cardio-primary)]/10 text-[var(--color-cardio-primary)] rounded-full flex items-center justify-center">
                <FileText size={28} />
              </div>
              <span className="font-bold text-slate-700">Ask AI</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderLocalityBar = () => (
    <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5 text-blue-800 font-medium truncate">
        <MapPin size={14} className="text-blue-600 shrink-0" />
        <span className="truncate">Near: <strong className="underline">{locality || "Your Current GPS Location"}</strong></span>
      </div>
      <button 
        onClick={() => { setLocInput(locality); setShowLocModal(true); }}
        className="text-blue-600 font-bold hover:underline ml-2 shrink-0 bg-white px-3 py-1 rounded-full border border-blue-200 shadow-2xs active:scale-95 transition-all"
      >
        Change City
      </button>
    </div>
  );

  const renderLocalityModal = () => (
    showLocModal && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <MapPin className="text-[var(--color-cardio-primary)]" size={20} /> Select Your City
            </h3>
            <button onClick={() => setShowLocModal(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
              <X size={20} />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Enter your city or locality name (e.g., London, Mumbai, New York) to find local cardiologists.
          </p>
          <form onSubmit={handleLocalitySearch} className="space-y-3">
            <input 
              type="text" 
              placeholder="City or Locality..." 
              value={locInput} 
              onChange={e => setLocInput(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-[var(--color-cardio-primary)]"
              autoFocus
            />
            <div className="flex gap-2 pt-1">
              <button 
                type="button"
                onClick={() => { setLocality(''); setShowLocModal(false); fetchData(); }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Use GPS
              </button>
              <button 
                type="submit"
                className="flex-1 py-2.5 bg-[var(--color-cardio-primary)] text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all"
              >
                Search Area
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {renderSearchInput()}
      {(view === 'all' || view === 'doctors' || view === 'hospitals') && renderLocalityBar()}
      
      <div className="p-4 space-y-8">
        {/* Doctors Section */}
        {(view === 'all' || view === 'doctors') && filteredDoctors.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-2">Local Doctors</h2>
            {filteredDoctors.map(doctor => (
              <button key={doctor.id} onClick={() => navigate(`/doctor/${doctor.id}`, { state: doctor })} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 text-left active:scale-95 transition-transform">
                {doctor.image ? (
                  <img src={doctor.image} alt={doctor.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xl shrink-0">
                    {(doctor.name || "Dr").replace('Dr. ', '')[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-lg truncate">{doctor.name}</h3>
                  <p className="text-sm text-[var(--color-cardio-primary)] font-medium mb-1 truncate">{doctor.specialty}</p>
                  <p className="text-xs text-slate-500 truncate">{doctor.hospital} • {doctor.distance}</p>
                </div>
                <ChevronRight size={20} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        )}
        {renderLocalityModal()}

        {/* Hospitals Section */}
        {(view === 'all' || view === 'hospitals') && filteredHospitals.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-2">Hospitals & Emergency Map</h2>
            
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-48 mb-3 relative">
              <iframe 
                title="Nearby Emergency Centers"
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                src="https://www.openstreetmap.org/export/embed.html?bbox=79.80%2C11.90%2C79.85%2C11.95&layer=mapnik&marker=11.93%2C79.83"
                style={{ border: 0 }}
              ></iframe>
              <span className="absolute bottom-1 right-1 bg-white/80 text-[9px] px-1.5 py-0.5 rounded text-slate-600 font-bold">
                OpenStreetMap
              </span>
            </div>

            {filteredHospitals.map(hosp => (
              <div key={hosp.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">{hosp.name}</h3>
                  <p className="text-xs text-slate-500">{hosp.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--color-cardio-primary)]">{hosp.time}</p>
                  <p className="text-xs text-slate-400">{hosp.distance}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Diseases Section */}
        {(view === 'all' || view === 'diseases') && filteredDiseases.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-2">Diseases & Conditions</h2>
            <div className="grid gap-2">
              {filteredDiseases.map(disease => (
                <button
                  key={disease.abbr}
                  onClick={() => handleDiseaseClick(disease)}
                  className="w-full flex items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mr-3">
                    <Heart size={18} className="text-red-500" fill="currentColor" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-slate-800">{disease.name}</p>
                    <p className="text-xs text-slate-400">{disease.abbr}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${severityColors[disease.severity]}`}>{disease.severity}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {query && filteredDoctors.length === 0 && filteredHospitals.length === 0 && filteredDiseases.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <SearchIcon size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="font-medium">No results found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Search() {
  return (
    <ErrorBoundary>
      <SearchContent />
    </ErrorBoundary>
  );
}
