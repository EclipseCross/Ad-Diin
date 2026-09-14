import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users as UsersIcon, HandHeart, Calendar,
  LogOut, Menu, X, Phone, Info,
  MessageSquare, Loader2, BookOpen, Moon, Sun, Image, MessageCircle,
} from 'lucide-react';

import { API_URL, authHeaders, toArray, buildTheme } from './shared';

import Dashboard     from './Dashboard';
import Users         from './Users';
import PrayerTimes   from './PrayerTimes';
import Events        from './Events';
import MiladRequests from './MiladRequests';
import Donations     from './Donations';
import Messages      from './Messages';
import Contact       from './Contact';
import Activities    from './Activities';
import About         from './About';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]     = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode]       = useState(false);
  const [loading, setLoading]         = useState(false);

  const [users, setUsers]                 = useState<any[]>([]);
  const [donations, setDonations]         = useState<any[]>([]);
  const [prayerTimes, setPrayerTimes]     = useState<any[]>([]);
  const [events, setEvents]               = useState<any[]>([]);
  const [miladRequests, setMiladRequests] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [contacts, setContacts]           = useState<any[]>([]);
  const [activities, setActivities]       = useState<any[]>([]);

  const [donationStats, setDonationStats] = useState<any | null>(null);

  // User delete confirm lives here (passed to Users)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');
  const theme     = buildTheme(darkMode);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || adminUser.role !== 'admin') navigate('/user-login');
  }, []);

  useEffect(() => { fetchData(activeTab); }, [activeTab]);

  const fetchData = async (tab: string) => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const [u, m, e, d] = await Promise.all([
          fetch(`${API_URL}/api/v1/admin/users`,     { headers: authHeaders() }).then(r => r.json()),
          fetch(`${API_URL}/api/v1/admin/milads`,    { headers: authHeaders() }).then(r => r.json()),
          fetch(`${API_URL}/api/v1/events/all`,      { headers: authHeaders() }).then(r => r.json()),
          fetch(`${API_URL}/api/v1/admin/donations`, { headers: authHeaders() }).then(r => r.json()),
        ]);
        setUsers(toArray(u.data));
        setMiladRequests(toArray(m.data));
        setEvents(toArray(e.data));
        setDonations(toArray(d.data));
        if (d.stats) setDonationStats(d.stats);
      } else if (tab === 'users') {
        const r = await fetch(`${API_URL}/api/v1/admin/users`, { headers: authHeaders() });
        const d = await r.json();
        setUsers(toArray(d.data));
      } else if (tab === 'prayer-times') {
        const r = await fetch(`${API_URL}/api/v1/prayer-times`, { headers: authHeaders() });
        const d = await r.json();
        if (d.success && d.data) {
          const flat: any[] = [];
          if (d.data.fard?.azan)   flat.push(...d.data.fard.azan);
          if (d.data.fard?.jamaat) flat.push(...d.data.fard.jamaat);
          if (d.data.nafl)         flat.push(...d.data.nafl);
          setPrayerTimes(flat.sort((a, b) => a.display_order - b.display_order));
        }
      } else if (tab === 'events') {
        const r = await fetch(`${API_URL}/api/v1/events/all`, { headers: authHeaders() });
        const d = await r.json();
        setEvents(toArray(d.data));
      } else if (tab === 'milad-requests') {
        const r = await fetch(`${API_URL}/api/v1/admin/milads`, { headers: authHeaders() });
        const d = await r.json();
        setMiladRequests(toArray(d.data));
      } else if (tab === 'donations') {
        const r = await fetch(`${API_URL}/api/v1/admin/donations`, { headers: authHeaders() });
        const d = await r.json();
        setDonations(toArray(d.data));
        if (d.stats) setDonationStats(d.stats);
      } else if (tab === 'messages') {
        const r = await fetch(`${API_URL}/api/v1/messages`, { headers: authHeaders() });
        const d = await r.json();
        setConversations(toArray(d.conversations) || []);
      } else if (tab === 'contact') {
        const r = await fetch(`${API_URL}/api/v1/admin/contact`, { headers: authHeaders() });
        const d = await r.json();
        setContacts(toArray(d));
      } else if (tab === 'activities') {
        const r = await fetch(`${API_URL}/api/v1/admin/activities`, { headers: authHeaders() });
        const d = await r.json();
        setActivities(toArray(d.data));
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, { method: 'POST', headers: authHeaders() });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/user-login');
    }
  };

  const handleToggleUser = async (userId: string, isActive: boolean) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/users/${userId}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ is_active: isActive ? 0 : 1 }),
      });
      const d = await r.json();
      if (d.success) setUsers(prev => prev.map(u => u.id == userId ? { ...u, is_active: isActive ? 0 : 1 } : u));
    } catch (err) { console.error(err); }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/users/${userId}`, { method: 'DELETE', headers: authHeaders() });
      const d = await r.json();
      if (d.success) { setUsers(prev => prev.filter(u => u.id != userId)); setDeleteConfirm(null); }
      else alert(d.message || 'Delete failed');
    } catch { alert('Network error'); }
  };

  const handleMiladStatus = async (id: string, status: string) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/milads/${id}/status`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      const d = await r.json();
      if (d.success) setMiladRequests(prev => prev.map(m => m.id == id ? { ...m, status } : m));
    } catch (err) { console.error(err); }
  };

  const pendingMilad = miladRequests.filter(m => m.status === 'pending').length;

  const sidebarItems = [
    { id: 'dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
    { id: 'users',          label: 'Users',          icon: UsersIcon       },
    { id: 'prayer-times',   label: 'Prayer Time',    icon: BookOpen        },
    { id: 'events',         label: 'Events',         icon: Calendar        },
    { id: 'milad-requests', label: 'Milad Requests', icon: MessageSquare   },
    { id: 'donations',      label: 'Donations',      icon: HandHeart       },
    { id: 'messages',       label: 'Messages',       icon: MessageCircle   },
    { id: 'contact',        label: 'Contact',        icon: Phone           },
    { id: 'activities',     label: 'Activities',     icon: Image           },
    { id: 'about',          label: 'About Us',       icon: Info            },
  ];

  const { bg, card, text, sub, bdr } = theme;

  return (
    <div className={`min-h-screen ${bg} flex`}>

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col shadow-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${card}`}>
        <div className={`flex items-center justify-between p-4 border-b ${bdr}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className={`font-bold text-lg ${text}`}>Admin Panel</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className={`lg:hidden ${sub}`}><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition text-left ${activeTab === item.id ? 'bg-emerald-50 text-emerald-700 font-semibold' : `${sub} hover:bg-gray-100`}`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.id === 'milad-requests' && pendingMilad > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingMilad}</span>
              )}
            </button>
          ))}
        </nav>
        <div className={`p-4 border-t ${bdr}`}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition">
            <LogOut className="w-5 h-5" /><span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        <header className={`sticky top-0 z-30 ${card} shadow-sm`}>
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition">
              <Menu className={`w-5 h-5 ${sub}`} />
            </button>
            <div className="flex items-center gap-3">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 transition">
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className={`w-5 h-5 ${sub}`} />}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{adminUser?.name?.charAt(0) || 'A'}</span>
                </div>
                <div className="hidden md:block">
                  <p className={`text-sm font-medium ${text}`}>{adminUser?.name || 'Admin'}</p>
                  <p className={`text-xs ${sub}`}>{adminUser?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  {...theme}
                  users={users}
                  events={events}
                  miladRequests={miladRequests}
                  donations={donations}
                  donationStats={donationStats}
                  setActiveTab={setActiveTab}
                  handleMiladStatus={handleMiladStatus}
                />
              )}

              {activeTab === 'users' && (
                <Users
                  {...theme}
                  users={users}
                  deleteConfirm={deleteConfirm}
                  setDeleteConfirm={setDeleteConfirm}
                  handleToggleUser={handleToggleUser}
                  handleDeleteUser={handleDeleteUser}
                />
              )}

              {activeTab === 'prayer-times' && (
                <PrayerTimes
                  {...theme}
                  prayerTimes={prayerTimes}
                  setPrayerTimes={setPrayerTimes}
                />
              )}

              {activeTab === 'events' && (
                <Events
                  {...theme}
                  events={events}
                  setEvents={setEvents}
                />
              )}

              {activeTab === 'milad-requests' && (
                <MiladRequests
                  {...theme}
                  miladRequests={miladRequests}
                  handleMiladStatus={handleMiladStatus}
                />
              )}

              {activeTab === 'donations' && (
                <Donations
                  {...theme}
                  donations={donations}
                  donationStats={donationStats}
                />
              )}

              {activeTab === 'messages' && (
                <Messages
                  {...theme}
                  conversations={conversations}
                />
              )}

              {activeTab === 'contact' && (
                <Contact
                  {...theme}
                  contacts={contacts}
                  setContacts={setContacts}
                />
              )}

              {activeTab === 'activities' && (
                <Activities
                  {...theme}
                  activities={activities}
                  setActivities={setActivities}
                />
              )}

              {activeTab === 'about' && (
                <About {...theme} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}