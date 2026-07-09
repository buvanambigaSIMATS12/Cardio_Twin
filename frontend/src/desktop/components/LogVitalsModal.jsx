import React, { useState } from 'react';
import { X, Activity, Heart, Wind, Droplets, Zap, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api';

const INITIAL_FORM = {
  systolic_bp: 120,
  diastolic_bp: 80,
  heart_rate: 72,
  spo2: 98,
  blood_sugar: 110,
};

function validate(form) {
  const errors = {};
  if (!form.systolic_bp || form.systolic_bp < 50 || form.systolic_bp > 300)
    errors.systolic_bp = 'Systolic BP must be 50–300';
  if (!form.diastolic_bp || form.diastolic_bp < 20 || form.diastolic_bp > 200)
    errors.diastolic_bp = 'Diastolic BP must be 20–200';
  if (!form.heart_rate || form.heart_rate < 20 || form.heart_rate > 250)
    errors.heart_rate = 'Heart rate must be 20–250';
  if (form.spo2 !== '' && form.spo2 !== null && form.spo2 !== undefined) {
    if (form.spo2 < 0 || form.spo2 > 100) errors.spo2 = 'SpO₂ must be 0–100';
  }
  if (form.blood_sugar !== '' && form.blood_sugar !== null && form.blood_sugar !== undefined) {
    if (form.blood_sugar < 0 || form.blood_sugar > 600) errors.blood_sugar = 'Blood sugar must be 0–600';
  }
  return errors;
}

const fields = [
  {
    key: 'bp',
    label: 'Blood Pressure',
    unit: 'mmHg',
    icon: Heart,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50',
    isBp: true,
  },
  {
    key: 'heart_rate',
    label: 'Heart Rate',
    unit: 'bpm',
    icon: Zap,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
  },
  {
    key: 'spo2',
    label: 'SpO₂',
    unit: '%',
    icon: Wind,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
  },
  {
    key: 'blood_sugar',
    label: 'Blood Sugar',
    unit: 'mg/dL',
    icon: Droplets,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50',
  },
];

export default function LogVitalsModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  if (!open) return null;

  const handleChange = (key, raw) => {
    const val = raw === '' ? '' : parseInt(raw, 10) || 0;
    setFormData((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setStatus(null);
  };

  const handleSubmit = async () => {
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      await api.post('/tracking/vitals', formData);
      setStatus('success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
        // Reset for next open
        setFormData({ ...INITIAL_FORM });
        setErrors({});
        setStatus(null);
      }, 1200);
    } catch (err) {
      console.error('Failed to submit vitals:', err);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !submitting) onClose();
  };

  return (
    <div
      className="log-vitals-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Log Vitals"
    >
      <div className="log-vitals-modal">
        {/* Header */}
        <div className="log-vitals-header">
          <div className="log-vitals-header-left">
            <div className="log-vitals-header-icon">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="log-vitals-title">Log Today's Vitals</h2>
              <p className="log-vitals-subtitle">Keep your Digital Twin updated</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="log-vitals-close-btn"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="log-vitals-body">
          {fields.map((field) => {
            const Icon = field.icon;

            if (field.isBp) {
              return (
                <div key="bp" className="log-vitals-field-group">
                  <label className="log-vitals-label">
                    <span className={`log-vitals-label-icon ${field.iconBg} ${field.iconColor}`}>
                      <Icon size={14} />
                    </span>
                    {field.label}
                    <span className="log-vitals-unit">{field.unit}</span>
                  </label>
                  <div className="log-vitals-bp-row">
                    <div className="log-vitals-input-wrapper" style={{ flex: 1 }}>
                      <input
                        type="number"
                        value={formData.systolic_bp}
                        onChange={(e) => handleChange('systolic_bp', e.target.value)}
                        className={`log-vitals-input ${errors.systolic_bp ? 'log-vitals-input--error' : ''}`}
                        placeholder="120"
                        min={50}
                        max={300}
                      />
                      {errors.systolic_bp && (
                        <span className="log-vitals-error">{errors.systolic_bp}</span>
                      )}
                    </div>
                    <span className="log-vitals-bp-slash">/</span>
                    <div className="log-vitals-input-wrapper" style={{ flex: 1 }}>
                      <input
                        type="number"
                        value={formData.diastolic_bp}
                        onChange={(e) => handleChange('diastolic_bp', e.target.value)}
                        className={`log-vitals-input ${errors.diastolic_bp ? 'log-vitals-input--error' : ''}`}
                        placeholder="80"
                        min={20}
                        max={200}
                      />
                      {errors.diastolic_bp && (
                        <span className="log-vitals-error">{errors.diastolic_bp}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={field.key} className="log-vitals-field-group">
                <label className="log-vitals-label">
                  <span className={`log-vitals-label-icon ${field.iconBg} ${field.iconColor}`}>
                    <Icon size={14} />
                  </span>
                  {field.label}
                  <span className="log-vitals-unit">{field.unit}</span>
                </label>
                <div className="log-vitals-input-wrapper">
                  <input
                    type="number"
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className={`log-vitals-input ${errors[field.key] ? 'log-vitals-input--error' : ''}`}
                    placeholder={String(INITIAL_FORM[field.key])}
                  />
                  {errors[field.key] && (
                    <span className="log-vitals-error">{errors[field.key]}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status messages */}
        {status === 'success' && (
          <div className="log-vitals-toast log-vitals-toast--success">
            <CheckCircle2 size={16} />
            <span>Vitals saved successfully!</span>
          </div>
        )}
        {status === 'error' && (
          <div className="log-vitals-toast log-vitals-toast--error">
            <AlertCircle size={16} />
            <span>Failed to save vitals. Please try again.</span>
          </div>
        )}

        {/* Footer */}
        <div className="log-vitals-footer">
          <button
            onClick={onClose}
            disabled={submitting}
            className="log-vitals-cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || status === 'success'}
            className={`log-vitals-save-btn ${status === 'success' ? 'log-vitals-save-btn--success' : ''}`}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving…
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 size={16} />
                Saved!
              </>
            ) : (
              'Save Vitals'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
