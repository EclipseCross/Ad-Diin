/**
 * ImmersiveHome.tsx
 * ─────────────────
 * Main orchestrator for the immersive 3D mosque Home page.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────┐
 * │  Fixed 3D Canvas (MosqueScene) — full viewport  │
 * ├─────────────────────────────────────────────────┤
 * │  Scrollable overlay (pointer-events: none)       │
 * │    • SectionWelcome                              │
 * │    • SectionPrayer                               │
 * │    • SectionCommunity                            │
 * │    • SectionEvents                               │
 * │    • SectionDonation                             │
 * │    • SectionDiinAI                               │
 * │    • SectionProductAnalyzer                      │
 * │    • SectionFocus                                │
 * │    • SectionFinal                                │
 * ├─────────────────────────────────────────────────┤
 * │  Section nav dots (fixed, right side)            │
 * │  Loading screen (fixed, top)                     │
 * └─────────────────────────────────────────────────┘
 *
 * The existing Header and Footer are rendered by App.tsx outside
 * this component — they remain untouched.
 *
 * Scroll position is shared with the 3D camera via a ref (no re-renders).
 */

import {
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from 'react';
import MosqueLoader from './MosqueLoader';
import {
  SectionWelcome,
  SectionPrayer,
  SectionCommunity,
  SectionEvents,
  SectionDonation,
  SectionDiinAI,
  SectionProductAnalyzer,
  SectionFocus,
  SectionFinal,
} from './ScrollSections';

// Lazy-load the heavy 3D scene
const MosqueScene = lazy(() => import('./MosqueScene'));

// ── WebGL detection ────────────────────────────────────────────────────────
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// ── Section navigation dots ───────────────────────────────────────────────
const NAV_DOTS = [
  { id: 'section-welcome',  label: 'Welcome'   },
  { id: 'section-prayer',   label: 'Prayer'    },
  { id: 'section-community',label: 'Community' },
  { id: 'section-events',   label: 'Events'    },
  { id: 'section-donation', label: 'Donate'    },
  { id: 'section-diin-ai',  label: 'Diin AI'   },
  { id: 'section-product',  label: 'Products'  },
  { id: 'section-focus',    label: 'Focus'     },
  { id: 'section-final',    label: 'Closing'   },
];

function SectionDots({ activeIdx }: { activeIdx: number }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3"
      aria-label="Section navigation"
      style={{ mixBlendMode: 'normal' }}
    >
      {NAV_DOTS.map((dot, idx) => (
        <button
          key={dot.id}
          onClick={() => scrollTo(dot.id)}
          aria-label={`Go to ${dot.label}`}
          title={dot.label}
          className="group flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-full"
        >
          <span
            className="text-xs text-yellow-300/0 group-hover:text-yellow-300/80 transition-all duration-200 font-medium select-none"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
          >
            {dot.label}
          </span>
          <span
            className="block rounded-full transition-all duration-300"
            style={{
              width:  idx === activeIdx ? '10px' : '6px',
              height: idx === activeIdx ? '10px' : '6px',
              background: idx === activeIdx ? '#d4af37' : 'rgba(255,255,255,0.22)',
              boxShadow: idx === activeIdx ? '0 0 8px #d4af37' : 'none',
            }}
          />
        </button>
      ))}
    </nav>
  );
}

// ── CSS Fallback (no WebGL) ────────────────────────────────────────────────
function CSSFallbackBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: 'linear-gradient(155deg, #040d06 0%, #071509 35%, #0a1a0f 65%, #071509 100%)',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Stars */}
      {Array.from({ length: 80 }, (_, i) => (
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
            opacity: 0.25 + (i % 4) * 0.12,
            animation: `starTw ${2 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${(i % 5) * 0.7}s`,
          }}
        />
      ))}
      {/* Mosque silhouette SVG centred */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.12, pointerEvents: 'none',
      }}>
        <svg viewBox="0 0 500 300" style={{ width: 600, height: 360 }} aria-hidden="true">
          <rect x="60" y="220" width="380" height="80" fill="#d4af37" opacity="0.3" />
          <path d="M140 220 L140 130 Q140 40 250 40 Q360 40 360 130 L360 220 Z"
            fill="none" stroke="#d4af37" strokeWidth="1.2" opacity="0.6" />
          <rect x="80" y="120" width="24" height="100" fill="none" stroke="#d4af37" strokeWidth="0.7" opacity="0.5" />
          <path d="M80 120 Q92 95 104 120" fill="none" stroke="#d4af37" strokeWidth="0.7" opacity="0.5" />
          <line x1="92" y1="95" x2="92" y2="75" stroke="#d4af37" strokeWidth="0.7" opacity="0.5" />
          <rect x="396" y="120" width="24" height="100" fill="none" stroke="#d4af37" strokeWidth="0.7" opacity="0.5" />
          <path d="M396 120 Q408 95 420 120" fill="none" stroke="#d4af37" strokeWidth="0.7" opacity="0.5" />
          <line x1="408" y1="95" x2="408" y2="75" stroke="#d4af37" strokeWidth="0.7" opacity="0.5" />
        </svg>
      </div>
      {/* Radial glows */}
      <div style={{ position:'absolute', inset:0, background:
        'radial-gradient(ellipse 70% 60% at 15% 40%, rgba(16,185,129,0.1) 0%, transparent 65%), ' +
        'radial-gradient(ellipse 50% 55% at 85% 25%, rgba(212,175,55,0.06) 0%, transparent 60%)',
      }} />
      <style>{`
        @keyframes starTw {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

// ── Main ImmersiveHome ────────────────────────────────────────────────────
export default function ImmersiveHome() {
  const scrollProgress = useRef(0);
  const [activeSection, setActiveSection] = useState(0);
  const [webglAvailable] = useState(detectWebGL);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Simulate loading progress (real Three.js load is < 1s for procedural geo)
  useEffect(() => {
    if (!webglAvailable) { setLoaded(true); return; }
    let v = 0;
    const t = setInterval(() => {
      v += Math.random() * 18 + 8;
      setLoadProgress(Math.min(v, 100));
      if (v >= 100) clearInterval(t);
    }, 120);
    return () => clearInterval(t);
  }, [webglAvailable]);

  // Update scroll progress ref (no re-render — camera reads it directly)
  useEffect(() => {
    const onScroll = () => {
      const scrollEl = document.documentElement;
      const max = scrollEl.scrollHeight - scrollEl.clientHeight;
      scrollProgress.current = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active section tracker for dots
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    NAV_DOTS.forEach((dot, idx) => {
      const el = document.getElementById(dot.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(idx); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <>
      {/* ── Loading screen ── */}
      {!loaded && webglAvailable && (
        <MosqueLoader
          progress={loadProgress}
          onComplete={() => setLoaded(true)}
        />
      )}

      {/* ── 3D canvas — fixed behind everything ── */}
      {webglAvailable ? (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
        >
          <Suspense fallback={null}>
            <MosqueScene scrollProgress={scrollProgress} webglAvailable={webglAvailable} />
          </Suspense>
        </div>
      ) : (
        <CSSFallbackBackground />
      )}

      {/* ── Section navigation dots ── */}
      {!reducedMotion.current && <SectionDots activeIdx={activeSection} />}

      {/* ── Scrollable content overlay ── */}
      {/*
        The outer div is the scroll container.
        Individual sections are min-h-screen.
        pointer-events: none on the container, restored on cards/buttons.
      */}
      <div
        style={{ position: 'relative', zIndex: 10 }}
        className="min-h-screen"
      >
        <SectionWelcome />
        <SectionPrayer />
        <SectionCommunity />
        <SectionEvents />
        <SectionDonation />
        <SectionDiinAI />
        <SectionProductAnalyzer />
        <SectionFocus />
        <SectionFinal />
      </div>
    </>
  );
}
