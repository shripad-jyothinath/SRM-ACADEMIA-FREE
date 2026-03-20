"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckCircle, Plus, TrendingUp, Calendar, Utensils, Zap, Users, ExternalLink, Calculator, BookOpen } from 'lucide-react';

export default function BottomNav() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only show bottom nav if logged in (not on login page)
  if (!mounted || pathname === '/') return null;

  return (
    <>
      {/* Floating Action Menu Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99998,
          backgroundColor: 'rgba(9, 9, 11, 0.7)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fadeInScale 0.3s ease-out'
        }} onClick={() => setIsModalOpen(false)}>
          
          <div className="glass-panel" style={{
            maxWidth: '400px',
            width: '100%',
            padding: '32px 24px',
            borderRadius: '28px',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', textAlign: 'center', color: '#f8fafc' }}>Campus Services</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <ShortcutItem href="/calculator" icon={<Calculator size={24} color="#f59e0b" />} label="CGPA Calc" bgColor="rgba(245, 158, 11, 0.15)" onClick={() => setIsModalOpen(false)} />
              <ShortcutItem href="/calendar" icon={<Calendar size={24} color="#10b981" />} label="Planner" bgColor="rgba(16, 185, 129, 0.15)" onClick={() => setIsModalOpen(false)} />
              <ShortcutItem href="#" icon={<Utensils size={24} color="#ec4899" />} label="Mess Menu" bgColor="rgba(236, 72, 153, 0.15)" onClick={() => setIsModalOpen(false)} />
              
              <ShortcutItem href="/attendance" icon={<Zap size={24} color="#38bdf8" />} label="Predictor" bgColor="rgba(56, 189, 248, 0.15)" onClick={() => setIsModalOpen(false)} />
              <ShortcutItem href="#" icon={<Users size={24} color="#8b5cf6" />} label="Clubs" bgColor="rgba(139, 92, 246, 0.15)" onClick={() => setIsModalOpen(false)} />
              <ShortcutItem href="https://discord.gg/srm" target="_blank" icon={<ExternalLink size={24} color="#6366f1" />} label="Community" bgColor="rgba(99, 102, 241, 0.15)" onClick={() => setIsModalOpen(false)} />
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(false)}
            style={{ marginTop: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99997,
        display: 'flex',
        justifyContent: 'center',
        background: 'transparent'
      }}>
        <nav className="glass-panel" style={{
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto 16px auto',
          padding: '12px 24px',
          borderRadius: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)'
        }}>
          <NavItem href="/dashboard" icon={<Home size={22} />} label="Home" active={pathname === '/dashboard'} />
          <NavItem href="/attendance" icon={<CheckCircle size={22} />} label="Attendance" active={pathname === '/attendance'} />
          
          {/* Central Plus Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              transform: 'translateY(-18px)',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.5)',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-22px) scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(-18px) scale(1)'}
          >
            <Plus size={28} strokeWidth={3} />
          </button>
          
          <NavItem href="/marks" icon={<TrendingUp size={22} />} label="Marks" active={pathname === '/marks'} />
          <NavItem href="/dashboard" icon={<BookOpen size={22} />} label="Hub" active={false} />
        </nav>
      </div>
    </>
  );
}

function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link href={href} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      textDecoration: 'none',
      color: active ? '#38bdf8' : '#94a3b8',
      transition: 'color 0.2s',
      width: '60px'
    }}>
      {icon}
      <span style={{ fontSize: '0.65rem', fontWeight: active ? '600' : '400' }}>{label}</span>
    </Link>
  );
}

function ShortcutItem({ href, icon, label, bgColor, onClick, target }: any) {
  return (
    <Link href={href} onClick={onClick} target={target} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      textDecoration: 'none',
      color: '#f8fafc',
      cursor: 'pointer'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '20px',
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {icon}
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: '500', textAlign: 'center' }}>{label}</span>
    </Link>
  );
}
