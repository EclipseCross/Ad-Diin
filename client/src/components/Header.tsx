import { User, LogOut, UserPlus, LogIn, Menu, X, Settings, FileText, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_BACKEND_ENDPOINT || 'http://127.0.0.1:8000';

interface AuthUser {
  name: string;
  email: string;
  role?: string;
}

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home',        path: '/' },
    { label: 'Prayer Time', path: '/prayer-times' },
    { label: 'Activities',  path: '/activities' },
    { label: 'Events',      path: '/events' },
    { label: 'Milad',       path: '/milad' },
    { label: 'Zakat',       path: '/zakat' },
    { label: 'Donate',      path: '/donate' },
    { label: 'Diin AI',     path: '/diin-ai' },
    { label: 'Product Analyzer', path: '/product-analyzer' },
    { label: 'Focus Shield', path: '/focus' },
    { label: 'About Us',    path: '/about' },
    { label: 'Contact',     path: '/contact' },
  ];

  // Glassmorphism activates after 60 px scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const checkUserStatus = () => {
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try { setUser(JSON.parse(userData)); }
      catch { localStorage.removeItem('user'); setUser(null); }
    } else {
      setUser(null);
    }
  };

  useEffect(() => { checkUserStatus(); }, [location.pathname]);

  useEffect(() => {
    window.addEventListener('storage', checkUserStatus);
    return () => window.removeEventListener('storage', checkUserStatus);
  }, []);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await fetch(`${API_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsDropdownOpen(false);
      navigate('/');
    }
  };

  // On the home route the hero fills the screen → start with a dark top gradient, solidify on scroll
  const isHome = location.pathname === '/';

  const headerStyle: React.CSSProperties =
    scrolled || !isHome
      ? {
          background: 'rgba(10,26,15,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(212,175,55,0.12)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }
      : {
          // Subtle dark vignette at the top so white text is always readable against the hero
          background: 'linear-gradient(to bottom, rgba(5,14,8,0.75) 0%, transparent 100%)',
        };

  const navBase   = 'text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-sm';
  const navActive = 'text-yellow-400';
  const navIdle   = 'text-white hover:text-yellow-300';

  return (
    <header className="sticky top-0 z-50 transition-all duration-300" style={headerStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <button
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-lg"
            onClick={() => navigate('/')}
            aria-label="Go to home"
          >
            <div
              className="px-3 py-1.5 rounded-lg font-bold text-xl transition-all duration-200 group-hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #059669, #047857)',
                boxShadow: '0 2px 12px rgba(5,150,105,0.35)',
              }}
            >
              <span className="text-white" style={{ fontFamily: 'serif' }}>الدين</span>
            </div>
            <span className="hidden sm:block text-white font-semibold text-lg tracking-wide">
              Ad-Diin
            </span>
          </button>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-5" aria-label="Main navigation">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`${navBase} ${location.pathname === item.path ? navActive : navIdle}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">

            {/* ── User dropdown ── */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="User menu"
                aria-expanded={isDropdownOpen}
                className="relative p-2 rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              >
                <User className="w-5 h-5 text-white/80" />
                {user && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-emerald-400 border border-black/30 rounded-full" />
                )}
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl py-2 z-50"
                  style={{
                    background: 'rgba(10,26,15,0.96)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(212,175,55,0.15)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                  }}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-emerald-300/60 truncate">{user.email}</p>
                        <p className="text-xs text-yellow-400/70 mt-0.5 capitalize">{user.role ?? 'user'}</p>
                      </div>

                      {[
                        { icon: <User className="w-4 h-4" />,     label: 'My Profile',        path: '/user-profile' },
                        { icon: <FileText className="w-4 h-4" />, label: 'My Milad Requests', path: '/my-milad-requests' },
                        { icon: <Heart className="w-4 h-4" />,    label: 'My Donations',      path: '/my-donations' },
                      ].map((item) => (
                        <button
                          key={item.path}
                          onClick={() => { setIsDropdownOpen(false); navigate(item.path); }}
                          className="w-full text-left px-4 py-2 text-sm text-emerald-100/70 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                        >
                          {item.icon} {item.label}
                        </button>
                      ))}

                      {user.role === 'admin' && (
                        <button
                          onClick={() => { setIsDropdownOpen(false); navigate('/admin-dashboard'); }}
                          className="w-full text-left px-4 py-2 text-sm text-purple-400 hover:bg-purple-400/10 flex items-center gap-2 transition-colors"
                        >
                          <Settings className="w-4 h-4" /> Admin Dashboard
                        </button>
                      )}

                      <div className="my-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <p className="text-sm text-emerald-100/50">Welcome to Ad-Diin</p>
                      </div>
                      <button
                        onClick={() => { setIsDropdownOpen(false); navigate('/user-login'); }}
                        className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-emerald-400/10 font-medium flex items-center gap-2 transition-colors"
                      >
                        <LogIn className="w-4 h-4" /> Login
                      </button>
                      <button
                        onClick={() => { setIsDropdownOpen(false); navigate('/user-registration'); }}
                        className="w-full text-left px-4 py-2 text-sm text-emerald-100/60 hover:bg-white/5 flex items-center gap-2 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" /> Register
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── Mobile toggle ── */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden p-2 rounded-full transition-all hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            >
              {isMobileMenuOpen
                ? <X    className="w-6 h-6 text-white" />
                : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {isMobileMenuOpen && (
          <nav
            className="lg:hidden py-4"
            style={{ borderTop: '1px solid rgba(212,175,55,0.12)' }}
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                  className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === item.path
                      ? 'bg-yellow-400/10 text-yellow-400'
                      : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}