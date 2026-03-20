"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AdPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('srm_token');
    // Only show if user is logged in (token exists) and they are not on the login page
    if (token && pathname !== '/') {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [pathname]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 400); // Matches the exit transition duration
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(9, 9, 11, 0.5)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      padding: '24px',
      opacity: isClosing ? 0 : 1,
      transition: 'opacity 0.4s ease',
      perspective: '1200px'
    }}>
      <style>{`
        @keyframes popupEnter {
          0% { opacity: 0; transform: translateY(50px) scale(0.92) rotateX(-12deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotateX(0); }
        }
        @keyframes swayEffect {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .ad-card-modern {
          animation: popupEnter 0.7s cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
        }
        .lightning-icon {
          animation: swayEffect 4.5s ease-in-out infinite;
        }
        .action-btn {
          background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
          color: white;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .action-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -6px rgba(245, 158, 11, 0.6);
        }
        .action-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: all 0.6s ease;
        }
        .action-btn:hover::before {
          left: 100%;
        }
      `}</style>
      
      <div className="ad-card-modern" style={{
        maxWidth: '400px',
        width: '100%',
        position: 'relative',
        borderRadius: '28px',
        background: 'rgba(24, 24, 27, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        transformStyle: 'preserve-3d'
      }}>
        {/* Vibrant Artistic Header */}
        <div style={{
          height: '160px',
          background: 'radial-gradient(circle at top right, #f59e0b 0%, #ea580c 40%, #c2410c 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {/* Subtle noise/texture overlay simulation */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.1\'/%3E%3C/svg%3E")',
            mixBlendMode: 'overlay',
            opacity: 0.5,
          }}></div>
          
          <div className="lightning-icon" style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            borderRadius: '50%',
            padding: '18px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.4)',
            border: '1px solid rgba(255,255,255,0.3)',
            zIndex: 1,
            display: 'flex'
          }}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
        </div>

        {/* Elegant Floating Close Button */}
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s',
            zIndex: 2,
            backdropFilter: 'blur(8px)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.25)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Dynamic Typography and Content */}
        <div style={{ padding: '36px 32px 32px 32px', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '1.85rem',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '14px',
            letterSpacing: '-0.02em',
            lineHeight: '1.2'
          }}>
            Hungry between classes?
          </h2>
          
          <p style={{
            color: '#a1a1aa',
            fontSize: '1.05rem',
            lineHeight: '1.6',
            marginBottom: '32px',
            fontWeight: '400'
          }}>
            Skip the endless queues at <strong style={{ color: '#e4e4e7' }}>Java</strong> and <strong style={{ color: '#e4e4e7' }}>Vendhar Square</strong>. Pre-order with  
            <span style={{ color: '#f59e0b', fontWeight: '700', marginLeft: '6px' }}>Grab&amp;Go</span> to pick up instantly.
          </p>

          <a 
            href="https://grabandgo.tech" 
            target="_blank" 
            rel="noopener noreferrer"
            className="action-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              textDecoration: 'none',
              padding: '16px 24px',
              borderRadius: '16px',
              fontSize: '1.15rem',
              fontWeight: '700',
              width: '100%',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}
            onClick={handleClose}
          >
            <span>Order Ahead Now</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </a>
          
          <div style={{ marginTop: '20px', opacity: 0.8 }}>
            <span style={{ 
              fontSize: '0.75rem', 
              color: '#71717a', 
              textTransform: 'uppercase', 
              letterSpacing: '1.5px', 
              fontWeight: '700' 
            }}>
              Available inside SRM Campus
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
