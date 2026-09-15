import { useNavigate } from 'react-router-dom';

const QUICK_LINKS = [
  { label: 'Prayer Times', path: '/prayer-times' },
  { label: 'Activities',   path: '/activities'   },
  { label: 'Events',       path: '/events'        },
  { label: 'Donate',       path: '/donate'        },
  { label: 'Diin AI',      path: '/diin-ai'       },
  { label: 'Contact',      path: '/contact'       },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy',    href: '#' },
  { label: 'Terms & Conditions', href: '#' },
];

// Simple SVG social icons
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95 29 29 0 0 0 .46-5.29 29 29 0 0 0-.46-5.44z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />
    </svg>
  );
}

// Decorative Islamic geometric SVG
function FooterPattern() {
  return (
    <svg
      className="absolute right-0 top-0 h-full w-auto opacity-5 pointer-events-none select-none"
      viewBox="0 0 200 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {[80, 200, 320].map((cy) =>
        [0, 45, 90, 135].map((deg) => {
          const r = (deg * Math.PI) / 180;
          return (
            <line
              key={`${cy}-${deg}`}
              x1={100 + 70 * Math.cos(r)}
              y1={cy  + 70 * Math.sin(r)}
              x2={100 - 70 * Math.cos(r)}
              y2={cy  - 70 * Math.sin(r)}
              stroke="#d4af37"
              strokeWidth="1"
            />
          );
        })
      )}
      {[80, 200, 320].map((cy) => (
        <circle key={cy} cx="100" cy={cy} r="70" stroke="#d4af37" strokeWidth="1" fill="none" />
      ))}
    </svg>
  );
}

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #071509 0%, #050e06 100%)',
        borderTop: '1px solid rgba(212,175,55,0.12)',
      }}
    >
      <FooterPattern />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">

        {/* ── Top grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="px-3 py-1.5 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 2px 12px rgba(5,150,105,0.35)' }}
              >
                <span className="text-white text-xl font-bold" style={{ fontFamily: 'serif' }}>الدين</span>
              </div>
              <span className="text-white text-xl font-bold tracking-wide">Ad-Diin</span>
            </div>
            <p className="text-emerald-100/40 text-sm leading-relaxed max-w-xs">
              A sacred place of Prayer, Learning, and Community Service — where
              faith meets compassion and hearts find peace.
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              {[
                { href: 'https://facebook.com', label: 'Facebook', Icon: FacebookIcon, color: '#1877f2' },
                { href: 'https://youtube.com',  label: 'YouTube',  Icon: YoutubeIcon,  color: '#ff0000' },
              ].map(({ href, label, Icon, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = color; (e.currentTarget as HTMLElement).style.borderColor = color + '60'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-emerald-100/40 hover:text-yellow-300 text-sm transition-colors duration-200 focus:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              Legal
            </h3>
            <ul className="flex flex-col gap-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-emerald-100/40 hover:text-yellow-300 text-sm transition-colors duration-200 focus:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Donate CTA */}
            <div className="mt-8">
              <button
                onClick={() => navigate('/donate')}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                style={{
                  background: 'linear-gradient(135deg, rgba(5,150,105,0.4), rgba(212,175,55,0.2))',
                  border: '1px solid rgba(212,175,55,0.25)',
                }}
              >
                💝 Donate Now
              </button>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          className="h-px mb-6"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)' }}
        />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-emerald-100/25 text-xs text-center sm:text-left">
            Copyright © {new Date().getFullYear()} Ad-Diin Mosque. All rights reserved.
          </p>
          <p className="text-emerald-100/15 text-xs">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      </div>
    </footer>
  );
}