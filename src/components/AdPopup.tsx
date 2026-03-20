"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AdPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if the user is logged in
    const token = localStorage.getItem('srm_token');
    
    // Show the popup on initial load (reload) or upon navigation to a logged-in route (login)
    // We restrict it so it only shows if we have a valid session token tracking their logged in state.
    if (token && pathname !== '/') {
      // Small delay for smooth transition appearance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      padding: '16px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '450px',
        width: '100%',
        position: 'relative',
        padding: '40px 32px',
        textAlign: 'center',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(56, 189, 248, 0.25)',
        backgroundColor: '#0f172a' // Solid dark blue slate background fallback
      }}>
        <button 
          onClick={() => setIsVisible(false)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '1.75rem',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: '1',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#f8fafc'}
          onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
          aria-label="Close"
        >
          &times;
        </button>
        
        <div style={{
          background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2.25rem',
          fontWeight: '800',
          marginBottom: '16px',
          letterSpacing: '-0.5px'
        }}>
          Skip the Queue!
        </div>
        
        <h3 style={{ 
          fontSize: '1.25rem', 
          color: '#f8fafc', 
          marginBottom: '16px', 
          lineHeight: '1.5',
          fontWeight: '600'
        }}>
          Pre-order your food at SRM Java &amp; Vendhar Square.
        </h3>
        
        <p style={{ 
          color: '#94a3b8', 
          marginBottom: '32px', 
          fontSize: '1.05rem', 
          lineHeight: '1.6' 
        }}>
          Don't wait in line. Use <strong style={{color: '#e2e8f0'}}>Grab&amp;Go</strong> to order online and pick up your food instantly.
        </p>
        
        <a 
          href="https://grabandgo.tech" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ 
            display: 'inline-block',
            textDecoration: 'none',
            fontSize: '1.1rem',
            padding: '14px 28px',
            fontWeight: '600',
            width: '100%',
            maxWidth: '280px',
            boxShadow: '0 4px 14px 0 rgba(56, 189, 248, 0.39)'
          }}
          onClick={() => setIsVisible(false)}
        >
          Visit Grab&amp;Go
        </a>
      </div>
    </div>
  );
}
