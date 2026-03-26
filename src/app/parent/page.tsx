"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Lock, Sparkles, ArrowRight, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { loginParent } from '@/app/actions';
import Link from 'next/link';

export default function ParentLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setShowOtp(true);
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginParent(identifier, otp);

      if (!data.success || data.error) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      // Store the mock parent token
      localStorage.setItem('srm_parent_token', data.token);

      router.push('/parent/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-mesh" style={{ filter: 'hue-rotate(45deg)' }}></div>
      <div className="bg-noise"></div>
      
      {/* Animated Orbs */}
      <div className="orb-1"></div>
      <div className="orb-2"></div>
      <div className="orb-3"></div>

      <main className="main-container">
        
        {/* Main Brand Logo or Badge - Desktop Top Placement */}
        <div className="animate-fade-in-up" style={{
          position: 'absolute', top: '40px', left: '40px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8
        }}>
          <ShieldCheck size={20} className="text-gradient-primary" />
          <span className="desktop-header" style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Parent Portal</span>
        </div>

        {/* Mobile Hero */}
        <div className="mobile-hero animate-fade-in-up">
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2), inset 0 2px 4px rgba(255,255,255,0.1)'
          }}>
            <Sparkles size={40} color="#10b981" />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '8px', fontWeight: 800, lineHeight: 1.1, textAlign: 'center', background: 'linear-gradient(to right, #34d399, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Parent Connect
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem', fontWeight: 400, textAlign: 'center' }}>
            Access your ward's academic records.
          </p>
        </div>

        {/* Center Container / Bottom Sheet */}
        <div style={{ width: '100%', maxWidth: '440px', zIndex: 10 }}>
          
          {/* Form Card */}
          <div className="premium-glass animate-fade-in-up delay-100">
            {/* Desktop Header */}
            <div className="desktop-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                marginBottom: '20px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.05)'
              }}>
                <Sparkles size={32} color="#10b981" />
              </div>
              
              <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '8px', fontWeight: 700, lineHeight: 1.1, background: 'linear-gradient(to right, #34d399, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Parent Connect
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1.05rem', fontWeight: 400 }}>
                Sign in to the Parent Portal
              </p>
            </div>

            {error && (
              <div className="animate-fade-in-up" style={{ 
                padding: '16px', 
                background: 'var(--danger-bg)', 
                border: '1px solid var(--danger-border)', 
                borderRadius: '16px', 
                marginBottom: '24px', 
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fca5a5', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.4, margin: 0 }}>
                    {error}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={showOtp ? handleLogin : handleSendOtp} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="input-group animate-fade-in-up delay-200" style={{ marginBottom: showOtp ? '16px' : '32px' }}>
                <label className="input-label">Registered Email / Mobile No.</label>
                <div className="input-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="parent@email.com or 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    disabled={loading || showOtp}
                  />
                </div>
              </div>

              {showOtp && (
                <div className="input-group animate-fade-in-up" style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="input-label" style={{ marginBottom: 0 }}>One-Time Password (OTP)</label>
                    <button type="button" onClick={(e) => { e.preventDefault(); setShowOtp(false); setOtp(''); }} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}>Change Email/Mobile</button>
                  </div>
                  <div className="input-wrapper" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                    <KeyRound size={18} className="input-icon" color="#10b981" />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      disabled={loading}
                      maxLength={6}
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn-premium animate-fade-in-up delay-300" 
                disabled={loading}
                style={{ background: 'linear-gradient(to right, #10b981, #059669)', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2), inset 0 2px 4px rgba(255,255,255,0.2)' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" style={{ width: '20px', height: '20px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{showOtp ? 'Verifying...' : 'Sending OTP...'}</span>
                  </>
                ) : (
                  <>
                    <span>{showOtp ? 'Sign In to Portal' : 'Get OTP'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="animate-fade-in-up delay-300" style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link 
              href="/" 
              style={{ 
                display: 'inline-block',
                padding: '12px 24px', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px', 
                color: '#94a3b8', 
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f8fafc'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              Are you a student? <span style={{ color: '#818cf8' }}>Login here</span> &rarr;
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
