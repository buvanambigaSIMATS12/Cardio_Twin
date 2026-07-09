import React from 'react';
import { Star, MapPin, Phone, Mail, Clock, Award } from 'lucide-react';

export default function DoctorProfileCard({ doctor = {} }) {
  const {
    name = 'Dr. Unknown',
    specialty = '',
    hospital = '',
    experience = '',
    rating = 0,
    reviews = 0,
    phone = '',
    email = '',
    available = false,
    nextSlot = '',
    avatar = '',
    badges = [],
  } = doctor;

  const initials = name.replace('Dr. ', '').split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      {/* Top: Avatar + Name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0 text-white font-bold text-lg shadow-sm">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-bold text-[var(--color-cardio-text)] truncate">{name}</h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {available ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <p className="text-xs text-[var(--color-cardio-primary)] font-semibold">{specialty}</p>
          <p className="text-[11px] text-[var(--color-cardio-text-light)] mt-0.5">{hospital}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={13}
              className={i < Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}
              fill={i < Math.round(rating) ? '#fbbf24' : 'none'}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-[var(--color-cardio-text)]">{rating}</span>
        <span className="text-[11px] text-[var(--color-cardio-text-light)]">({reviews} reviews)</span>
      </div>

      {/* Details grid */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2.5 text-xs">
          <Award size={13} className="text-slate-400 shrink-0" />
          <span className="text-[var(--color-cardio-text)]">{experience} experience</span>
        </div>
        {nextSlot && (
          <div className="flex items-center gap-2.5 text-xs">
            <Clock size={13} className="text-slate-400 shrink-0" />
            <span className="text-[var(--color-cardio-text)]">Next: <span className="font-semibold text-[var(--color-cardio-primary)]">{nextSlot}</span></span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2.5 text-xs">
            <Phone size={13} className="text-slate-400 shrink-0" />
            <span className="text-[var(--color-cardio-text-light)]">{phone}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-2.5 text-xs">
            <Mail size={13} className="text-slate-400 shrink-0" />
            <span className="text-[var(--color-cardio-text-light)]">{email}</span>
          </div>
        )}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {badges.map((badge, i) => (
            <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-teal-50 text-[var(--color-cardio-primary)]">
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
