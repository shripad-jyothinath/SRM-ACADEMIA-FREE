"use client";
import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { fetchMarks } from '@/app/actions';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { useSessionResume } from '@/hooks/useSessionResume';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('srm_token');
}

export default function MarksPage() {
  const token = getToken();

  const [isReloading, setIsReloading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorDetails, setErrorDetails] = React.useState<{ message: string, details?: string } | null>(null);

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
      const json = await fetchMarks(token, forceRefresh);
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

  const handleReload = () => loadData(true);

  // Compute Aggregates & Chart Data
  let chartData: any[] = [];
  let totalScored = 0;
  let totalMax = 0;
  let cgpaSum = 0;
  let validSubjects = 0;

  if (data?.data) {
    chartData = data.data.map((subject: any) => {
      let subjectScored = 0;
      let subjectTotal = 0;

      subject.marks.forEach((m: any) => {
        if (m.mark !== "Abs" && !isNaN(parseFloat(m.mark))) {
          subjectScored += parseFloat(m.mark);
        }
        if (!isNaN(parseFloat(m.maxMark))) {
          subjectTotal += parseFloat(m.maxMark);
        }
      });

      totalScored += subjectScored;
      totalMax += subjectTotal;

      if (subjectTotal > 0) {
        const percentage = (subjectScored / subjectTotal) * 100;
        cgpaSum += (percentage / 10);
        validSubjects++;
      }

      return {
        name: subject.courseCode,
        Scored: parseFloat(subjectScored.toFixed(2)),
        Total: parseFloat(subjectTotal.toFixed(2))
      };
    });
  }

  const estimatedCgpa = validSubjects > 0 ? (cgpaSum / validSubjects).toFixed(2) : "0.00";

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>Marks & Performance</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handleReload}
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
        <div className="glass-panel" style={{ textAlign: 'center', color: '#94a3b8' }}>{isRestoring ? 'Restoring your session...' : 'Loading marks...'}</div>
      ) : errorDetails ? (
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px' }}>
          <h2 style={{ color: '#fca5a5', fontSize: '1.25rem', marginBottom: '8px' }}>{errorDetails.message}</h2>
          {errorDetails.details && <p style={{ color: '#f87171', marginBottom: '16px' }}>{errorDetails.details}</p>}
          <Link href="/" style={{ color: '#fca5a5', textDecoration: 'underline' }}>Return to Login</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '16px' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>Total Marks</p>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                {totalScored.toFixed(2)} <span style={{ fontSize: '1rem', color: '#475569' }}>/ {totalMax.toFixed(2)}</span>
              </div>
            </div>
            <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', animationDelay: '0.1s', padding: '16px' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>Est. CGPA</p>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                {estimatedCgpa}
              </div>
              <p style={{ color: '#64748b', fontSize: '0.65rem', marginTop: '4px' }}>*Internal % scaled</p>
            </div>
          </div>

          {/* Detailed Subject Breakdowns */}
          {data?.data?.map((subject: any, idx: number) => {
            let sScored = 0;
            let sTotal = 0;
            subject.marks.forEach((m: any) => {
              if (m.mark !== "Abs" && !isNaN(parseFloat(m.mark))) sScored += parseFloat(m.mark);
              if (!isNaN(parseFloat(m.maxMark))) sTotal += parseFloat(m.maxMark);
            });

            // Chart data specific to this subject's tests mapped out as percentages
            const subjectChartData = [{ name: "Start", Percentage: 0 }];

            const sortedMarks = [...subject.marks].sort((a: any, b: any) => {
              const numA = parseInt((a.eventName.match(/\d+/) || ['99'])[0]);
              const numB = parseInt((b.eventName.match(/\d+/) || ['99'])[0]);
              if (numA !== numB) return numA - numB;
              return a.eventName.localeCompare(b.eventName);
            });

            sortedMarks.forEach((m: any) => {
              const max = parseFloat(m.maxMark) || 0;
              let score = 0;
              if (m.mark !== "Abs" && !isNaN(parseFloat(m.mark))) score = parseFloat(m.mark);

              const percent = max > 0 ? (score / max) * 100 : 0;
              subjectChartData.push({
                name: m.eventName,
                Percentage: parseFloat(percent.toFixed(2))
              });
            });

            return (
              <div key={idx} className="glass-panel animate-fade-in" style={{ animationDelay: `${0.2 + (idx * 0.05)}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--foreground)' }}>{subject.courseTitle}</h3>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{subject.courseCode}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {sScored.toFixed(2)} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ {sTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Course Total</div>
                  </div>
                </div>

                {subjectChartData.length > 1 && (
                  <div style={{ height: '220px', marginBottom: '20px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={subjectChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip
                          cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                          itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${value}%`, "Score"]}
                        />
                        <Line type="monotone" dataKey="Percentage" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                  {sortedMarks.map((mark: any, midx: number) => (
                    <div key={midx} style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mark.eventName}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                        <span style={{ color: 'var(--primary)' }}>{mark.mark}</span>
                        <span style={{ color: '#475569', fontSize: '0.9rem' }}> / {mark.maxMark}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
