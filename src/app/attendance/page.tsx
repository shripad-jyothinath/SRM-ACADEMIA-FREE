"use client";
import React from 'react';
import Link from 'next/link';
import { fetchAttendance, fetchTimetable, fetchCalendar } from '@/app/actions';

import { useSessionResume } from '@/hooks/useSessionResume';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('srm_token');
}

export default function AttendancePage() {
  const [data, setData] = React.useState<any>(null);
  const [timetable, setTimetable] = React.useState<any>(null);
  const [calendarDays, setCalendarDays] = React.useState<any[]>([]);
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [errorDetails, setErrorDetails] = React.useState<{ message: string, details?: string } | null>(null);
  const [isReloading, setIsReloading] = React.useState(false);
  
  const [simulatedAttended, setSimulatedAttended] = React.useState<Record<string, number>>({});
  const [simulatedConducted, setSimulatedConducted] = React.useState<Record<string, number>>({});

  const token = getToken();
  const { isRestoring } = useSessionResume(!!errorDetails || !token);

  const loadData = async (forceRefresh: boolean) => {
    if (!token) {
      setErrorDetails({ message: 'Not logged in', details: 'Please log in again.' });
      setLoading(false);
      return;
    }

    if (forceRefresh) setIsReloading(true);
    else setLoading(true);

    try {
      const [json, ttRes, calRes] = await Promise.all([
        fetchAttendance(token, forceRefresh),
        fetchTimetable(token),
        fetchCalendar(token)
      ]);
      if (json?.error) throw new Error(JSON.stringify(json));
      setErrorDetails(null);
      setData(json);
      if (ttRes?.schedule) setTimetable(ttRes.schedule);
      
      if (calRes && calRes.months) {
        const flat: any[] = [];
        const monthsMap: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
        calRes.months.forEach((m: any) => {
          const lower = m.name.toLowerCase();
          let mIdx = -1;
          Object.keys(monthsMap).forEach(k => { if (lower.includes(k)) mIdx = monthsMap[k]; });
          
          const yearMatch = m.name.match(/\d{2,4}/);
          let year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
          if (year < 100) year += 2000;
          
          if (mIdx !== -1) {
            m.days.forEach((d: any) => {
              const dateObj = new Date(year, mIdx, parseInt(d.date), 12, 0, 0); // Noon
              if (d.dayOrder && d.dayOrder !== "-") {
                 flat.push({ date: dateObj, dayOrder: d.dayOrder });
              }
            });
          }
        });
        setCalendarDays(flat);
      }
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

      {(loading || isRestoring) ? (
        <div className="glass-panel" style={{ textAlign: 'center', color: '#94a3b8' }}>{isRestoring ? 'Restoring your session...' : 'Loading attendance...'}</div>
      ) : errorDetails ? (
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px' }}>
          <h2 style={{ color: '#fca5a5', fontSize: '1.25rem', marginBottom: '8px' }}>{errorDetails.message}</h2>
          {errorDetails.details && <p style={{ color: '#f87171', marginBottom: '16px' }}>{errorDetails.details}</p>}
          <Link href="/" style={{ color: '#fca5a5', textDecoration: 'underline' }}>Return to Login</Link>
        </div>
      ) : (
        <>
        <div className="glass-panel animate-fade-in" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(139, 92, 246, 0.1))', padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Predictor Simulator</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>Use the + and - buttons on each course card to simulate attending or bunking future classes. See how your margins change in real-time before you make a decision!</p>
          
          {timetable && calendarDays.length > 0 && (
            <div style={{ marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '12px', fontWeight: 'bold' }}>Simulate Bunk via Date Range</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>From Date</label>
                  <input type="date" value={fromDate} min={new Date().toISOString().split('T')[0]} onChange={e => { setFromDate(e.target.value); if(toDate && e.target.value > toDate) setToDate(''); }} style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px', colorScheme: 'dark' }} />
                </div>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>To Date</label>
                  <input type="date" value={toDate} min={fromDate || new Date().toISOString().split('T')[0]} onChange={e => setToDate(e.target.value)} style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px', colorScheme: 'dark' }} />
                </div>
                <button 
                  onClick={() => {
                     if (!fromDate || !toDate) return;
                     const start = new Date(fromDate);
                     start.setHours(0,0,0,0);
                     const end = new Date(toDate);
                     end.setHours(23,59,59,999);
                     
                     const newConducted = { ...simulatedConducted };
                     calendarDays.forEach(fd => {
                         if (fd.date >= start && fd.date <= end && timetable[fd.dayOrder]) {
                             timetable[fd.dayOrder].forEach((slot: any) => {
                                if (slot && slot.code) newConducted[slot.code] = (newConducted[slot.code] || 0) + 1;
                             });
                         }
                     });
                     setSimulatedConducted(newConducted);
                  }} 
                  style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', height: '37px', transition: 'all 0.2s' }} 
                  onMouseOver={e=>e.currentTarget.style.background='rgba(239, 68, 68, 0.25)'} 
                  onMouseOut={e=>e.currentTarget.style.background='rgba(239, 68, 68, 0.15)'}
                >
                  Apply Bunk
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={() => { setSimulatedAttended({}); setSimulatedConducted({}); setFromDate(''); setToDate(''); }}
            style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Reset Simulator
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {data?.data?.map((subject: any, idx: number) => {
            const baseAttended = parseInt(subject.attended);
            const baseConducted = parseInt(subject.conducted);
            
            const attendedDiff = simulatedAttended[subject.courseCode] || 0;
            const conductedDiff = simulatedConducted[subject.courseCode] || 0;
            
            const attended = baseAttended + attendedDiff;
            const conducted = baseConducted + conductedDiff;
            
            const percentage = conducted > 0 ? (attended / conducted) * 100 : 0;
            const displayPercentage = parseFloat(percentage.toFixed(2));
            const color = percentage >= 75 ? '#10b981' : percentage >= 65 ? '#f59e0b' : '#ef4444';

            let marginText = "";
            let marginColor = "";
            let marginValue = 0;

            if (percentage >= 75) {
              marginValue = Math.floor(attended / 0.75) - conducted;
              if (marginValue > 0) {
                marginText = `Safe (Margin: ${marginValue})`;
                marginColor = '#10b981';
              } else {
                marginText = `Warning (Margin: 0)`;
                marginColor = '#f59e0b';
              }
            } else {
              marginValue = Math.ceil((0.75 * conducted - attended) / 0.25);
              marginText = `Required: ${marginValue}`;
              marginColor = '#ef4444';
            }

            const handleSimulate = (attend: boolean) => {
               setSimulatedConducted(prev => ({ ...prev, [subject.courseCode]: (prev[subject.courseCode] || 0) + 1 }));
               if (attend) {
                 setSimulatedAttended(prev => ({ ...prev, [subject.courseCode]: (prev[subject.courseCode] || 0) + 1 }));
               }
            };

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px' }}>
                      Attended: <span style={{ fontWeight: attendedDiff !== 0 ? 'bold' : 'normal', color: attendedDiff !== 0 ? 'var(--primary)' : 'inherit' }}>{attended}</span> / <span style={{ fontWeight: conductedDiff !== 0 ? 'bold' : 'normal', color: conductedDiff !== 0 ? 'var(--primary)' : 'inherit' }}>{conducted}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>
                    {displayPercentage}%
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button 
                    onClick={() => handleSimulate(true)}
                    style={{ flex: 1, padding: '6px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                  >+ Attend</button>
                  <button 
                    onClick={() => handleSimulate(false)}
                    style={{ flex: 1, padding: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                  >+ Bunk</button>
                </div>

                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(percentage, 100)}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.3s ease, background 0.3s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}
