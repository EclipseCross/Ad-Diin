import { User, LogOut, UserPlus, LogIn, Menu, X, Settings, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
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
    { label: 'About Us',    path: '/about' },
    { label: 'Contact',     path: '/contact' }
  ];

  const checkUserStatus = () => {
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener('storage', checkUserStatus);
    return () => window.removeEventListener('storage', checkUserStatus);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await fetch('http://localhost:8000/api/v1/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsDropdownOpen(false);
      navigate('/');
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-emerald-600 text-white px-3 py-2 rounded font-bold text-xl sm:text-2xl">
              الدين
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'text-emerald-600 font-medium'
                    : 'text-gray-700 hover:text-emerald-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
              >
                <User className="w-5 h-5" />
                {user && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        <p className="text-xs text-emerald-600 mt-1 capitalize">{user.role ?? 'user'}</p>
                      </div>

                      <button
                        onClick={() => { setIsDropdownOpen(false); navigate('/user-profile'); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" /> My Profile
                      </button>

                      <button
                        onClick={() => { setIsDropdownOpen(false); navigate('/my-milad-requests'); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" /> My Milad Requests
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => { setIsDropdownOpen(false); navigate('/admin-dashboard'); }}
                          className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" /> Admin Dashboard
                        </button>
                      )}

                      <div className="border-t border-gray-100 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Welcome to Ad-Diin</p>
                      </div>

                      <button
                        onClick={() => { setIsDropdownOpen(false); navigate('/user-login'); }}
                        className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 font-medium flex items-center gap-2"
                      >
                        <LogIn className="w-4 h-4" /> Login
                      </button>

                      <button
                        onClick={() => { setIsDropdownOpen(false); navigate('/user-registration'); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" /> Register
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-emerald-600"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navItems.map(item => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                  className={`text-left px-4 py-2 rounded ${
                    location.pathname === item.path
                      ? 'bg-emerald-50 text-emerald-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
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