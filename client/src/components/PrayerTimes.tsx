import { useState, useEffect, useRef } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_ENDPOINT || 'http://127.0.0.1:8000';

interface JamaatPrayer {
  id: number;
  name: string;
  name_bn: string;
  time: string;
  timeValue: number;
}

// Mock data shown when API is unavailable — easy to remove when real data flows
const MOCK_PRAYERS: JamaatPrayer[] = [
  { id: 1, name: 'Fajr',    name_bn: 'ফজর',   time: '5:15 AM',  timeValue: 315  },
  { id: 2, name: 'Dhuhr',   name_bn: 'জোহর',  time: '1:30 PM',  timeValue: 810  },
  { id: 3, name: 'Asr',     name_bn: 'আসর',   time: '4:45 PM',  timeValue: 1005 },
  { id: 4, name: 'Maghrib', name_bn: 'মাগরিব', time: '6:30 PM',  timeValue: 1110 },
  { id: 5, name: 'Isha',    name_bn: 'এশা',   time: '8:00 PM',  timeValue: 1200 },
];

// Islamic prayer icons (SVG crescents / silhouettes)
function PrayerIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    Fajr:    'M12 3a9 9 0 1 0 9 9 7 7 0 1 1-9-9z', // crescent-like
    Dhuhr:   'M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z',
    Asr:     'M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2',
    Maghrib: 'M17.75 4.09l-2.53 1.94.91 3.06-2.63-1.81-2.63 1.81.91-3.06-2.53-1.94 3.17-.09L12 1l1.38 2.91 3.37.18z',
    Isha:    'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  };
  const d = icons[name] ?? icons.Fajr;
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export function PrayerTimes() {
  const [prayers, setPrayers] = useState<JamaatPrayer[]>([]);
  const [upcoming, setUpcoming] = useState<JamaatPrayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();
  const sectionRef = useScrollReveal<HTMLElement>();

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

interface ApiPrayer {
  id: number;
  time: string;
  display_name_en: string;
  display_name_bn: string;
}

  useEffect(() => {
    fetch(`${API_URL}/api/v1/prayer-times`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const parsed: JamaatPrayer[] = data.data.fard.jamaat.map((p: ApiPrayer) => {
            const [time, period] = p.time.split(' ');
            let h = Number(time.split(':')[0]);
            const m = Number(time.split(':')[1]);
            if (period === 'PM' && h !== 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;
            return {
              id: p.id,
              name: p.display_name_en.replace(' Jamaat', ''),
              name_bn: p.display_name_bn.replace(' জামাত', ''),
              time: p.time,
              timeValue: h * 60 + m,
            };
          });
          setPrayers(parsed);
          resolveUpcoming(parsed, now);
        } else {
          throw new Error('API returned failure');
        }
        setLoading(false);
      })
      .catch(() => {
        setPrayers(MOCK_PRAYERS);
        resolveUpcoming(MOCK_PRAYERS, now);
        setUsingMock(true);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalculate upcoming whenever `now` or `prayers` changes
  useEffect(() => {
    if (prayers.length) resolveUpcoming(prayers, now);
  }, [now, prayers]);

  function resolveUpcoming(list: JamaatPrayer[], date: Date) {
    const cur = date.getHours() * 60 + date.getMinutes();
    const sorted = [...list].sort((a, b) => a.timeValue - b.timeValue);
    setUpcoming(sorted.find((p) => p.timeValue > cur) ?? sorted[0]);
  }

  const sectionBg = {
    background:
      'linear-gradient(180deg, #0a1a0f 0%, #0d2416 40%, #071509 100%)',
  };

  return (
    <section
      id="prayer-times-section"
      ref={sectionRef}
      className="section-reveal py-20"
      style={sectionBg}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-yellow-400/70 text-sm uppercase tracking-widest mb-2">Salah Times</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              জামাতের{' '}
              <span className="text-gradient-gold">সময়সূচী</span>
            </h2>
          </div>
          <button
            onClick={() => navigate('/prayer-times')}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg"
          >
            সকল ওয়াক্ত <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Upcoming prayer banner */}
        {upcoming && !loading && (
          <div
            className="mb-10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(5,150,105,0.3) 0%, rgba(4,120,87,0.2) 100%)',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            <div className="flex items-center gap-4">
              {/* Pulse ring */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <span
                  className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-30"
                  aria-hidden="true"
                />
                <span className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600/60 text-white">
                  <Clock className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-emerald-300/70 text-xs uppercase tracking-wider">
                  পরবর্তী জামাত
                </p>
                <p className="text-white text-xl font-bold">
                  {upcoming.name_bn}
                  <span className="text-emerald-300 font-normal ml-1 text-base">
                    ({upcoming.name})
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gradient-gold">{upcoming.time}</p>
              <p className="text-emerald-300/50 text-xs mt-0.5">
                {now.toLocaleDateString('en-BD', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        )}

        {/* Prayer cards grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {prayers.map((prayer, idx) => {
              const isNext = upcoming?.id === prayer.id;
              return (
                <div
                  key={prayer.id}
                  className="relative rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    background: isNext
                      ? 'linear-gradient(135deg, rgba(5,150,105,0.35) 0%, rgba(4,120,87,0.25) 100%)'
                      : 'rgba(255,255,255,0.04)',
                    border: isNext
                      ? '1px solid rgba(16,185,129,0.5)'
                      : '1px solid rgba(255,255,255,0.07)',
                    animationDelay: `${idx * 0.1}s`,
                  }}
                  aria-label={`${prayer.name} prayer at ${prayer.time}`}
                >
                  {isNext && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                      Next
                    </span>
                  )}
                  <div className={`flex justify-center mb-3 ${isNext ? 'text-emerald-400' : 'text-yellow-500/60'}`}>
                    <PrayerIcon name={prayer.name} />
                  </div>
                  <h3 className="font-bold text-white text-base">{prayer.name}</h3>
                  <p className="text-emerald-300/60 text-xs mb-3">{prayer.name_bn}</p>
                  <p className={`text-lg font-bold ${isNext ? 'text-gradient-emerald' : 'text-white/80'}`}>
                    {prayer.time}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {usingMock && (
          <p className="text-center text-yellow-500/40 text-xs mt-6">
            * Showing sample times — connect to backend for live data
          </p>
        )}
      </div>
    </section>
  );
}