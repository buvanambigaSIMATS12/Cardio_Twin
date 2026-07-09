import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Phone, Trash2, ShieldAlert, Heart, Siren } from 'lucide-react';
import api from '../api';

export default function EmergencyContacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', relationship: '', phone: '' });

  const fetchContacts = async () => {
    try {
      const res = await api.get('/tracking/emergency-contacts');
      setContacts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tracking/emergency-contacts', formData);
      setFormData({ name: '', relationship: '', phone: '' });
      setShowAddForm(false);
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this emergency contact?")) {
      try {
        await api.delete(`/tracking/emergency-contacts/${id}`);
        fetchContacts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-red-600 px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 text-white hover:bg-red-700 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Emergency Contacts</h1>
            <p className="text-xs text-red-200">Tap to call immediately</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Pinned Services */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-2">Emergency Services</h2>
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 divide-y divide-slate-50">
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <Siren size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Ambulance</h3>
                  <p className="text-sm text-slate-500">Medical Emergency</p>
                </div>
              </div>
              <a href="tel:108" className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 active:scale-95 shadow-sm shadow-red-600/30">
                <Phone size={16} fill="currentColor" /> Call
              </a>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Police</h3>
                  <p className="text-sm text-slate-500">Security Emergency</p>
                </div>
              </div>
              <a href="tel:100" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 active:scale-95 shadow-sm shadow-blue-600/30">
                <Phone size={16} fill="currentColor" /> Call
              </a>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                  <Heart size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Cardiac Helpline</h3>
                  <p className="text-sm text-slate-500">24/7 Support</p>
                </div>
              </div>
              <a href="tel:18001024567" className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 active:scale-95 shadow-sm">
                <Phone size={16} fill="currentColor" /> Call
              </a>
            </div>
          </div>
        </div>

        {/* Personal Contacts */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-2">Personal Contacts</h2>
          {loading ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center animate-pulse">Loading...</div>
          ) : contacts.length > 0 ? (
            <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 divide-y divide-slate-50">
              {contacts.map(c => (
                <div key={c.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 text-slate-500 font-bold text-lg rounded-full flex items-center justify-center">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{c.name}</h3>
                      <p className="text-sm text-slate-500">{c.relationship} • {c.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDelete(c.id)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                      <Trash2 size={18} />
                    </button>
                    <a href={`tel:${c.phone}`} className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-full shadow-sm shadow-green-500/30 active:scale-95">
                      <Phone size={18} fill="currentColor" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-100/50 rounded-3xl border border-slate-200 border-dashed">
              <p className="text-slate-500 text-sm">No personal emergency contacts added yet.</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="mt-4 text-red-600 font-bold text-sm"
              >
                + Add Contact
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Add Emergency Contact</h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 p-2"><Trash2 size={24} className="hidden" />✕</button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Relationship</label>
                <input 
                  type="text" required
                  value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                  placeholder="e.g. Spouse, Son"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" required
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                  placeholder="e.g. +1 234 567 8900"
                />
              </div>
              
              <button type="submit" className="w-full bg-red-600 text-white font-bold py-4 rounded-xl mt-4 active:scale-95 transition-transform">
                Save Contact
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
