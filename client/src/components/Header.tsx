import { User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Prayer Time', path: '/prayer-times' },
    { label: 'Activities', path: '/activities' },
    { label: 'Events', path: '/events' },
    { label: 'Milad', path: '/milad' },
    { label: 'Zakat', path: '/zakat' },
    { label: 'Donate', path: '/donate' },
    { label: 'Diin AI', path: '/diin-ai' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        <div className="cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-emerald-600 text-white px-3 py-2 rounded font-bold">
            AD-DIIN
          </div>
        </div>

        <nav className="hidden lg:flex gap-6">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={location.pathname === item.path 
                ? 'text-emerald-600 font-medium'
                : 'text-gray-700 hover:text-emerald-600'}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* ✅ USER LOGIN BUTTON */}
        <button
          onClick={() => navigate('/user-login')}
          className="text-gray-600 hover:text-emerald-600"
        >
          <User className="w-6 h-6" />
        </button>

      </div>
    </header>
  );
}