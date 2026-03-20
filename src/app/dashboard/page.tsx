"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchUserInfo, fetchDayOrder, fetchTimetable, fetchMarks, fetchAttendance } from '@/app/actions';

import useSWR from 'swr';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('srm_token');
}

const fetchDashboardData = async ([, token]: [string, string]) => {
  const [userData, dayOrderData, timetableData, marksRes, attendanceRes] = await Promise.all([
    fetchUserInfo(token),
    fetchDayOrder(token),
    fetchTimetable(token),
    fetchMarks(token),
    fetchAttendance(token)
  ]);

  if (userData?.error) throw new Error(JSON.stringify(userData));
  if (dayOrderData?.error) throw new Error(JSON.stringify(dayOrderData));

  let totalAttended = 0;
  let totalConducted = 0;
  attendanceRes?.data?.forEach((sub: any) => {
    totalAttended += parseFloat(sub.attended) || 0;
    totalConducted += parseFloat(sub.conducted) || 0;
  });
  const attPercent = totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(2) : "0.00";

  let tScored = 0;
  let tMax = 0;
  marksRes?.data?.forEach((sub: any) => {
    sub.marks?.forEach((m: any) => {
      if (m.mark !== "Abs" && !isNaN(parseFloat(m.mark))) tScored += parseFloat(m.mark);
      if (!isNaN(parseFloat(m.maxMark))) tMax += parseFloat(m.maxMark);
    });
  });

  return {
    userInfo: userData?.userInfo ?? userData,
    dayOrder: dayOrderData,
    timetable: timetableData?.schedule || null,
    dashSummary: {
      marks: tScored.toFixed(2),
      maxMarks: tMax.toFixed(2),
      attendance: attPercent
    }
  };
};

export default function Dashboard() {
  const token = getToken();

  const { data, error, isLoading: loading } = useSWR(
    token ? ['dashboardData', token] : null,
    fetchDashboardData,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const userInfo = data?.userInfo;
  const dayOrder = data?.dayOrder;
  const timetable = data?.timetable;
  const dashSummary = data?.dashSummary;

  let errorDetails = null;
  if (!token) {
    errorDetails = { message: 'Not logged in', details: 'No session token found. Please log in again.' };
  } else if (error) {
    try {
      const parsed = JSON.parse(error.message);
      errorDetails = { message: parsed.error || 'Failed to load', details: parsed.details };
    } catch (_) {
      errorDetails = { message: 'Failed to load data', details: 'Your session may have expired. Try logging in again.' };
    }
  }

  const [selectedDayOrder, setSelectedDayOrder] = React.useState<string>("1");
  const [isHoliday, setIsHoliday] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (dayOrder) {
      const currentOrder = dayOrder.dayOrder;
      if (!currentOrder || currentOrder === "-" || currentOrder.toLowerCase().includes("holiday")) {
        setIsHoliday(true);
        setSelectedDayOrder("1");
      } else {
        setSelectedDayOrder(currentOrder);
      }
    }
  }, [dayOrder]);

  return (
    <div className="page-container">
      <header className="glass-panel animate-fade-in" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Welcome back{userInfo?.name ? `, ${userInfo.name}` : ''}</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{userInfo?.program || 'Loading program details...'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Registration</div>
          <div style={{ fontWeight: 'bold' }}>{userInfo?.regNumber || userInfo?.registrationNumber || '...'}</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Today's Overview</h2>
            {isHoliday && <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.4)' }}>HOLIDAY</div>}
          </div>
          {errorDetails ? (
            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px' }}>
              <div style={{ color: '#fca5a5', fontWeight: 'bold', marginBottom: '8px' }}>{errorDetails.message}</div>
              {errorDetails.details && <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '12px' }}>{errorDetails.details}</div>}
              <Link href="/" style={{ color: '#fca5a5', textDecoration: 'underline', fontSize: '0.85rem' }}>Return to Login</Link>
            </div>
          ) : loading ? (
            <p style={{ color: '#94a3b8' }}>Loading schedule...</p>
          ) : (
            <div>
              <p style={{ marginBottom: '8px' }}><strong>Today's Day Order:</strong> <span className="gradient-text" style={{ fontWeight: 'bold' }}>{dayOrder?.dayOrder && dayOrder.dayOrder !== "-" ? dayOrder.dayOrder : 'None'}</span></p>
              <p style={{ marginBottom: '16px', color: '#94a3b8', fontSize: '0.875rem' }}>{userInfo?.department || ''}{userInfo?.section ? ` – ${userInfo.section}` : ''}</p>

              {timetable && (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', background: 'rgba(0,0,0,0.1)', padding: '8px', borderRadius: '12px', width: 'fit-content' }}>
                    <button
                      onClick={() => setSelectedDayOrder(prev => String(Math.max(1, parseInt(prev) - 1)))}
                      disabled={selectedDayOrder === "1"}
                      style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: selectedDayOrder === "1" ? 'not-allowed' : 'pointer', opacity: selectedDayOrder === "1" ? 0.3 : 1, transition: 'all 0.2s' }}>
                      &minus;
                    </button>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', width: '100px', textAlign: 'center' }}>
                      Day Order {selectedDayOrder}
                    </div>
                    <button
                      onClick={() => setSelectedDayOrder(prev => String(Math.min(5, parseInt(prev) + 1)))}
                      disabled={selectedDayOrder === "5"}
                      style={{ padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: selectedDayOrder === "5" ? 'not-allowed' : 'pointer', opacity: selectedDayOrder === "5" ? 0.3 : 1, transition: 'all 0.2s' }}>
                      &#43;
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(() => {
                      const todaySlots = timetable[selectedDayOrder] || [];
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
                            <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid rgba(255,255,255,0.1)', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: '900', fontSize: '1.05rem', color: '#64748b', letterSpacing: '0.5px' }}>
                                  {timeStr}
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                  P - {idx + 1}
                                </div>
                              </div>
                              <div style={{ fontSize: '1rem', fontWeight: '500', color: '#475569', marginTop: '6px' }}>
                                No Class
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={idx} style={{ background: 'linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(0,0,0,0.3))', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--primary)', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div style={{ fontWeight: '900', fontSize: '1.15rem', color: '#38bdf8', letterSpacing: '0.5px' }}>
                                {timeStr}
                              </div>
                              <div style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {slotInfo.slot}
                              </div>
                            </div>
                            <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '8px', lineHeight: '1.4' }}>
                              {slotInfo.title}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{slotInfo.code}</div>
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
          <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Link href="/attendance" style={{ display: 'block' }}>
                <button className="btn-primary" style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', color: 'var(--primary)' }}>Attendance</button>
              </Link>
              <Link href="/marks" style={{ display: 'block' }}>
                <button className="btn-primary" style={{ background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.4)', color: 'var(--accent)' }}>Marks</button>
              </Link>
              <Link href="/calendar" style={{ display: 'block', gridColumn: 'span 2' }}>
                <button className="btn-primary" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981' }}>Calendar</button>
              </Link>
            </div>
          </div>

          {dashSummary && (
            <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.3s', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Current Performance</h2>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '8px' }}>Total Marks</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary)' }}>
                    {dashSummary.marks} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ {dashSummary.maxMarks}</span>
                  </div>
                </div>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '8px' }}>Attendance</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: parseFloat(dashSummary.attendance) >= 75 ? '#10b981' : '#f43f5e' }}>
                    {dashSummary.attendance}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
