"use client";
import React from 'react';
import Link from 'next/link';
import { fetchAttendance } from '@/app/actions';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('srm_token');
}

export default function AttendancePage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorDetails, setErrorDetails] = React.useState<{ message: string, details?: string } | null>(null);
  const [isReloading, setIsReloading] = React.useState(false);

  const loadData = async (forceRefresh: boolean) => {
    const token = getToken();
    if (!token) {
      setErrorDetails({ message: 'Not logged in', details: 'Please log in again.' });
      setLoading(false);
      return;
    }

    if (forceRefresh) setIsReloading(true);
    else setLoading(true);

    try {
      const json = await fetchAttendance(token, forceRefresh);
      if (json?.error) throw new Error(JSON.stringify(json));
      setErrorDetails(null);
      setData(json);
    } catch (err: any) {
      try {
        const parsed = JSON.parse(err.message);
        setErrorDetails({ message: parsed.error || 'Failed to load', details: parsed.details });
      } catch (_) {
        setErrorDetails({ message: err.message });
      }
    } finally {
      if (forceRefresh) setIsReloading(false);
      else setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData(false);
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>Attendance</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => loadData(true)}
            disabled={isReloading}
            style={{
              padding: '6px 14px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              borderRadius: '8px',
              cursor: isReloading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              opacity: isReloading ? 0.6 : 1
            }}
          >
            {isReloading ? 'Refreshing...' : '♻ Reload'}
          </button>
          <Link href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Dashboard</Link>
        </div>
      </header>

      {loading ? (
        <div className="glass-panel" style={{ textAlign: 'center', color: '#94a3b8' }}>Loading attendance...</div>
      ) : errorDetails ? (
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px' }}>
          <h2 style={{ color: '#fca5a5', fontSize: '1.25rem', marginBottom: '8px' }}>{errorDetails.message}</h2>
          {errorDetails.details && <p style={{ color: '#f87171', marginBottom: '16px' }}>{errorDetails.details}</p>}
          <Link href="/" style={{ color: '#fca5a5', textDecoration: 'underline' }}>Return to Login</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {data?.data?.map((subject: any, idx: number) => {
            const percentage = parseFloat(subject.percentage);
            const color = percentage >= 75 ? '#10b981' : percentage >= 65 ? '#f59e0b' : '#ef4444';

            const attended = parseInt(subject.attended);
            const conducted = parseInt(subject.conducted);

            let marginText = "";
            let marginColor = "";
            let marginValue = 0;

            if (percentage >= 75) {
              // margin = floor(Attended / 0.75) - Conducted
              marginValue = Math.floor(attended / 0.75) - conducted;
              marginText = marginValue === 0 ? "Margin: 0" : `Margin: ${marginValue}`;
              marginColor = marginValue > 0 ? '#10b981' : '#f59e0b';
            } else {
              // required = ceil((0.75 * Conducted - Attended) / 0.25)
              marginValue = Math.ceil((0.75 * conducted - attended) / 0.25);
              marginText = `Required: ${marginValue}`;
              marginColor = '#ef4444';
            }

            return (
              <div key={idx} className="glass-panel animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--foreground)' }}>{subject.courseTitle}</h3>
                  {conducted > 0 && (
                    <div style={{ background: `${marginColor}20`, color: marginColor, padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: `1px solid ${marginColor}40`, whiteSpace: 'nowrap', marginLeft: '12px', flexShrink: 0 }}>
                      {marginText}
                    </div>
                  )}
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>{subject.courseCode}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px' }}>Attended: {subject.attended} / {subject.conducted}</div>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>
                    {subject.percentage}%
                  </div>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(percentage, 100)}%`, height: '100%', background: color, borderRadius: '3px' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
