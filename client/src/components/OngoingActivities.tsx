import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Calendar, Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_ENDPOINT || 'http://127.0.0.1:8000';

interface Activity {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

// Mock data — replace with real API data when available
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 1,
    title: 'Quran Class',
    description: 'Daily Quran recitation and Tajweed classes for all ages — children and adults welcome.',
    category: 'Education',
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    id: 2,
    title: 'Youth Meeting',
    description: 'Weekly gathering for young Muslims — discussions, mentorship, and Islamic learning.',
    category: 'Youth',
    icon: <Users className="w-6 h-6" />,
  },
  {
    id: 3,
    title: 'Community Service',
    description: 'Ongoing charity drives, food distribution, and social welfare initiatives.',
    category: 'Charity',
    icon: <Calendar className="w-6 h-6" />,
  },
];

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
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

interface OngoingActivitiesProps {
  onViewAll?: () => void;
}

interface ApiActivity {
  id?: number;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
}

export function OngoingActivities({ onViewAll }: OngoingActivitiesProps) {
  const navigate = useNavigate();
  const sectionRef = useScrollReveal<HTMLElement>();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/activities?limit=3&status=active`)

      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: Activity[] = data.data.slice(0, 3).map((a: ApiActivity, i: number) => ({
            id: a.id ?? i,
            title: a.title ?? a.name ?? 'Activity',
            description: a.description ?? '',
            category: a.category ?? 'General',
            icon: <BookOpen className="w-6 h-6" />,
          }));
          setActivities(mapped);
        } else {
          throw new Error('no data');
        }
        setLoading(false);
      })
      .catch(() => {
        setActivities(MOCK_ACTIVITIES);
        setUsingMock(true);
        setLoading(false);
      });
  }, []);

  const sectionBg = {
    background:
      'linear-gradient(180deg, #071509 0%, #0a1a0f 50%, #0d2416 100%)',
  };

  // Category badge colors
  const catColor: Record<string, string> = {
    Education: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    Youth:     'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Charity:   'text-purple-400 bg-purple-400/10 border-purple-400/20',
    General:   'text-blue-400 bg-blue-400/10 border-blue-400/20',
  };

  return (
    <section
      ref={sectionRef}
      className="section-reveal py-20"
      style={sectionBg}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-yellow-400/70 text-sm uppercase tracking-widest mb-2">
              What We Do
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ongoing{' '}
              <span className="text-gradient-gold">Activities</span>
            </h2>
          </div>
          <button
            onClick={onViewAll ?? (() => navigate('/activities'))}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 h-52 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activities.map((activity, idx) => (
              <div
                key={activity.id}
                className="group relative rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  transitionDelay: `${idx * 80}ms`,
                }}
                onClick={() => navigate('/activities')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/activities')}
                aria-label={`View ${activity.title} activity`}
              >
                {/* Gold top accent line */}
                <div
                  className="absolute top-0 left-6 right-6 h-px"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)',
                  }}
                  aria-hidden="true"
                />

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-emerald-400 transition-colors group-hover:text-yellow-400"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  {activity.icon}
                </div>

                {/* Category badge */}
                <span
                  className={`inline-block text-xs px-2.5 py-0.5 rounded-full border mb-3 font-medium ${catColor[activity.category] ?? catColor.General}`}
                >
                  {activity.category}
                </span>

                <h3 className="text-white font-bold text-xl mb-2">{activity.title}</h3>
                <p className="text-emerald-100/50 text-sm leading-relaxed">{activity.description}</p>

                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at top left, rgba(16,185,129,0.06) 0%, transparent 60%)',
                  }}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        )}

        {usingMock && (
          <p className="text-center text-yellow-500/40 text-xs mt-6">
            * Showing sample activities — connect to backend for live data
          </p>
        )}
      </div>
    </section>
  );
}