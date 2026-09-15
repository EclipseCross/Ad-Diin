/**
 * MosqueLoader.tsx
 * ────────────────
 * Beautiful loading screen shown while the 3D scene initialises.
 * Pure CSS — no dependencies on Three.js.
 */

import { useEffect, useState } from 'react';

interface Props {
  progress: number; // 0-100
  onComplete?: () => void;
}

export default function MosqueLoader({ progress, onComplete }: Props) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => onComplete?.(), 600);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [progress, onComplete]);

  return (
    <div
      aria-live="polite"
      aria-label={`Loading Ad-Diin, ${Math.round(progress)}%`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(155deg, #030a04 0%, #050e06 50%, #040b05 100%)',
        transition: 'opacity 0.6s ease',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'all',
      }}
    >
      {/* Stars background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(i * 137.508) % 100}%`,
              top: `${(i * 97.7) % 100}%`,
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              borderRadius: '50%',
              background: '#d4af37',
              opacity: 0.3 + (i % 4) * 0.15,
              animation: `star-tw ${2 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i % 5) * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* Mosque silhouette SVG */}
      <svg
        viewBox="0 0 300 180"
        style={{
          width: 200,
          height: 120,
          marginBottom: 32,
          filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.5))',
          animation: 'dome-glow-loader 3s ease-in-out infinite',
        }}
        aria-hidden="true"
      >
        {/* Base */}
        <rect x="40" y="140" width="220" height="40" fill="rgba(212,175,55,0.08)" stroke="#d4af37" strokeWidth="0.7" opacity="0.5" />
        {/* Main dome */}
        <path d="M90 140 L90 80 Q90 25 150 25 Q210 25 210 80 L210 140 Z"
          fill="rgba(212,175,55,0.06)" stroke="#d4af37" strokeWidth="1.2" opacity="0.7" />
        {/* Inner arch */}
        <path d="M110 140 L110 90 Q110 50 150 50 Q190 50 190 90 L190 140 Z"
          fill="rgba(16,185,129,0.04)" stroke="#d4af37" strokeWidth="0.6" opacity="0.4" />
        {/* Left minaret */}
        <rect x="50" y="80" width="18" height="60" fill="rgba(212,175,55,0.05)" stroke="#d4af37" strokeWidth="0.6" opacity="0.5" />
        <path d="M50 80 Q59 60 68 80" fill="rgba(212,175,55,0.1)" stroke="#d4af37" strokeWidth="0.6" opacity="0.6" />
        <line x1="59" y1="60" x2="59" y2="46" stroke="#d4af37" strokeWidth="0.6" opacity="0.5" />
        {/* Right minaret */}
        <rect x="232" y="80" width="18" height="60" fill="rgba(212,175,55,0.05)" stroke="#d4af37" strokeWidth="0.6" opacity="0.5" />
        <path d="M232 80 Q241 60 250 80" fill="rgba(212,175,55,0.1)" stroke="#d4af37" strokeWidth="0.6" opacity="0.6" />
        <line x1="241" y1="60" x2="241" y2="46" stroke="#d4af37" strokeWidth="0.6" opacity="0.5" />
        {/* Star finial */}
        <polygon
          points="150,28 152,34 158,34 153,38 155,44 150,40 145,44 147,38 142,34 148,34"
          fill="#d4af37" opacity="0.8"
        />
        {/* Crescent */}
        <path d="M258 30 A14 14 0 1 0 272 44 A10 10 0 1 1 258 30Z" fill="#d4af37" opacity="0.75" />
      </svg>

      {/* Brand */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p style={{ fontFamily: 'serif', fontSize: 28, color: '#d4af37', margin: 0, letterSpacing: '0.02em' }}>
          الدين
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '6px 0 0', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
          Ad-Diin Mosque
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        width: 220,
        height: 2,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 12,
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #059669, #d4af37)',
          borderRadius: 2,
          transition: 'width 0.3s ease',
          boxShadow: '0 0 8px rgba(212,175,55,0.6)',
        }} />
      </div>

      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: '0.2em', margin: 0 }}>
        {progress < 100 ? 'PREPARING THE SACRED SPACE…' : 'WELCOME TO AD-DIIN'}
      </p>

      <style>{`
        @keyframes star-tw {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.2); }
        }
        @keyframes dome-glow-loader {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(212,175,55,0.4)); }
          50% { filter: drop-shadow(0 0 30px rgba(212,175,55,0.8)); }
        }
      `}</style>
    </div>
  );
}
