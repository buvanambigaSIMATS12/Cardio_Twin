import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../../api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const otpRefs = useRef([]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      const devCode = res.data.dev_code;
      setToast(devCode ? `Code sent! (Dev code: ${devCode})` : 'If this email exists, a code will be sent');
      setTimeout(() => {
        setToast('');
        setStep(2);
      }, 3000);
    } catch (err) {
      setToast('Error sending OTP');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const code = otp.join('');
      const res = await api.post('/auth/verify-otp', { email, otp: code });
      setResetToken(res.data.reset_token);
      setToast('OTP Verified');
      setTimeout(() => {
        setToast('');
        setStep(3);
      }, 1000);
    } catch (err) {
      setToast(err.response?.data?.detail || 'Invalid OTP');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setToast('Passwords do not match');
      setTimeout(() => setToast(''), 3000);
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { reset_token: resetToken, new_password: password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setToast(err.response?.data?.detail || 'Failed to reset password');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <CheckCircle2 size={80} className="text-[var(--color-cardio-primary)] mb-6 animate-in zoom-in" />
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Password Reset!</h2>
        <p className="text-slate-500 text-center">Your password has been changed successfully.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-4 pt-12 pb-4 flex items-center shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="text-xl font-bold ml-2">Forgot Password</h1>
      </div>

      <div className="flex-1 px-6 pt-6 relative">
        {toast && (
          <div className="absolute top-0 left-6 right-6 bg-slate-800 text-white p-4 rounded-xl text-center text-sm font-medium animate-in slide-in-from-top-2 fade-in">
            {toast}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="animate-in slide-in-from-right fade-in">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Reset Password</h2>
            <p className="text-slate-500 mb-8">Enter the email associated with your account and we'll send an email with instructions to reset your password.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:outline-none focus:border-[var(--color-cardio-primary)] transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !email}
              className="w-full bg-[var(--color-cardio-primary)] text-white font-bold text-lg py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right fade-in">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Check your email</h2>
            <p className="text-slate-500 mb-8">We sent a 6-digit verification code to <span className="font-medium text-slate-800">{email}</span></p>
            
            <div className="flex justify-between gap-2 mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 bg-slate-50 border-2 border-slate-100 rounded-xl text-center text-xl font-bold focus:outline-none focus:border-[var(--color-cardio-primary)] transition-colors"
                />
              ))}
            </div>

            <button 
              onClick={handleVerifyOTP}
              disabled={otp.join('').length !== 6}
              className="w-full bg-[var(--color-cardio-primary)] text-white font-bold text-lg py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-50"
            >
              Verify Code
            </button>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="animate-in slide-in-from-right fade-in">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Create new password</h2>
            <p className="text-slate-500 mb-8">Your new password must be different from previous used passwords.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:outline-none focus:border-[var(--color-cardio-primary)] transition-colors"
                placeholder="Min 8 characters"
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:outline-none focus:border-[var(--color-cardio-primary)] transition-colors"
                placeholder="Must match password"
              />
            </div>

            <button 
              type="submit"
              disabled={!password || !confirmPassword}
              className="w-full bg-[var(--color-cardio-primary)] text-white font-bold text-lg py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-50"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
