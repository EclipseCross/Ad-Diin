import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef } from 'react';

// ── Decorative sub-components ────────────────────────────────────────────────

function GeometricRing({
  size,
  className,
  delay = 0,
}: {
  size: number;
  className?: string;
  delay?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`absolute pointer-events-none select-none ${className ?? ''}`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="46" stroke="#d4af37" strokeWidth="0.8" fill="none" opacity="0.35" />
      {/* Inner geometric star */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const x1 = 50 + 46 * Math.cos(angle);
        const y1 = 50 + 46 * Math.sin(angle);
        const x2 = 50 + 46 * Math.cos(angle + Math.PI);
        const y2 = 50 + 46 * Math.sin(angle + Math.PI);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#d4af37"
            strokeWidth="0.5"
            opacity="0.2"
          />
        );
      })}
      <circle cx="50" cy="50" r="30" stroke="#d4af37" strokeWidth="0.6" fill="none" opacity="0.25" />
      <circle cx="50" cy="50" r="14" stroke="#d4af37" strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function IslamicStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`absolute pointer-events-none select-none ${className ?? ''}`}
      aria-hidden="true"
    >
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill="#d4af37"
        opacity="0.6"
      />
    </svg>
  );
}

function MosqueArch() {
  return (
    <svg
      viewBox="0 0 400 220"
      className="w-full max-w-md mx-auto"
      aria-hidden="true"
    >
      {/* Arch body */}
      <path
        d="M20 220 L20 120 Q20 20 200 20 Q380 20 380 120 L380 220 Z"
        fill="none"
        stroke="#d4af37"
        strokeWidth="2"
        opacity="0.5"
      />
      {/* Inner arch */}
      <path
        d="M50 220 L50 130 Q50 55 200 55 Q350 55 350 130 L350 220 Z"
        fill="rgba(212,175,55,0.04)"
        stroke="#d4af37"
        strokeWidth="1"
        opacity="0.4"
      />
      {/* Dome top detail */}
      <path
        d="M160 20 Q200 0 240 20"
        fill="none"
        stroke="#d4af37"
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* Minaret lines */}
      <line x1="20" y1="120" x2="20" y2="80" stroke="#d4af37" strokeWidth="1" opacity="0.3" />
      <line x1="380" y1="120" x2="380" y2="80" stroke="#d4af37" strokeWidth="1" opacity="0.3" />
      {/* Inner pattern */}
      <circle cx="200" cy="110" r="35" fill="none" stroke="#d4af37" strokeWidth="1" opacity="0.25" />
      <circle cx="200" cy="110" r="20" fill="none" stroke="#d4af37" strokeWidth="0.8" opacity="0.2" />
      {/* Decorative dots */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle
            key={deg}
            cx={200 + 35 * Math.cos(rad)}
            cy={110 + 35 * Math.sin(rad)}
            r="2"
            fill="#d4af37"
            opacity="0.4"
          />
        );
      })}
    </svg>
  );
}

// ── Main HeroSection ──────────────────────────────────────────────────────────

interface HeroSectionProps {
  onKnowMore?: () => void;
  onAllActivities?: () => void;
}

export function HeroSection({ onKnowMore, onAllActivities }: HeroSectionProps) {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);

  // Parallax-lite on scroll
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const parallaxEl = hero.querySelector<HTMLElement>('.hero-bg-layer');
      if (parallaxEl) {
        parallaxEl.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollDown = () => {
    const next = document.getElementById('prayer-times-section');
    next?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden min-h-screen flex items-center"
      style={{
        background:
          'linear-gradient(135deg, #0a1a0f 0%, #0d2416 25%, #0f2d1a 50%, #0a1f12 75%, #071509 100%)',
      }}
    >
      {/* Radial glow blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(16,185,129,0.15) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 50% 60% at 80% 30%, rgba(212,175,55,0.08) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 40% 40% at 50% 100%, rgba(16,185,129,0.1) 0%, transparent 60%)',
        }}
      />

      {/* Parallax background layer */}
      <div className="hero-bg-layer absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Large geometric rings */}
        <GeometricRing
          size={420}
          className="animate-spin-slow top-[-80px] right-[-100px] opacity-60"
        />
        <GeometricRing
          size={280}
          className="animate-spin-slow-rev bottom-[-60px] left-[-60px] opacity-40"
          delay={2}
        />
        <GeometricRing
          size={160}
          className="animate-spin-slow top-[60%] left-[8%] opacity-30"
          delay={4}
        />

        {/* Stars / twinkling dots */}
        <IslamicStar className="w-5 h-5 animate-star-twinkle top-[15%] left-[12%]" />
        <IslamicStar className="w-3 h-3 animate-star-twinkle top-[25%] left-[30%]" />
        <IslamicStar className="w-4 h-4 animate-star-twinkle top-[40%] right-[15%]" />
        <IslamicStar className="w-3 h-3 animate-star-twinkle bottom-[30%] right-[25%]" />
        <IslamicStar className="w-5 h-5 animate-star-twinkle bottom-[20%] left-[20%]" />
        <IslamicStar className="w-3 h-3 animate-star-twinkle top-[10%] right-[35%]" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(212,175,55,0.03) 0px, rgba(212,175,55,0.03) 1px, transparent 1px, transparent 80px), ' +
              'repeating-linear-gradient(90deg, rgba(212,175,55,0.03) 0px, rgba(212,175,55,0.03) 1px, transparent 1px, transparent 80px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <div className="text-center lg:text-left animate-reveal-up">
            {/* Arabic badge */}
            <div className="inline-flex items-center gap-2 glass-gold rounded-full px-5 py-2 mb-8">
              <span className="text-yellow-400 text-xl font-bold" style={{ fontFamily: 'serif' }}>
                الدين
              </span>
              <span className="text-yellow-300/60 text-xs tracking-widest uppercase">
                Ad-Diin Mosque
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
              Welcome to{' '}
              <span className="text-gradient-gold block mt-1">Ad-Diin Mosque</span>
            </h1>

            <p className="text-emerald-100/70 text-lg sm:text-xl mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
              A sacred place of Prayer, Learning, and Community Service — where
              faith meets compassion and hearts find peace.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onKnowMore ?? (() => navigate('/about'))}
                className="relative group overflow-hidden px-8 py-4 rounded-xl font-semibold text-base text-white transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 8px 32px rgba(5,150,105,0.4)',
                }}
              >
                <span className="relative z-10">Know More</span>
                <span className="animate-shimmer absolute inset-0 rounded-xl" />
              </button>

              <button
                onClick={onAllActivities ?? (() => navigate('/activities'))}
                className="glass-gold px-8 py-4 rounded-xl font-semibold text-base text-yellow-300 hover:bg-yellow-400/15 transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              >
                All Activities
              </button>
            </div>

            {/* Stats row */}
            <div className="mt-14 flex gap-8 justify-center lg:justify-start">
              {[
                { value: '5×', label: 'Daily Prayers' },
                { value: '10+', label: 'Activities' },
                { value: '∞', label: 'Blessings' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-gradient-gold">{stat.value}</p>
                  <p className="text-xs text-emerald-200/50 uppercase tracking-wider mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — decorative arch */}
          <div className="hidden lg:flex items-center justify-center animate-float">
            <div className="relative w-full max-w-sm">
              {/* Glow behind arch */}
              <div
                className="absolute inset-0 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.2) 0%, transparent 70%)' }}
                aria-hidden="true"
              />
              <MosqueArch />
              {/* Floating label */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 text-xs text-yellow-300/80 whitespace-nowrap">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={handleScrollDown}
        aria-label="Scroll to prayer times"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-emerald-300/50 hover:text-emerald-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-full p-1"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(10,26,15,0.8))',
        }}
        aria-hidden="true"
      />
    </section>
  );
}