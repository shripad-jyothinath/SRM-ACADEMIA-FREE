"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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
          setError('Maximum concurrent sessions limit reached');
          return;
        }
        throw new Error(data.error || 'Login failed');
      }

      // Store the raw Zoho token in localStorage (not document.cookie)
      // because the token string contains semicolons which document.cookie
      // treats as attribute separators, corrupting the stored value
      localStorage.setItem('srm_token', data.token);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '420px', width: '100%' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px', textAlign: 'center', fontWeight: 700 }}>
          SRM Academia
        </h1>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '40px', fontSize: '1.05rem' }}>
          Welcome back. Sign in to your portal.
        </p>

        {error && (
          <div style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '12px', marginBottom: '24px', fontSize: '0.95rem', textAlign: 'center' }}>
            {concurrentSession ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <span>Maximum concurrent sessions limit reached</span>
                <a
                  href="https://academia.srmist.edu.in/49910842/portal/academia-academic-services/myProfile"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.85rem', color: '#fca5a5', textDecoration: 'underline', opacity: 0.85 }}
                >
                  Click here to open Academia and terminate all sessions
                </a>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Then try logging in again.</span>
              </div>
            ) : (
              error
            )}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 500, color: '#e2e8f0' }}>
              SRM Email ID (or NetID)
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="ab1234@srmist.edu.in" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 500, color: '#e2e8f0' }}>
              Password
            </label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '12px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
