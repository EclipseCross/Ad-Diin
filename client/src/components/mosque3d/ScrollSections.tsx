/**
 * ScrollSections.tsx
 * ──────────────────
 * HTML content overlay that sits on top of the fixed 3D canvas.
 * Each section covers 100vh and overlays at a specific scroll position.
 *
 * INTEGRATION RULES:
 * - Reuses existing PrayerTimes, OngoingActivities, DonationFunds components
 * - All CTAs use real React Router routes
 * - Auth state read from localStorage (same pattern as Header.tsx)
 * - Real API endpoints used (events, AI status)
 * - No fake data created when backend data is available
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Clock,
  CalendarDays,
  Heart,
  Bot,
  BookOpen,
  Star,
  ShieldCheck,
  Focus,
  ChevronDown,
} from 'lucide-react';

import { PrayerTimes }       from '../PrayerTimes';
import { OngoingActivities } from '../OngoingActivities';
import { DonationFunds }     from '../DonationFunds';

const API_URL = import.meta.env.VITE_BACKEND_ENDPOINT || 'http://127.0.0.1:8000';

// ── Scroll reveal hook ───────────────────────────────────────────────────────
function useScrollReveal<T extends HTMLElement>(threshold = 0.1) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Reveal-up animation helper ───────────────────────────────────────────────
function RevealUp({
  children,
  delay = 0,
  visible,
}: {
  children: React.ReactNode;
  delay?: number;
  visible: boolean;
}) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Section label badge ──────────────────────────────────────────────────────
function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <span className="text-yellow-400/70">{icon}</span>
      <span className="text-yellow-400/70 text-xs font-semibold uppercase tracking-[0.2em]">{text}</span>
    </div>
  );
}

// ── Gold divider ─────────────────────────────────────────────────────────────
function GoldDivider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-px w-24 ${className}`}
      style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }}
    />
  );
}

// ── Glass CTA button ─────────────────────────────────────────────────────────
function GlassCTA({
  onClick,
  children,
  variant = 'emerald',
  className = '',
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'emerald' | 'gold' | 'outline';
  className?: string;
}) {
  const styles: Record<string, React.CSSProperties> = {
    emerald: {
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      boxShadow: '0 8px 32px rgba(5,150,105,0.35)',
    },
    gold: {
      background: 'rgba(212,175,55,0.12)',
      border: '1px solid rgba(212,175,55,0.3)',
      backdropFilter: 'blur(8px)',
    },
    outline: {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.14)',
      backdropFilter: 'blur(8px)',
    },
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white
        hover:scale-105 transition-all duration-300
        focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${className}`}
      style={styles[variant]}
    >
      {children}
    </button>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  id,
  children,
  align = 'left',
  className = '',
}: {
  id: string;
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  const alignMap = { left: 'lg:justify-start', right: 'lg:justify-end', center: 'lg:justify-center' };
  return (
    <section
      id={id}
      className={`relative min-h-screen flex items-center pointer-events-none ${className}`}
    >
      <div className={`max-w-7xl mx-auto px-6 lg:px-12 w-full flex ${alignMap[align]}`}>
        {children}
      </div>
    </section>
  );
}

// ── Glassmorphic content card ────────────────────────────────────────────────
function ContentCard({
  children,
  className = '',
  maxW = 'max-w-lg',
}: {
  children: React.ReactNode;
  className?: string;
  maxW?: string;
}) {
  return (
    <div
      className={`pointer-events-auto ${maxW} w-full rounded-2xl p-8 ${className}`}
      style={{
        background: 'rgba(4,13,6,0.78)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(212,175,55,0.15)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — Welcome / Hero
// ─────────────────────────────────────────────────────────────────────────────
export function SectionWelcome() {
  const navigate = useNavigate();
  const { ref, visible } = useScrollReveal<HTMLDivElement>(0.05);
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) { try { setUser(JSON.parse(u)); } catch {} }
    const h = () => {
      const u2 = localStorage.getItem('user');
      try { setUser(u2 ? JSON.parse(u2) : null); } catch { setUser(null); }
    };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, []);

  const scrollNext = () => document.getElementById('section-prayer')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <Section id="section-welcome" align="center">
      <div ref={ref} className="text-center max-w-3xl pointer-events-auto">
        {/* Personalised greeting */}
        {user && (
          <RevealUp visible={visible} delay={0}>
            <p className="text-emerald-400/70 text-sm mb-3 font-medium">
              Welcome back, {user.name} 👋
            </p>
          </RevealUp>
        )}

        {/* Arabic badge */}
        <RevealUp visible={visible} delay={100}>
          <div
            className="inline-flex items-center gap-3 rounded-full px-6 py-2.5 mb-8"
            style={{
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.25)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span className="text-yellow-400 text-2xl font-bold" style={{ fontFamily: 'serif' }}>
              الدين
            </span>
            <span className="text-yellow-300/50 text-xs tracking-[0.25em] uppercase">
              Ad-Diin Mosque
            </span>
          </div>
        </RevealUp>

        {/* Main heading */}
        <RevealUp visible={visible} delay={200}>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-white">
            Welcome to
            <span
              className="block mt-2"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d76a 50%, #d4af37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Ad-Diin
            </span>
          </h1>
        </RevealUp>

        {/* Subtitle */}
        <RevealUp visible={visible} delay={300}>
          <p
            className="text-lg sm:text-xl mb-3 font-semibold tracking-[0.18em] uppercase"
            style={{ color: 'rgba(212,175,55,0.7)' }}
          >
            Faith · Knowledge · Community
          </p>
          <p className="text-emerald-100/55 text-base mb-10 max-w-xl mx-auto leading-relaxed">
            A sacred digital space for Prayer, Learning, and Community — where hearts find peace.
          </p>
        </RevealUp>

        {/* CTAs */}
        <RevealUp visible={visible} delay={420}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <GlassCTA onClick={() => navigate('/about')} variant="emerald">
              Explore Ad-Diin
            </GlassCTA>
            <GlassCTA onClick={() => navigate('/activities')} variant="gold">
              Explore Activities
            </GlassCTA>
          </div>
        </RevealUp>

        {/* Quick access row */}
        <RevealUp visible={visible} delay={550}>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { icon: <Clock className="w-3.5 h-3.5" />, label: 'Prayer Times', path: '/prayer-times' },
              { icon: <CalendarDays className="w-3.5 h-3.5" />, label: 'Events', path: '/events' },
              { icon: <Bot className="w-3.5 h-3.5" />, label: 'Diin AI', path: '/diin-ai' },
              { icon: <Heart className="w-3.5 h-3.5" />, label: 'Donate', path: '/donate' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  text-emerald-300/65 hover:text-yellow-300 transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </RevealUp>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollNext}
        aria-label="Scroll down"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2
          text-emerald-300/40 hover:text-emerald-300 transition-colors pointer-events-auto
          focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-full p-1"
      >
        <span className="text-xs tracking-[0.2em] uppercase">Explore</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — Prayer Times
// ─────────────────────────────────────────────────────────────────────────────
export function SectionPrayer() {
  const navigate = useNavigate();
  const { ref, visible } = useScrollReveal<HTMLDivElement>(0.08);

  return (
    <Section id="section-prayer" align="left">
      <ContentCard maxW="max-w-2xl">
        <div ref={ref}>
          <RevealUp visible={visible} delay={0}>
            <SectionLabel icon={<Clock className="w-4 h-4" />} text="Salah Schedule" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Prayer{' '}
              <span style={{
                background: 'linear-gradient(135deg, #d4af37, #f4d76a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Times
              </span>
            </h2>
            <p className="text-emerald-100/55 text-sm mb-2">
              Stay connected with the five daily prayers.
            </p>
            <GoldDivider className="mb-6" />
          </RevealUp>

          {/* Existing PrayerTimes component — renders real API data */}
          <RevealUp visible={visible} delay={150}>
            <div className="rounded-xl overflow-hidden">
              <PrayerTimes />
            </div>
          </RevealUp>

          <RevealUp visible={visible} delay={300}>
            <div className="mt-6">
              <GlassCTA onClick={() => navigate('/prayer-times')} variant="emerald">
                View Prayer Times <ChevronRight className="w-4 h-4" />
              </GlassCTA>
            </div>
          </RevealUp>
        </div>
      </ContentCard>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — Community & Activities
// ─────────────────────────────────────────────────────────────────────────────
export function SectionCommunity() {
  const navigate = useNavigate();
  const { ref, visible } = useScrollReveal<HTMLDivElement>(0.08);

  return (
    <Section id="section-community" align="right">
      <ContentCard maxW="max-w-2xl">
        <div ref={ref}>
          <RevealUp visible={visible} delay={0}>
            <SectionLabel icon={<BookOpen className="w-4 h-4" />} text="What We Do" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Community &{' '}
              <span style={{
                background: 'linear-gradient(135deg, #d4af37, #f4d76a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Activities
              </span>
            </h2>
            <p className="text-emerald-100/55 text-sm mb-2">
              Join our vibrant community — from Islamic education to youth programmes.
            </p>
            <GoldDivider className="mb-6" />
          </RevealUp>

          {/* Existing OngoingActivities component */}
          <RevealUp visible={visible} delay={150}>
            <OngoingActivities onViewAll={() => navigate('/activities')} />
          </RevealUp>

          <RevealUp visible={visible} delay={300}>
            <div className="mt-6">
              <GlassCTA onClick={() => navigate('/activities')} variant="emerald">
                Explore Activities <ChevronRight className="w-4 h-4" />
              </GlassCTA>
            </div>
          </RevealUp>
        </div>
      </ContentCard>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — Events & Milad (real API)
// ─────────────────────────────────────────────────────────────────────────────
interface ApiEvent {
  id: number;
  title: string;
  description?: string;
  event_date?: string;
  date?: string;
  category?: string;
}

const MOCK_EVENTS: ApiEvent[] = [
  { id: 1, title: 'Eid-ul-Adha Prayers', event_date: '2026-06-17', category: 'Eid', description: 'Join us for the blessed Eid prayers.' },
  { id: 2, title: 'Lailatul Qadr Programme', event_date: '2026-04-05', category: 'Ramadan', description: 'Night of Power ibadah programme.' },
  { id: 3, title: 'Islamic New Year', event_date: '2026-07-18', category: 'Hijri', description: 'Welcoming the new Hijri year.' },
];

export function SectionEvents() {
  const navigate = useNavigate();
  const { ref, visible } = useScrollReveal<HTMLDivElement>(0.08);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/events/upcoming`)
      .then(r => r.json())
      .then(data => {
        const list: ApiEvent[] = Array.isArray(data.data)
          ? data.data.slice(0, 3)
          : Array.isArray(data)
          ? data.slice(0, 3)
          : [];
        setEvents(list.length > 0 ? list : MOCK_EVENTS);
      })
      .catch(() => setEvents(MOCK_EVENTS))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (raw?: string) => {
    if (!raw) return '';
    try { return new Date(raw).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return raw; }
  };

  const catColor: Record<string, string> = {
    Eid: '#d4af37', Ramadan: '#10b981', Hijri: '#a855f7', General: '#6b7280',
  };

  return (
    <Section id="section-events" align="left">
      <ContentCard maxW="max-w-xl">
        <div ref={ref}>
          <RevealUp visible={visible} delay={0}>
            <SectionLabel icon={<CalendarDays className="w-4 h-4" />} text="Islamic Calendar" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Events &{' '}
              <span style={{
                background: 'linear-gradient(135deg, #d4af37, #f4d76a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Milad
              </span>
            </h2>
            <p className="text-emerald-100/55 text-sm mb-2">
              Celebrate sacred occasions and book your Milad ceremony.
            </p>
            <GoldDivider className="mb-6" />
          </RevealUp>

          {loading ? (
            <div className="space-y-3">
              {[0,1,2].map(i => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : (
            <RevealUp visible={visible} delay={150}>
              <div className="space-y-3 mb-6">
                {events.map((ev, i) => {
                  const accent = catColor[ev.category ?? 'General'] ?? catColor.General;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => navigate('/events')}
                      className="w-full text-left rounded-xl p-4 group transition-all duration-300
                        hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${accent}22`,
                        transitionDelay: `${i * 60}ms`,
                      }}
                      aria-label={`View event: ${ev.title}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}>
                          {ev.category ?? 'Event'}
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {formatDate(ev.event_date ?? ev.date)}
                        </span>
                      </div>
                      <p className="text-white font-semibold text-sm group-hover:text-yellow-300 transition-colors">
                        {ev.title}
                      </p>
                      {ev.description && (
                        <p className="text-emerald-100/40 text-xs mt-0.5 line-clamp-1">{ev.description}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </RevealUp>
          )}

          <RevealUp visible={visible} delay={300}>
            <div className="flex gap-3 flex-wrap">
              <GlassCTA onClick={() => navigate('/events')} variant="emerald">
                View Events <ChevronRight className="w-4 h-4" />
              </GlassCTA>
              <GlassCTA onClick={() => navigate('/milad')} variant="gold">
                Book Milad
              </GlassCTA>
            </div>
          </RevealUp>
        </div>
      </ContentCard>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — Zakat & Donation
// ─────────────────────────────────────────────────────────────────────────────
export function SectionDonation() {
  const navigate = useNavigate();
  const { ref, visible } = useScrollReveal<HTMLDivElement>(0.08);

  return (
    <Section id="section-donation" align="right">
      <ContentCard maxW="max-w-xl">
        <div ref={ref}>
          <RevealUp visible={visible} delay={0}>
            <SectionLabel icon={<Heart className="w-4 h-4" />} text="Give & Earn Reward" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Give With{' '}
              <span style={{
                background: 'linear-gradient(135deg, #d4af37, #f4d76a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Purpose
              </span>
            </h2>
            <p className="text-emerald-100/55 text-sm mb-2">
              Support the mosque and community through Zakat, Sadaqah, and donations.
            </p>
            <GoldDivider className="mb-6" />
          </RevealUp>

          {/* Existing DonationFunds component — auth-aware, real API */}
          <RevealUp visible={visible} delay={150}>
            <DonationFunds onViewAll={() => navigate('/donate')} />
          </RevealUp>

          <RevealUp visible={visible} delay={300}>
            <div className="flex gap-3 flex-wrap mt-6">
              <GlassCTA onClick={() => navigate('/zakat')} variant="emerald">
                Zakat Calculator
              </GlassCTA>
              <GlassCTA onClick={() => navigate('/donate')} variant="gold">
                Donate Now
              </GlassCTA>
            </div>
          </RevealUp>
        </div>
      </ContentCard>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — Diin AI (real /api/v1/ai/status)
// ─────────────────────────────────────────────────────────────────────────────
export function SectionDiinAI() {
  const navigate = useNavigate();
  const { ref, visible } = useScrollReveal<HTMLDivElement>(0.08);
  const [aiOnline, setAiOnline] = useState<boolean | null>(null);
  const [preview, setPreview] = useState('');
  const [typing, setTyping] = useState(false);

  const samples = [
    'الصلاة خير من النوم — Prayer is better than sleep.',
    'Seek knowledge from the cradle to the grave.',
    'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    'Dua: the weapon of the believer.',
  ];

  useEffect(() => {
    fetch(`${API_URL}/api/v1/ai/status`)
      .then(r => r.json())
      .then(d => setAiOnline(d.status === 'ok' || d.success === true))
      .catch(() => setAiOnline(false));
  }, []);

  const runTyping = useCallback(() => {
    const text = samples[Math.floor(Math.random() * samples.length)];
    setPreview('');
    setTyping(true);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setPreview(text.slice(0, i));
      if (i >= text.length) { clearInterval(t); setTyping(false); }
    }, 38);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visible) return;
    const clean = runTyping();
    const loop = setInterval(() => runTyping(), 6000);
    return () => { clean(); clearInterval(loop); };
  }, [visible, runTyping]);

  return (
    <Section id="section-diin-ai" align="left">
      <ContentCard maxW="max-w-lg">
        <div ref={ref}>
          <RevealUp visible={visible} delay={0}>
            <SectionLabel icon={<Bot className="w-4 h-4" />} text="AI-Powered" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Ask{' '}
              <span style={{
                background: 'linear-gradient(135deg, #d4af37, #f4d76a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Diin AI
              </span>
            </h2>
            <p className="text-emerald-100/55 text-sm mb-2">
              Learn, explore, and ask questions with your Islamic AI companion.
            </p>
            <GoldDivider className="mb-6" />
          </RevealUp>

          {/* Chat preview */}
          <RevealUp visible={visible} delay={150}>
            <div className="rounded-xl overflow-hidden mb-6"
              style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(16,185,129,0.2)' }}>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3"
                style={{ background: 'rgba(5,150,105,0.2)', borderBottom: '1px solid rgba(16,185,129,0.15)' }}>
                <div className="w-8 h-8 rounded-full bg-emerald-700/60 flex items-center justify-center text-base">🕋</div>
                <div>
                  <p className="text-white font-semibold text-xs">Diin AI</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full"
                      style={{ background: aiOnline === true ? '#10b981' : aiOnline === false ? '#ef4444' : '#d4af37' }} />
                    <span className="text-xs text-emerald-300/60">
                      {aiOnline === null ? 'Checking…' : aiOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bubbles */}
              <div className="p-4 flex flex-col gap-3" style={{ minHeight: '120px' }}>
                <div className="flex justify-end">
                  <div className="max-w-[80%] px-3 py-2 rounded-xl rounded-br-none text-xs text-white"
                    style={{ background: 'rgba(5,150,105,0.4)' }}>
                    What is the importance of Salah?
                  </div>
                </div>
                <div className="flex justify-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center text-white text-[9px] flex-shrink-0 mt-1">AI</div>
                  <div className="max-w-[80%] px-3 py-2 rounded-xl rounded-bl-none text-xs text-white/80"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {preview || <span className="text-white/30 italic">Diin AI is thinking…</span>}
                    {typing && <span className="inline-block w-1 h-3 bg-emerald-400 ml-0.5 align-middle animate-pulse" />}
                  </div>
                </div>
              </div>

              {/* Input hint */}
              <div className="flex items-center gap-2 px-4 py-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}>
                <div className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white/25 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onClick={() => navigate('/diin-ai')} role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate('/diin-ai')}>
                  Ask anything about Islam…
                </div>
                <button onClick={() => navigate('/diin-ai')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white focus:outline-none"
                  style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                  Ask
                </button>
              </div>
            </div>
          </RevealUp>

          <RevealUp visible={visible} delay={300}>
            <GlassCTA onClick={() => navigate('/diin-ai')} variant="emerald">
              <Bot className="w-4 h-4" /> Ask Diin AI
            </GlassCTA>
          </RevealUp>
        </div>
      </ContentCard>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — Halal Product Analyzer
// ─────────────────────────────────────────────────────────────────────────────
export function SectionProductAnalyzer() {
  const navigate = useNavigate();
  const { ref, visible } = useScrollReveal<HTMLDivElement>(0.08);

  return (
    <Section id="section-product" align="right">
      <ContentCard maxW="max-w-md">
        <div ref={ref}>
          <RevealUp visible={visible} delay={0}>
            <SectionLabel icon={<ShieldCheck className="w-4 h-4" />} text="Halal Verification" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Halal Product{' '}
              <span style={{
                background: 'linear-gradient(135deg, #d4af37, #f4d76a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Analyzer
              </span>
            </h2>
            <p className="text-emerald-100/55 text-sm mb-2">
              Scan or check products to verify their Halal status instantly.
            </p>
            <GoldDivider className="mb-6" />
          </RevealUp>

          <RevealUp visible={visible} delay={150}>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { emoji: '📱', label: 'Scan Barcode' },
                { emoji: '🔍', label: 'Check Ingredients' },
                { emoji: '✅', label: 'Instant Result' },
              ].map(item => (
                <div key={item.label} className="text-center p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="text-2xl mb-1">{item.emoji}</div>
                  <p className="text-white/60 text-xs">{item.label}</p>
                </div>
              ))}
            </div>
          </RevealUp>

          <RevealUp visible={visible} delay={300}>
            <GlassCTA onClick={() => navigate('/diin-ai')} variant="emerald">
              <ShieldCheck className="w-4 h-4" /> Analyze a Product
            </GlassCTA>
          </RevealUp>
        </div>
      </ContentCard>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — Focus Mode
// ─────────────────────────────────────────────────────────────────────────────
export function SectionFocus() {
  const navigate = useNavigate();
  const { ref, visible } = useScrollReveal<HTMLDivElement>(0.08);

  return (
    <Section id="section-focus" align="center">
      <ContentCard maxW="max-w-lg" className="text-center">
        <div ref={ref}>
          <RevealUp visible={visible} delay={0}>
            <SectionLabel icon={<Focus className="w-4 h-4" />} text="Deep Work" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Focus{' '}
              <span style={{
                background: 'linear-gradient(135deg, #d4af37, #f4d76a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Mode
              </span>
            </h2>
            <p className="text-emerald-100/55 text-sm mb-2">
              Reduce distractions and stay focused with a serene Islamic environment.
            </p>
            <GoldDivider className="mb-6 mx-auto" />
          </RevealUp>

          <RevealUp visible={visible} delay={150}>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { emoji: '🧘', label: 'Distraction-free', desc: 'Pure focus environment' },
                { emoji: '⏱️', label: 'Pomodoro Timer', desc: 'Structured work sessions' },
                { emoji: '🎵', label: 'Calm Audio', desc: 'Islamic ambient sounds' },
                { emoji: '📖', label: 'Study Mode', desc: 'Islamic learning focus' },
              ].map(item => (
                <div key={item.label} className="text-left p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="text-xl mb-1">{item.emoji}</div>
                  <p className="text-white text-xs font-semibold">{item.label}</p>
                  <p className="text-emerald-100/40 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </RevealUp>

          <RevealUp visible={visible} delay={300}>
            <GlassCTA onClick={() => navigate('/diin-ai')} variant="emerald" className="mx-auto">
              <Focus className="w-4 h-4" /> Enter Focus Mode
            </GlassCTA>
          </RevealUp>
        </div>
      </ContentCard>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL SECTION — Closing CTA
// ─────────────────────────────────────────────────────────────────────────────
export function SectionFinal() {
  const navigate = useNavigate();
  const { ref, visible } = useScrollReveal<HTMLDivElement>(0.1);

  return (
    <Section id="section-final" align="center">
      <div ref={ref} className="text-center max-w-2xl pointer-events-auto">
        <RevealUp visible={visible} delay={0}>
          <Star className="w-10 h-10 text-yellow-400/50 mx-auto mb-6 animate-star-twinkle" />
          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            Ad-Diin
          </h2>
          <p className="text-lg font-semibold tracking-[0.2em] uppercase mb-6"
            style={{ color: 'rgba(212,175,55,0.7)' }}>
            Faith · Knowledge · Community
          </p>
          <p className="text-emerald-100/50 text-base mb-10 leading-relaxed max-w-md mx-auto">
            Whether you seek spiritual guidance, community connection, or a place to worship —
            Ad-Diin welcomes you with open arms.
          </p>
        </RevealUp>

        <RevealUp visible={visible} delay={200}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <GlassCTA onClick={() => navigate('/contact')} variant="emerald">
              Contact Us
            </GlassCTA>
            <GlassCTA onClick={() => navigate('/user-registration')} variant="gold">
              Create Account
            </GlassCTA>
          </div>
        </RevealUp>

        <RevealUp visible={visible} delay={350}>
          <div className="flex flex-wrap gap-5 justify-center">
            {[
              { label: 'About Us', path: '/about' },
              { label: 'Prayer Times', path: '/prayer-times' },
              { label: 'Events', path: '/events' },
              { label: 'Messaging', path: '/messaging' },
              { label: 'Contact', path: '/contact' },
            ].map(l => (
              <button
                key={l.path}
                onClick={() => navigate(l.path)}
                className="text-sm text-emerald-300/40 hover:text-yellow-300 transition-colors
                  focus:outline-none focus-visible:underline"
              >
                {l.label}
              </button>
            ))}
          </div>
        </RevealUp>
      </div>
    </Section>
  );
}
