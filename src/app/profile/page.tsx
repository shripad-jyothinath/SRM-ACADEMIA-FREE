"use client";

import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { fetchUserInfo } from '@/app/actions';
import { useSessionResume } from '@/hooks/useSessionResume';
import { User, Mail, Building, MapPin, Hash, Shield, CalendarDays, Users } from 'lucide-react';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('srm_token');
}

export default function ProfilePage() {
  const token = getToken();
  
  const { data: userInfo, error, isLoading } = useSWR(
    token ? ['userInfo', token] : null,
    ([, t]) => fetchUserInfo(t),
    { revalidateOnFocus: false }
  );

  const errorDetails = error || (userInfo?.error ? { message: userInfo.error } : null);
  const { isRestoring } = useSessionResume(!!errorDetails || !token);
  const user = userInfo?.userInfo || userInfo;

  return (
    <div className="page-container" style={{ paddingBottom: '120px' }}>
      <header className="glass-panel animate-fade-in" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>My Profile</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Your academic identity and details.</p>
        </div>
        <Link href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Dashboard</Link>
      </header>

      {(isLoading || isRestoring) ? (
        <div className="glass-panel" style={{ textAlign: 'center', color: '#94a3b8' }}>{isRestoring ? 'Restoring your session...' : 'Loading profile...'}</div>
      ) : errorDetails ? (
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px' }}>
          <h2 style={{ color: '#fca5a5', fontSize: '1.25rem', marginBottom: '8px' }}>Error Loading Profile</h2>
          <p style={{ color: '#f87171', marginBottom: '16px' }}>{errorDetails.message}</p>
        </div>
      ) : user ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel animate-fade-in" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%' }}></div>
            
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(56, 189, 248, 0.3)' }}>
              <User size={50} color="white" />
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', color: '#f8fafc', margin: '0 0 8px 0' }}>{user.name}</h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                <Hash size={16} color="#94a3b8" /> {user.regNumber || user.registrationNumber || 'Pending'}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>Academic Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <InfoRow icon={<Building size={20} color="#38bdf8" />} label="Program" value={user.program} />
                <InfoRow icon={<Shield size={20} color="#818cf8" />} label="Department" value={user.department} />
                <InfoRow icon={<Users size={20} color="#c084fc" />} label="Section" value={user.section} />
                <InfoRow icon={<CalendarDays size={20} color="#f472b6" />} label="Semester" value={user.semester} />
                <InfoRow icon={<CalendarDays size={20} color="#fb7185" />} label="Batch" value={user.batch} />
              </div>
            </div>

            <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>Personal Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <InfoRow icon={<Mail size={20} color="#10b981" />} label="Official Email" value={user.officialEmail || `${user.regNumber}@srmist.edu.in`} />
                <InfoRow icon={<Mail size={20} color="#34d399" />} label="Personal Email" value={user.personalEmail || "Confidential"} />
                <InfoRow icon={<MapPin size={20} color="#f59e0b" />} label="Date of Birth" value={user.dob || "Confidential"} />
                <InfoRow icon={<Shield size={20} color="#ef4444" />} label="Blood Group" value={user.bloodGroup || "Confidential"} />
              </div>
            </div>

          </div>
          
          <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.3s', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={() => { localStorage.removeItem('srm_token'); window.location.href = '/'; }}
              style={{ padding: '12px 32px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', color: '#ef4444', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
            >
              Secure Logout
            </button>
          </div>

        </div>
      ) : null}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      <div style={{ marginTop: '2px' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: '500' }}>{value}</div>
      </div>
    </div>
  );
}
