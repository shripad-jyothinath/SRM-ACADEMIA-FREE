"use client";

import React from 'react';
import Link from 'next/link';
import { Calendar, Megaphone, CheckSquare, Gamepad2, FileText, ArrowRight } from 'lucide-react';

export default function HubPage() {
  return (
    <div className="page-container" style={{ paddingBottom: '120px' }}>
      <header className="glass-panel animate-fade-in" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>Student Hub</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Discover events, resources, and campus tools.</p>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Featured Section */}
        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s', padding: '32px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(99, 102, 241, 0.1))', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Megaphone size={28} color="#38bdf8" />
            <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', margin: 0 }}>Campus Events</h2>
          </div>
          <p style={{ color: '#cbd5e1', marginBottom: '24px', lineHeight: '1.6' }}>
            Stay updated with the latest hackathons, cultural fests, and technical symposiums happening around SRM. Get your tickets and register early!
          </p>
          <button style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            View Event Calendar <ArrowRight size={16} />
          </button>
        </div>

        {/* Resources Grid */}
        <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: '8px 0 0 0' }}>Essential Tools</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          <Link href="/calendar" style={{ textDecoration: 'none' }}>
            <HubCard 
              title="Academic Planner" 
              description="Organize your upcoming assignments, internals, and project deadlines in one place."
              icon={<CheckSquare size={24} color="#10b981" />} 
              delay="0.2s"
            />
          </Link>
          
          <a href="https://thehelpers.vercel.app" target="_blank" style={{ textDecoration: 'none' }}>
            <HubCard 
              title="Study Materials" 
              description="Access crowd-sourced notes, past year question papers, and syllabus copies via TheHelpers."
              icon={<FileText size={24} color="#f59e0b" />} 
              delay="0.3s"
            />
          </a>

        </div>
      </div>
    </div>
  );
}

function HubCard({ title, description, icon, delay }: { title: string, description: string, icon: React.ReactNode, delay: string }) {
  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: delay, padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0 }}>{title}</h3>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>{description}</p>
    </div>
  );
}
