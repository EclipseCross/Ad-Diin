import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Coffee, Users, TreePine,
  Beef, Home, Droplets, Gift,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

interface DonationCategory {
  id: string;
  title: string;
  titleBn: string;
  descriptionBn: string;
  icon: React.ReactNode;
  accentColor: string;
  minAmount?: number;
}

const CATEGORIES: DonationCategory[] = [
  { id: 'zakat',     title: 'Zakat',           titleBn: 'যাকাত',         descriptionBn: 'আপনার যাকাত দিয়ে দরিদ্রদের সহায়তা করুন',      icon: <Heart className="w-7 h-7" />,    accentColor: '#10b981', minAmount: 100 },
  { id: 'iftar',     title: 'Iftar',            titleBn: 'ইফতার',         descriptionBn: 'রমজানে রোজাদারদের ইফতার করান',                 icon: <Coffee className="w-7 h-7" />,   accentColor: '#f59e0b', minAmount: 50  },
  { id: 'durjog',    title: 'Disaster Relief',  titleBn: 'দুর্গত',        descriptionBn: 'প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্তদের সহায়তা',    icon: <Home className="w-7 h-7" />,     accentColor: '#ef4444', minAmount: 100 },
  { id: 'sitarto',   title: 'Winter Clothes',   titleBn: 'শীতার্ত',       descriptionBn: 'শীতার্তদের শীতবস্ত্র দিন',                      icon: <Droplets className="w-7 h-7" />, accentColor: '#3b82f6', minAmount: 50  },
  { id: 'gachropon', title: 'Tree Plantation',  titleBn: 'গাছরোপণ',       descriptionBn: 'সবুজ ভবিষ্যতের জন্য গাছ লাগান',                icon: <TreePine className="w-7 h-7" />, accentColor: '#22c55e', minAmount: 20  },
  { id: 'kurbani',   title: 'Qurbani',          titleBn: 'কুরবানি',       descriptionBn: 'আপনার কুরবানি আমাদের সাথে সম্পন্ন করুন',       icon: <Beef className="w-7 h-7" />,     accentColor: '#d97706', minAmount: 500 },
  { id: 'orphan',    title: 'Orphan Care',      titleBn: 'এতিম',          descriptionBn: 'এতিম শিশুদের সহায়তা করুন',                     icon: <Users className="w-7 h-7" />,    accentColor: '#a855f7', minAmount: 100 },
  { id: 'general',   title: 'General Donation', titleBn: 'সাধারণ অনুদান', descriptionBn: 'আমাদের সাধারণ কল্যাণমূলক কাজে সহায়তা করুন', icon: <Gift className="w-7 h-7" />,     accentColor: '#6b7280', minAmount: 50  },
];

function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function useVisibleCount() {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const calc = () => {
      if (window.innerWidth < 640)  setCount(1);
      else if (window.innerWidth < 1024) setCount(2);
      else setCount(3);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return count;
}

interface DonationFundsProps {
  onViewAll?: () => void;
}

export function DonationFunds({ onViewAll }: DonationFundsProps) {
  const navigate = useNavigate();
  const sectionRef = useScrollReveal<HTMLElement>();
  const visibleCount = useVisibleCount();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isAuto, setIsAuto] = useState(true);
  const maxIdx = CATEGORIES.length - visibleCount;

  const goNext = useCallback(() => {
    setCurrentIdx((i) => (i >= maxIdx ? 0 : i + 1));
  }, [maxIdx]);

  const goPrev = useCallback(() => {
    setCurrentIdx((i) => (i === 0 ? maxIdx : i - 1));
  }, [maxIdx]);

  // Auto-play
  useEffect(() => {
    if (!isAuto) return;
    const t = setInterval(goNext, 3500);
    return () => clearInterval(t);
  }, [isAuto, goNext]);

  const handleManualPrev = () => { setIsAuto(false); goPrev(); };
  const handleManualNext = () => { setIsAuto(false); goNext(); };

  const handleFundClick = (fund: DonationCategory) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/user-login', { state: { from: '/donate' } });
      return;
    }
    navigate('/donate', { state: { selectedCategory: fund.id, showPayment: true } });
  };

  const visible = CATEGORIES.slice(currentIdx, currentIdx + visibleCount);

  return (
    <section
      ref={sectionRef}
      className="section-reveal py-20"
      style={{ background: 'linear-gradient(180deg, #0d2416 0%, #0a1a0f 50%, #071509 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-yellow-400/70 text-sm uppercase tracking-widest mb-2">
              Give & Earn Reward
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Donation{' '}
              <span className="text-gradient-gold">Funds</span>
            </h2>
          </div>
          <button
            onClick={onViewAll ?? (() => navigate('/donate'))}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Prev arrow */}
          <button
            onClick={handleManualPrev}
            aria-label="Previous donation fund"
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <ChevronLeft className="w-5 h-5 text-yellow-400" />
          </button>

          {/* Next arrow */}
          <button
            onClick={handleManualNext}
            aria-label="Next donation fund"
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <ChevronRight className="w-5 h-5 text-yellow-400" />
          </button>

          {/* Cards */}
          <div
            className={`grid gap-5 transition-all duration-500 ${
              visibleCount === 1 ? 'grid-cols-1'
              : visibleCount === 2 ? 'grid-cols-2'
              : 'grid-cols-3'
            }`}
          >
            {visible.map((fund, idx) => (
              <button
                key={fund.id}
                onClick={() => handleFundClick(fund)}
                className="group relative text-left rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  transitionDelay: `${idx * 60}ms`,
                }}
                aria-label={`Donate to ${fund.title} — minimum ৳${fund.minAmount}`}
              >
                {/* Accent glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at top left, ${fund.accentColor}12 0%, transparent 60%)`,
                  }}
                  aria-hidden="true"
                />
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${fund.accentColor}60, transparent)` }}
                  aria-hidden="true"
                />

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${fund.accentColor}18`, border: `1px solid ${fund.accentColor}30`, color: fund.accentColor }}
                >
                  {fund.icon}
                </div>

                <h3 className="text-white font-bold text-lg mb-0.5">{fund.title}</h3>
                <p className="text-xs font-medium mb-3" style={{ color: fund.accentColor }}>{fund.titleBn}</p>
                <p className="text-emerald-100/50 text-sm leading-relaxed mb-5">{fund.descriptionBn}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/30">ন্যূনতম: ৳{fund.minAmount}</span>
                  <span
                    className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                    style={{
                      background: `${fund.accentColor}20`,
                      color: fund.accentColor,
                      border: `1px solid ${fund.accentColor}30`,
                    }}
                  >
                    দান করুন →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: maxIdx + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setIsAuto(false); setCurrentIdx(i); }}
              aria-label={`Go to slide ${i + 1}`}
              className="h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              style={{
                width: i === currentIdx ? '2rem' : '0.375rem',
                background: i === currentIdx ? '#d4af37' : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>

        {/* Auto-play progress bar */}
        {isAuto && (
          <div className="w-full h-px mt-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((currentIdx + 1) / (maxIdx + 1)) * 100}%`,
                background: 'linear-gradient(90deg, #059669, #d4af37)',
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}