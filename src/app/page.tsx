"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Sparkles, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function Page() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [concurrentSession, setConcurrentSession] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setConcurrentSession(false);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        if (data.concurrentSession) {
          setConcurrentSession(true);
          setError('Maximum concurrent sessions limit reached.');
          return;
        }
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      // Store the raw Zoho token in localStorage
      localStorage.setItem('srm_token', data.token);
      localStorage.setItem('srm_username', username);
      localStorage.setItem('srm_password', password);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-mesh"></div>
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
          <span className="desktop-header" style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Secure Portal</span>
        </div>

        {/* Mobile Hero (Only visible on max-width: 640px) */}
        <div className="mobile-hero animate-fade-in-up">
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.2), inset 0 2px 4px rgba(255,255,255,0.1)'
          }}>
            <Sparkles size={40} className="text-gradient-primary" />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '8px', fontWeight: 800, lineHeight: 1.1, textAlign: 'center' }}>
            Academia
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem', fontWeight: 400, textAlign: 'center' }}>
            Your student portal, reimagined.
          </p>
        </div>

        {/* Center Container / Bottom Sheet */}
        <div style={{ width: '100%', maxWidth: '440px', zIndex: 10 }}>
          
          {/* Form Card */}
          <div className="premium-glass animate-fade-in-up delay-100">
            {/* Desktop Header (Hidden on Mobile) */}
            <div className="desktop-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                marginBottom: '20px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.05)'
              }}>
                <Sparkles size={32} className="text-gradient-primary" />
              </div>
              
              <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '8px', fontWeight: 700, lineHeight: 1.1 }}>
                Academia
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1.05rem', fontWeight: 400 }}>
                Sign in to your student portal
              </p>
            </div>

            {/* Mobile Sheet Handle (Only really visible if we styled it, but let's add a subtle pill) */}
            <div className="mobile-handle" style={{ 
              width: '40px', 
              height: '4px', 
              background: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: '4px', 
              margin: '0 auto 24px auto',
              display: 'none' /* Will show via CSS if desired, but kept minimal for now */
            }}></div>


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
                  {concurrentSession && (
                    <div style={{ marginTop: '12px' }}>
                      <a
                        href="https://academia.srmist.edu.in/49910842/portal/academia-academic-services/myProfile"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.85rem', 
                          color: '#f87171', 
                          textDecoration: 'none',
                          fontWeight: 600,
                          background: 'rgba(239, 68, 68, 0.15)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          transition: 'background 0.2s'
                        }}
                      >
                        Terminate Sessions <ArrowRight size={14} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="input-group animate-fade-in-up delay-200">
                <label className="input-label">Email Address / NetID</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="ab1234@srmist.edu.in"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="input-group animate-fade-in-up delay-200" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
                </div>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-premium animate-fade-in-up delay-300" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" style={{ width: '20px', height: '20px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Optional Footer Text and Parent Portal Link */}
          <div className="animate-fade-in-up delay-300" style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>Designed for a seamless experience</p>
            
            <Link 
              href="/parent" 
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
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f8fafc'; }}
              onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              Are you a parent? <span style={{ color: '#10b981' }}>Login here</span> &rarr;
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
