"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { fetchCalendar } from '@/app/actions';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('srm_token');
}

const fetcher = async ([, token]: [string, string]) => {
  const json = await fetchCalendar(token);
  if (json?.error) throw new Error(JSON.stringify(json));
  return json;
};

export default function CalendarPage() {
  const token = getToken();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [hasSetDefault, setHasSetDefault] = useState(false);

  const { data, error, isLoading: loading } = useSWR(
    token ? ['calendar', token] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      onSuccess: (jsonData) => {
        if (!hasSetDefault && jsonData?.months?.length > 0) {
          const now = new Date();
          const targetName = `${now.toLocaleString('default', { month: 'short' })} '${now.getFullYear().toString().slice(-2)}`;
          const idx = jsonData.months.findIndex((m: any) => m.name === targetName);
          if (idx !== -1) setCurrentMonthIndex(idx);
          setHasSetDefault(true);
        }
      }
    }
  );

  let errorDetails = null;
  if (!token) {
    errorDetails = { message: 'Not logged in', details: 'Please log in again.' };
  } else if (error) {
    try {
      const parsed = JSON.parse(error.message);
      errorDetails = { message: parsed.error || 'Failed to load', details: parsed.details };
    } catch (_) {
      errorDetails = { message: error.message };
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2rem' }}>Academic Calendar</h1>
        <Link href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none' }}>&larr; Back to Dashboard</Link>
      </header>

      {loading ? (
        <div className="glass-panel" style={{ textAlign: 'center', color: '#94a3b8' }}>Loading calendar...</div>
      ) : errorDetails ? (
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px' }}>
          <h2 style={{ color: '#fca5a5', fontSize: '1.25rem', marginBottom: '8px' }}>{errorDetails.message}</h2>
          {errorDetails.details && <p style={{ color: '#f87171', marginBottom: '16px' }}>{errorDetails.details}</p>}
          <Link href="/" style={{ color: '#fca5a5', textDecoration: 'underline' }}>Return to Login</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {data?.months?.length > 0 && (
            <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
              <button
                onClick={() => setCurrentMonthIndex(prev => Math.max(0, prev - 1))}
                disabled={currentMonthIndex === 0}
                style={{
                  background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none',
                  width: '44px', height: '44px', borderRadius: '50%', fontSize: '1.5rem',
                  cursor: currentMonthIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentMonthIndex === 0 ? 0.3 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                -
              </button>

              <h2 style={{ fontSize: '1.5rem', color: 'var(--accent)', margin: 0, textAlign: 'center' }}>
                {data.months[currentMonthIndex].name}
              </h2>

              <button
                onClick={() => setCurrentMonthIndex(prev => Math.min(data.months.length - 1, prev + 1))}
                disabled={currentMonthIndex === data.months.length - 1}
                style={{
                  background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none',
                  width: '44px', height: '44px', borderRadius: '50%', fontSize: '1.5rem',
                  cursor: currentMonthIndex === data.months.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentMonthIndex === data.months.length - 1 ? 0.3 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                +
              </button>
            </div>
          )}

          {data?.months?.[currentMonthIndex] && (
            <div className="glass-panel animate-fade-in" key={currentMonthIndex}>
              <div style={{ display: 'grid', gap: '12px' }}>
                {data.months[currentMonthIndex].days?.filter((d: any) => d.dayOrder || d.events).length > 0 ? (
                  data.months[currentMonthIndex].days?.filter((d: any) => d.dayOrder || d.events).map((day: any, dIdx: number) => (
                    <div key={dIdx} style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: day.dayOrder ? '4px solid var(--primary)' : '4px solid #475569' }}>
                      <div style={{ width: '80px', fontWeight: 'bold' }}>{day.date}</div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {day.dayOrder && <span style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>Day Order: {day.dayOrder}</span>}
                        {day.events && <span style={{ color: '#e2e8f0' }}>{day.events}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0' }}>
                    No specific events or day orders scheduled for this month.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
