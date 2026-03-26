"use client";

import React from 'react';
import Link from 'next/link';
import { fetchParentDashboard } from '@/app/actions';
import useSWR from 'swr';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

function getParentToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('srm_parent_token');
}

export default function ParentDashboard() {
  const token = getParentToken();
  const router = useRouter();

  const { data, error, isLoading: loading } = useSWR(
    token ? ['parentDashboardData', token] : null,
    ([, token]) => fetchParentDashboard(token as string),
    { revalidateOnFocus: false }
  );

  const userInfo = data?.userInfo;
  const dayOrder = data?.dayOrder;
  const timetable = data?.timetable?.schedule;
  const dashSummary = data?.dashSummary;
  const attendanceDetails = data?.attendanceDetails || [];

  let errorDetails = null;
  if (!token) {
    errorDetails = { message: 'Not logged in', details: 'No session token found. Please log in again.' };
  } else if (error || data?.error) {
    errorDetails = { message: data?.error || 'Failed to load data', details: 'Your parent session may have expired.' };
  }

  const handleLogout = () => {
    localStorage.removeItem('srm_parent_token');
    router.push('/parent');
  };

  return (
    <div className="page-container" style={{ paddingBottom: '20px' }}>
      <header className="glass-panel animate-fade-in" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(0, 0, 0, 0.4))', borderLeft: '4px solid #10b981' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '4px', background: 'linear-gradient(to right, #34d399, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ward Overview</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{userInfo ? `${userInfo.name} - ${userInfo.registrationNumber}` : 'Loading details...'}</p>
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Today's Schedule</h2>
          </div>
          {loading ? (
            <p style={{ color: '#94a3b8' }}>Loading schedule...</p>
          ) : errorDetails ? (
            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px' }}>
              <div style={{ color: '#fca5a5', fontWeight: 'bold', marginBottom: '8px' }}>{errorDetails.message}</div>
              {errorDetails.details && <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '12px' }}>{errorDetails.details}</div>}
              <Link href="/parent" style={{ color: '#fca5a5', textDecoration: 'underline', fontSize: '0.85rem' }}>Return to Login</Link>
            </div>
          ) : (
            <div>
              <p style={{ marginBottom: '16px' }}><strong>Today's Day Order:</strong> <span style={{ fontWeight: 'bold', color: '#10b981' }}>{dayOrder?.dayOrder && dayOrder.dayOrder !== "-" ? dayOrder.dayOrder : 'None'}</span></p>

              {timetable && dayOrder?.dayOrder && (timetable as any)[dayOrder.dayOrder] && (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    {(() => {
                      const todaySlots = (timetable as any)[dayOrder.dayOrder] || [];
                      const slotCount = Math.max(10, todaySlots.length);
                      const paddedSlots = Array.from({ length: slotCount }, (_, i) => todaySlots[i] || null);

                      const slotTimings = [
                        "08:00 AM - 08:50 AM", "08:50 AM - 09:40 AM", "09:45 AM - 10:35 AM", "10:40 AM - 11:30 AM", "11:35 AM - 12:25 PM",
                        "12:30 PM - 01:20 PM", "01:25 PM - 02:15 PM", "02:20 PM - 03:10 PM", "03:15 PM - 04:05 PM", "04:05 PM - 04:55 PM"
                      ];

                      return paddedSlots.map((slotInfo: any, idx: number) => {
                        const timeStr = slotTimings[idx] || "Extended Timing";

                        if (!slotInfo) {
                          return (
                            <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '12px', borderLeft: '4px solid rgba(255,255,255,0.1)', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: '900', fontSize: '0.85rem', color: '#64748b', letterSpacing: '0.5px' }}>
                                  {timeStr}
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                  P - {idx + 1}
                                </div>
                              </div>
                              <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#475569', marginTop: '6px' }}>
                                No Class
                              </div>
                            </div>
                          );
                        }

                        let marginBadge = null;
                        if (attendanceDetails.length > 0) {
                          const attRecord = attendanceDetails.find((a: any) => a.courseCode === slotInfo.code || (a.courseTitle && slotInfo.title && a.courseTitle.includes(slotInfo.title)));
                          if (attRecord) {
                            const conducted = parseInt(attRecord.conducted) || 0;
                            const attended = parseInt(attRecord.attended) || 0;
                            if (conducted > 0) {
                              const pct = attended / conducted;
                              if (pct >= 0.75) {
                                marginBadge = <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Safe</div>;
                              } else {
                                marginBadge = <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Shortage</div>;
                              }
                            }
                          }
                        }

                        return (
                          <div key={idx} style={{ background: 'linear-gradient(to right, rgba(16, 185, 129, 0.05), rgba(0,0,0,0.3))', padding: '12px 16px', borderRadius: '12px', borderLeft: '4px solid #10b981', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div style={{ fontWeight: '900', fontSize: '0.95rem', color: '#34d399', letterSpacing: '0.5px' }}>
                                {timeStr}
                              </div>
                              <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {slotInfo.slot}
                              </div>
                            </div>
                            <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '8px', lineHeight: '1.4' }}>
                              {slotInfo.title}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{slotInfo.code}</div>
                                {marginBadge}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                {slotInfo.room}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {dashSummary && (
            <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s', display: 'flex', flexDirection: 'column', gap: '20px', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>Academic Performance</h2>
                <div style={{ width: '40px', height: '4px', background: '#10b981', borderRadius: '2px' }}></div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: '#3b82f6', filter: 'blur(40px)', opacity: 0.3 }}></div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>INTERNAL MARKS</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontWeight: '800', fontSize: '2.5rem', color: '#ffffff', lineHeight: 1 }}>{dashSummary.marks}</span>
                    <span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: '600' }}>/ {dashSummary.maxMarks}</span>
                  </div>
                </div>
                
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: parseFloat(dashSummary.attendance) >= 75 ? '#10b981' : '#f43f5e', filter: 'blur(40px)', opacity: 0.25 }}></div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>ATTENDANCE</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                    <span style={{ fontWeight: '800', fontSize: '2.5rem', color: parseFloat(dashSummary.attendance) >= 75 ? '#34d399' : '#fb7185', lineHeight: 1 }}>{dashSummary.attendance}</span>
                    <span style={{ fontSize: '1.5rem', color: parseFloat(dashSummary.attendance) >= 75 ? '#34d399' : '#fb7185', fontWeight: 'bold' }}>%</span>
                  </div>
                  {parseFloat(dashSummary.attendance) < 75 && (
                    <div style={{ position: 'absolute', bottom: '12px', right: '16px', fontSize: '0.75rem', color: '#fb7185', fontWeight: '700', letterSpacing: '0.5px' }}>SHORTAGE</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.3s', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>Parent Announcements</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)', marginTop: '8px' }}>
                <h3 style={{ fontSize: '0.95rem', color: '#34d399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.1rem' }}>🎓</span> Semester Exams Alert
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>End semester examinations for Even Semester scheduled to begin from 1st April. Please ensure your ward clears any financial dues prior to examination hall ticket release.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
