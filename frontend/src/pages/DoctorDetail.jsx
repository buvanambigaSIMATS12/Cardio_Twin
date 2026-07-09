import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Phone, GraduationCap, ShieldCheck } from 'lucide-react';

export default function DoctorDetail() {
  const navigate = useNavigate();
  const location = useLocation();

  // Build a guaranteed safe doctor object from passed state
  const raw = location.state || {};
  const doc = {
    name: raw.name || raw.fullName || 'Doctor',
    specialty: raw.specialty || raw.specialization || 'Cardiologist',
    hospital: raw.hospital || raw.clinic || 'Medical Center',
    rating: parseFloat(raw.rating) || 4.8,
    reviews: parseInt(raw.reviews) || 42,
    distance: raw.distance || '1.2 km',
    phone: raw.phone || '+1 (555) 382-9102',
    experience: parseInt(raw.experience) || 12,
    fee: raw.fee || '$150',
    about: raw.about || `Experienced cardiac specialist at ${raw.hospital || 'the medical center'}. Dedicated to personalized heart care and prevention.`,
    languages: raw.languages || 'English, Regional',
  };

  // Safe initials: take first letter of each word (skip "Dr")
  const nameParts = String(doc.name)
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .filter(Boolean);
  const initials = nameParts.map(n => n.charAt(0).toUpperCase()).join('').substring(0, 2) || 'DC';

  const mapLink = `https://maps.google.com/?q=${encodeURIComponent(doc.hospital)}`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', paddingBottom: 96 }}>

      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            marginRight: 8,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={24} color="#475569" />
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Doctor Profile</h1>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Profile Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 24,
          padding: 24,
          textAlign: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: '1px solid #f1f5f9'
        }}>
          {/* Avatar */}
          <div style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            backgroundColor: '#dbeafe',
            color: '#1d4ed8',
            fontSize: 32,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            {initials}
          </div>

          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>{doc.name}</h2>
          <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#2563eb' }}>{doc.specialty}</p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#64748b', fontSize: 14, marginBottom: 20 }}>
            <MapPin size={14} />
            <span>{doc.hospital}</span>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: 16,
            padding: 16,
            border: '1px solid #f1f5f9'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Experience</p>
              <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{doc.experience} yrs</p>
            </div>
            <div style={{ width: 1, height: 32, backgroundColor: '#e2e8f0' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Rating</p>
              <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 4 }}>
                {doc.rating} <Star size={14} style={{ color: '#facc15', fill: '#facc15' }} />
              </p>
            </div>
            <div style={{ width: 1, height: 32, backgroundColor: '#e2e8f0' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Reviews</p>
              <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{doc.reviews}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <a
            href={`tel:${doc.phone}`}
            style={{
              flex: 1,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '16px 0',
              borderRadius: 16,
              fontWeight: 700,
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 15,
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
            }}
          >
            <Phone size={18} style={{ fill: '#ffffff' }} /> Call Doctor
          </a>
          <a
            href={mapLink}
            target="_blank"
            rel="noreferrer"
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              color: '#374151',
              padding: '16px 0',
              borderRadius: 16,
              fontWeight: 700,
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 15,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}
          >
            <MapPin size={18} /> Directions
          </a>
        </div>

        {/* About Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 24,
          padding: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: '1px solid #f1f5f9'
        }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>About Doctor</h3>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{doc.about}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                backgroundColor: '#eef2ff', color: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <GraduationCap size={18} />
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Languages</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  {Array.isArray(doc.languages) ? doc.languages.join(', ') : String(doc.languages)}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                backgroundColor: '#f0fdf4', color: '#22c55e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Status</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#334155' }}>Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Distance Info */}
        <div style={{
          backgroundColor: '#eff6ff',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #dbeafe'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="#2563eb" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1e40af' }}>{doc.hospital}</span>
          </div>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#2563eb',
            backgroundColor: '#dbeafe',
            padding: '4px 10px',
            borderRadius: 20
          }}>{doc.distance} away</span>
        </div>

      </div>
    </div>
  );
}
