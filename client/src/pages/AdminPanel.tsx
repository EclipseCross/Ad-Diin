import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, HandHeart, Calendar,
  LogOut, Menu, X, Phone, Info,
  UserCheck, UserX, MessageSquare, MessageCircle,
  CheckCircle, XCircle, Loader2, BookOpen,
  Moon, Sun, Trash2, Edit, Save, TrendingUp, Mail, Image
} from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_ENDPOINT || 'http://127.0.0.1:8000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  };
}

function toArray(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

function toInputTime(timeStr: string): string {
  if (!timeStr) return '';
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const parts     = timeStr.trim().split(' ');
    const meridiem  = parts[1];
    const timeParts = parts[0].split(':');
    let h = parseInt(timeParts[0], 10);
    const m = parseInt(timeParts[1] || '0', 10);
    if (meridiem === 'PM' && h !== 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  if (timeStr.includes(':')) return timeStr.slice(0, 5);
  return timeStr;
}

const categoryNames: Record<string, string> = {
  zakat: 'যাকাত', iftar: 'ইফতার', durjog: 'দুর্গত',
  sitarto: 'শীতার্ত', gachropon: 'গাছরোপণ',
  kurbani: 'কুরবানি', orphan: 'এতিম', general: 'সাধারণ'
};

const categoryColors: Record<string, string> = {
  zakat:     'bg-emerald-500', iftar:     'bg-orange-500',
  durjog:    'bg-red-500',     sitarto:   'bg-blue-500',
  gachropon: 'bg-green-500',   kurbani:   'bg-amber-500',
  orphan:    'bg-purple-500',  general:   'bg-gray-500',
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]     = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode]       = useState(false);
  const [loading, setLoading]         = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [editingPrayer, setEditingPrayer]   = useState<any | null>(null);
  const [editPrayerTime, setEditPrayerTime] = useState('');
  const [editSaving, setEditSaving]         = useState(false);
  const [editError, setEditError]           = useState('');

  const [eventModal, setEventModal]                 = useState<'create' | 'edit' | null>(null);
  const [editingEvent, setEditingEvent]             = useState<any | null>(null);
  const [eventForm, setEventForm]                   = useState({
    event_name: '', event_date: '', hijri_date: '', hijri_month: '',
    hijri_day: '', event_type: 'religious', description: '', is_active: true, display_order: ''
  });
  const [eventSaving, setEventSaving]               = useState(false);
  const [eventError, setEventError]                 = useState('');
  const [deleteEventConfirm, setDeleteEventConfirm] = useState<string | null>(null);

  const [donationFilter, setDonationFilter] = useState('all');

  const [users, setUsers]                 = useState<any[]>([]);
  const [donations, setDonations]         = useState<any[]>([]);
  const [prayerTimes, setPrayerTimes]     = useState<any[]>([]);
  const [events, setEvents]               = useState<any[]>([]);
  const [miladRequests, setMiladRequests] = useState<any[]>([]);

  // ── Messaging States ──
  const [conversations, setConversations]               = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput]                 = useState('');
  const [messageSending, setMessageSending]             = useState(false);

  const [donationStats, setDonationStats] = useState<{
    total_completed_amount: number;
    total_count: number;
    pending_count: number;
    by_category: Record<string, { total_amount: number; count: number }>;
  } | null>(null);

  // ── Contact States ──
  const [contacts, setContacts]                         = useState<any[]>([]);
  const [selectedContact, setSelectedContact]           = useState<any | null>(null);
  const [contactReply, setContactReply]                 = useState('');
  const [contactReplying, setContactReplying]           = useState(false);
  const [contactDeleteConfirm, setContactDeleteConfirm] = useState<string | null>(null);
  const [contactFilter, setContactFilter]               = useState('all');

  // ── Activities States ──
  const [activities, setActivities]                     = useState<any[]>([]);
  const [activityModal, setActivityModal]               = useState<'create' | 'edit' | null>(null);
  const [editingActivity, setEditingActivity]           = useState<any | null>(null);
  const [activityForm, setActivityForm]                 = useState({
    title: '', description: '', category: '', is_active: true, display_order: ''
  });
  const [activityImageFile, setActivityImageFile]       = useState<File | null>(null);
  const [activityImagePreview, setActivityImagePreview] = useState<string>('');
  const [activitySaving, setActivitySaving]             = useState(false);
  const [activityError, setActivityError]               = useState('');
  const [deleteActivityConfirm, setDeleteActivityConfirm] = useState<string | null>(null);

  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');

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
        body: JSON.stringify({ is_active: isActive ? 0 : 1 })
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
        body: JSON.stringify({ status })
      });
      const d = await r.json();
      if (d.success) setMiladRequests(prev => prev.map(m => m.id == id ? { ...m, status } : m));
    } catch (err) { console.error(err); }
  };

  const handleOpenEditPrayer = (prayer: any) => {
    setEditingPrayer(prayer);
    setEditPrayerTime(toInputTime(prayer.prayer_time || prayer.time || ''));
    setEditError('');
  };

  const handleSavePrayer = async () => {
    if (!editingPrayer) return;
    if (!editPrayerTime) { setEditError('সময় দিন'); return; }
    setEditSaving(true);
    setEditError('');
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/prayer-times/${editingPrayer.id}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ prayer_time: editPrayerTime + ':00' })
      });
      const d = await r.json();
      if (d.success) {
        setPrayerTimes(prev => prev.map(p =>
          p.id === editingPrayer.id ? { ...p, prayer_time: editPrayerTime + ':00', time: d.data?.time || editPrayerTime } : p
        ));
        setEditingPrayer(null);
      } else {
        setEditError(d.errors?.prayer_time?.[0] || d.message || 'Update failed');
      }
    } catch { setEditError('Network error'); }
    finally { setEditSaving(false); }
  };

  const openCreateEvent = () => {
    setEventForm({ event_name: '', event_date: '', hijri_date: '', hijri_month: '', hijri_day: '', event_type: 'religious', description: '', is_active: true, display_order: '' });
    setEventError('');
    setEventModal('create');
  };

  const openEditEvent = (event: any) => {
    setEditingEvent(event);
    setEventForm({
      event_name:    event.event_name   || '',
      event_date:    event.event_date   ? String(event.event_date).slice(0, 10) : '',
      hijri_date:    event.hijri_date   || '',
      hijri_month:   event.hijri_month  || '',
      hijri_day:     event.hijri_day    ? String(event.hijri_day) : '',
      event_type:    event.event_type   || 'religious',
      description:   event.description || '',
      is_active:     !!event.is_active,
      display_order: event.display_order ? String(event.display_order) : '',
    });
    setEventError('');
    setEventModal('edit');
  };

  const handleSaveEvent = async () => {
    if (!eventForm.event_name || !eventForm.event_date || !eventForm.event_type) {
      setEventError('ইভেন্টের নাম, তারিখ ও ধরন আবশ্যক');
      return;
    }
    setEventSaving(true);
    setEventError('');
    try {
      const isEdit = eventModal === 'edit';
      const url    = isEdit ? `${API_URL}/api/v1/admin/events/${editingEvent.id}` : `${API_URL}/api/v1/admin/events`;
      const payload = { ...eventForm, hijri_day: eventForm.hijri_day ? parseInt(eventForm.hijri_day) : null, display_order: eventForm.display_order ? parseInt(eventForm.display_order) : null };
      const r = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      const d = await r.json();
      if (d.success) {
        if (isEdit) setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...d.data } : e));
        else setEvents(prev => [...prev, d.data]);
        setEventModal(null);
      } else {
        if (d.errors) { const fe = Object.values(d.errors)[0]; setEventError(Array.isArray(fe) ? fe[0] as string : String(fe)); }
        else setEventError(d.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch { setEventError('Network error'); }
    finally { setEventSaving(false); }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/events/${id}`, { method: 'DELETE', headers: authHeaders() });
      const d = await r.json();
      if (d.success) { setEvents(prev => prev.filter(e => e.id != id)); setDeleteEventConfirm(null); }
      else alert(d.message || 'Delete failed');
    } catch { alert('Network error'); }
  };

  const loadConversationMessages = async (conversationId: number) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/messages/${conversationId}`, { headers: authHeaders() });
      const d = await r.json();
      if (d.success) setConversationMessages(d.messages || []);
    } catch (err) { console.error('Load messages error:', err); }
  };

  const handleSelectConversation = async (conversation: any) => {
    setSelectedConversation(conversation);
    setMessageInput('');
    await loadConversationMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    setMessageSending(true);
    try {
      const r = await fetch(`${API_URL}/api/v1/messages/${selectedConversation.id}/send`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ message: messageInput })
      });
      const d = await r.json();
      if (d.success) {
        setConversationMessages([...conversationMessages, d.message]);
        setMessageInput('');
        setSelectedConversation({ ...selectedConversation, updated_at: new Date().toISOString() });
      }
    } catch (err) { console.error('Send message error:', err); }
    finally { setMessageSending(false); }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;
    try {
      const r = await fetch(`${API_URL}/api/v1/messages/${selectedConversation.id}/close`, {
        method: 'PATCH', headers: authHeaders()
      });
      const d = await r.json();
      if (d.success) {
        setSelectedConversation({ ...selectedConversation, status: 'closed' });
        setConversations(prev => prev.map(c => c.id === selectedConversation.id ? { ...c, status: 'closed' } : c));
      }
    } catch (err) { console.error('Close conversation error:', err); }
  };

  // ── Contact Handlers ──
  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/v1/admin/contact/${id}/read`, { method: 'PATCH', headers: authHeaders() });
      setContacts(prev => prev.map(c => c.id == id ? { ...c, status: 'read' } : c));
      if (selectedContact?.id == id) setSelectedContact((prev: any) => ({ ...prev, status: 'read' }));
    } catch (err) { console.error(err); }
  };

  const handleContactReply = async () => {
    if (!contactReply.trim() || !selectedContact) return;
    setContactReplying(true);
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/contact/${selectedContact.id}/reply`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ reply_message: contactReply })
      });
      const d = await r.json();
      if (d.success) {
        setContacts(prev => prev.map(c => c.id === selectedContact.id ? { ...c, status: 'replied' } : c));
        setSelectedContact((prev: any) => ({ ...prev, status: 'replied' }));
        setContactReply('');
        alert('✓ Reply পাঠানো হয়েছে!');
      } else {
        alert(d.message || 'Reply পাঠাতে ব্যর্থ হয়েছে');
      }
    } catch { alert('Network error'); }
    finally { setContactReplying(false); }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/contact/${id}`, { method: 'DELETE', headers: authHeaders() });
      const d = await r.json();
      if (d.success) {
        setContacts(prev => prev.filter(c => c.id != id));
        if (selectedContact?.id == id) setSelectedContact(null);
        setContactDeleteConfirm(null);
      } else {
        alert(d.message || 'Delete failed');
      }
    } catch { alert('Network error'); }
  };

  // ── Activity Handlers ──
  const handleActivityImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActivityImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setActivityImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const openCreateActivity = () => {
    setActivityForm({ title: '', description: '', category: '', is_active: true, display_order: '' });
    setActivityImageFile(null);
    setActivityImagePreview('');
    setActivityError('');
    setEditingActivity(null);
    setActivityModal('create');
  };

  const openEditActivity = (activity: any) => {
    setEditingActivity(activity);
    setActivityForm({
      title:         activity.title       || '',
      description:   activity.description || '',
      category:      activity.category    || '',
      is_active:     !!activity.is_active,
      display_order: activity.display_order ? String(activity.display_order) : '',
    });
    setActivityImageFile(null);
    setActivityImagePreview(activity.image_url || '');
    setActivityError('');
    setActivityModal('edit');
  };

  const handleSaveActivity = async () => {
    if (!activityForm.title || !activityForm.description) {
      setActivityError('শিরোনাম ও বিবরণ আবশ্যক');
      return;
    }
    setActivitySaving(true);
    setActivityError('');
    try {
      const formData = new FormData();
      formData.append('title',         activityForm.title);
      formData.append('description',   activityForm.description);
      formData.append('category',      activityForm.category);
      formData.append('is_active',     activityForm.is_active ? '1' : '0');
      formData.append('display_order', activityForm.display_order || '0');
      if (activityImageFile) formData.append('image', activityImageFile);

      const isEdit = activityModal === 'edit';
      const url    = isEdit
        ? `${API_URL}/api/v1/admin/activities/${editingActivity.id}`
        : `${API_URL}/api/v1/admin/activities`;

      const token = localStorage.getItem('token');
     
      const r = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      });
       
      const d = await r.json();
      if (d.success) {
        if (isEdit) setActivities(prev => prev.map(a => a.id === editingActivity.id ? { ...a, ...d.data } : a));
        else        setActivities(prev => [...prev, d.data]);
        setActivityModal(null);
      } else {
        if (d.errors) {
          const fe = Object.values(d.errors)[0];
          setActivityError(Array.isArray(fe) ? fe[0] as string : String(fe));
        } else {
          setActivityError(d.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
        }
      }
    } catch { setActivityError('Network error'); }
    finally { setActivitySaving(false); }
  };

  const handleDeleteActivity = async (id: number) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/activities/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
  
      const d = await r.json();
  
      if (d.success) {
        setActivities(prev => prev.filter(a => a.id !== id)); // strict compare
        setDeleteActivityConfirm(null);
      } else {
        alert(d.message || 'Delete failed');
      }
  
    } catch {
      alert('Network error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'active': case 'approved': return 'bg-green-100 text-green-800';
      case 'processing': case 'read':  return 'bg-blue-100 text-blue-800';
      case 'pending':   case 'unread': return 'bg-yellow-100 text-yellow-800';
      case 'failed':    case 'rejected': return 'bg-red-100 text-red-800';
      case 'replied':   return 'bg-emerald-100 text-emerald-800';
      case 'inactive':  return 'bg-gray-100 text-gray-800';
      default:          return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDonations = donations.filter(d => {
    if (donationFilter === 'all') return true;
    return d.payment_status === donationFilter || d.category === donationFilter;
  });

  const bg       = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const card     = darkMode ? 'bg-gray-800' : 'bg-white';
  const text     = darkMode ? 'text-white'  : 'text-gray-900';
  const sub      = darkMode ? 'text-gray-400' : 'text-gray-500';
  const bdr      = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputCls = `w-full border ${bdr} rounded-lg px-3 py-2 text-sm ${text} ${darkMode ? 'bg-gray-700' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-emerald-500`;

  const pendingMilad = miladRequests.filter(m => m.status === 'pending').length;

  const sidebarItems = [
    { id: 'dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
    { id: 'users',          label: 'Users',          icon: Users           },
    { id: 'prayer-times',   label: 'Prayer Time',    icon: BookOpen        },
    { id: 'events',         label: 'Events',         icon: Calendar        },
    { id: 'milad-requests', label: 'Milad Requests', icon: MessageSquare   },
    { id: 'donations',      label: 'Donations',      icon: HandHeart       },
    { id: 'messages',       label: 'Messages',       icon: MessageCircle   },
    { id: 'contact',        label: 'Contact',        icon: Phone           },
    { id: 'activities',     label: 'Activities',     icon: Image           },
    { id: 'about',          label: 'About Us',       icon: Info            },
  ];

  const categoryStatsArray = donationStats?.by_category
    ? Object.entries(donationStats.by_category).map(([cat, val]) => ({
        category: cat,
        name: categoryNames[cat] || cat,
        amount: Number(val.total_amount),
        count: Number(val.count),
        color: categoryColors[cat] || 'bg-gray-400',
      })).sort((a, b) => b.amount - a.amount)
    : [];

  const maxAmount = Math.max(...categoryStatsArray.map(c => c.amount), 1);

  return (
    <div className={`min-h-screen ${bg} flex`}>

      {/* ── User Delete Confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${card} rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
            <h3 className={`text-lg font-bold mb-2 ${text}`}>ব্যবহারকারী মুছবেন?</h3>
            <p className={`text-sm mb-6 ${sub}`}>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm`}>বাতিল</button>
              <button onClick={() => handleDeleteUser(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">হ্যাঁ, মুছুন</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Event Delete Confirm ── */}
      {deleteEventConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${card} rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
            <h3 className={`text-lg font-bold mb-2 ${text}`}>ইভেন্ট মুছবেন?</h3>
            <p className={`text-sm mb-6 ${sub}`}>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteEventConfirm(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm`}>বাতিল</button>
              <button onClick={() => handleDeleteEvent(deleteEventConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">হ্যাঁ, মুছুন</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Contact Delete Confirm ── */}
      {contactDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${card} rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
            <h3 className={`text-lg font-bold mb-2 ${text}`}>Message মুছবেন?</h3>
            <p className={`text-sm mb-6 ${sub}`}>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setContactDeleteConfirm(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm`}>বাতিল</button>
              <button onClick={() => handleDeleteContact(contactDeleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">হ্যাঁ, মুছুন</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Activity Delete Confirm ── */}
     {/* ── Activity Delete Confirm ── */}
{deleteActivityConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className={`${card} rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
      
      <h3 className={`text-lg font-bold mb-2 ${text}`}>
        Activity মুছবেন?
      </h3>

      <p className={`text-sm mb-6 ${sub}`}>
        এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
      </p>

      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setDeleteActivityConfirm(null)}
          className={`px-4 py-2 border ${bdr} rounded-lg text-sm`}
        >
          বাতিল
        </button>

        <button
          onClick={() => handleDeleteActivity(Number(deleteActivityConfirm))}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
        >
          হ্যাঁ, মুছুন
        </button>
      </div>
    </div>
  </div>
)}

      {/* ── Event Modal ── */}
      {eventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${card} rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-lg font-bold ${text}`}>{eventModal === 'create' ? 'নতুন ইভেন্ট যোগ করুন' : 'ইভেন্ট সম্পাদনা করুন'}</h3>
              <button onClick={() => setEventModal(null)} className={sub}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${sub}`}>ইভেন্টের নাম *</label>
                <input type="text" value={eventForm.event_name} onChange={e => setEventForm(f => ({ ...f, event_name: e.target.value }))} placeholder="যেমন: ঈদুল ফিতর" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>তারিখ (ইংরেজি) *</label>
                  <input type="date" value={eventForm.event_date} onChange={e => setEventForm(f => ({ ...f, event_date: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>ধরন *</label>
                  <select value={eventForm.event_type} onChange={e => setEventForm(f => ({ ...f, event_type: e.target.value }))} className={inputCls}>
                    <option value="religious">Religious (ধর্মীয়)</option>
                    <option value="festival">Festival (উৎসব)</option>
                    <option value="special">Special (বিশেষ)</option>
                    <option value="historical">Historical (ঐতিহাসিক)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>হিজরি তারিখ</label>
                  <input type="text" value={eventForm.hijri_date} onChange={e => setEventForm(f => ({ ...f, hijri_date: e.target.value }))} placeholder="যেমন: ১ শাওয়াল ১৪৪৬" className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>হিজরি মাস</label>
                  <input type="text" value={eventForm.hijri_month} onChange={e => setEventForm(f => ({ ...f, hijri_month: e.target.value }))} placeholder="যেমন: শাওয়াল" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>হিজরি দিন</label>
                  <input type="number" value={eventForm.hijri_day} min="1" max="30" onChange={e => setEventForm(f => ({ ...f, hijri_day: e.target.value }))} placeholder="১" className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>ক্রম (Display Order)</label>
                  <input type="number" value={eventForm.display_order} min="1" onChange={e => setEventForm(f => ({ ...f, display_order: e.target.value }))} placeholder="1" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${sub}`}>বিবরণ</label>
                <textarea value={eventForm.description} rows={3} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} placeholder="ইভেন্টের বিবরণ লিখুন..." className={`${inputCls} resize-none`} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="event-active" checked={eventForm.is_active} onChange={e => setEventForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-emerald-600" />
                <label htmlFor="event-active" className={`text-sm ${text}`}>সক্রিয় রাখুন</label>
              </div>
            </div>
            {eventError && <p className="text-red-500 text-sm mt-3">{eventError}</p>}
            <div className="flex gap-3 justify-end mt-5">
              <button onClick={() => setEventModal(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm ${text}`}>বাতিল</button>
              <button onClick={handleSaveEvent} disabled={eventSaving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50">
                {eventSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {eventModal === 'create' ? 'যোগ করুন' : 'আপডেট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Prayer Edit Modal ── */}
      {editingPrayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${card} rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${text}`}>সময় পরিবর্তন করুন</h3>
              <button onClick={() => setEditingPrayer(null)} className={sub}><X className="w-5 h-5" /></button>
            </div>
            <p className={`text-sm mb-4 ${sub}`}>{editingPrayer.display_name_bn} ({editingPrayer.display_name_en})</p>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${sub}`}>নতুন সময়</label>
              <input type="time" value={editPrayerTime} onChange={e => setEditPrayerTime(e.target.value)} className={`w-full border ${bdr} rounded-lg px-3 py-2 text-lg ${text} ${darkMode ? 'bg-gray-700' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-emerald-500`} />
              <p className={`text-xs mt-1 ${sub}`}>বর্তমান সময়: {editingPrayer.time || editingPrayer.prayer_time}</p>
            </div>
            {editError && <p className="text-red-500 text-sm mb-3">{editError}</p>}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingPrayer(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm ${text}`}>বাতিল</button>
              <button onClick={handleSavePrayer} disabled={editSaving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50">
                {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Activity Modal ── */}
      {activityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${card} rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-lg font-bold ${text}`}>
                {activityModal === 'create' ? 'নতুন Activity যোগ করুন' : 'Activity সম্পাদনা করুন'}
              </h3>
              <button onClick={() => setActivityModal(null)} className={sub}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${sub}`}>ছবি (Cloudinary)</label>
                <div className={`border-2 border-dashed ${bdr} rounded-lg p-4 text-center`}>
                  {activityImagePreview ? (
                    <div className="relative">
                      <img src={activityImagePreview} alt="preview" className="w-full h-40 object-cover rounded-lg mb-2" />
                      <button
                        onClick={() => { setActivityImageFile(null); setActivityImagePreview(''); }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >✕</button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <Image className={`w-5 h-5 ${sub}`} />
                      </div>
                      <p className={`text-xs ${sub}`}>ছবি বেছে নিন</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleActivityImageChange}
                    className="hidden"
                    id="activity-image-input"
                  />
                  <label
                    htmlFor="activity-image-input"
                    className={`mt-2 inline-block cursor-pointer px-4 py-1.5 border ${bdr} rounded-lg text-xs ${text} hover:bg-gray-50 transition`}
                  >
                    {activityImagePreview ? 'ছবি পরিবর্তন করুন' : 'ছবি বেছে নিন'}
                  </label>
                </div>
              </div>
              {/* Title */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${sub}`}>শিরোনাম *</label>
                <input
                  type="text"
                  value={activityForm.title}
                  onChange={e => setActivityForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="যেমন: Quranic Study"
                  className={inputCls}
                />
              </div>
              {/* Description */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${sub}`}>বিবরণ *</label>
                <textarea
                  rows={4}
                  value={activityForm.description}
                  onChange={e => setActivityForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Activity এর বিস্তারিত বিবরণ..."
                  className={`${inputCls} resize-none`}
                />
              </div>
              {/* Category & Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>ক্যাটাগরি</label>
                  <select
                    value={activityForm.category}
                    onChange={e => setActivityForm(f => ({ ...f, category: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">-- বেছে নিন --</option>
                    <option value="education">শিক্ষা (Education)</option>
                    <option value="charity">দাতব্য (Charity)</option>
                    <option value="youth">যুব কার্যক্রম (Youth)</option>
                    <option value="social">সামাজিক (Social)</option>
                    <option value="religious">ধর্মীয় (Religious)</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>ক্রম (Order)</label>
                  <input
                    type="number"
                    value={activityForm.display_order}
                    min="0"
                    onChange={e => setActivityForm(f => ({ ...f, display_order: e.target.value }))}
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
              </div>
              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="activity-active"
                  checked={activityForm.is_active}
                  onChange={e => setActivityForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 accent-emerald-600"
                />
                <label htmlFor="activity-active" className={`text-sm ${text}`}>সক্রিয় রাখুন</label>
              </div>
            </div>
            {activityError && <p className="text-red-500 text-sm mt-3">{activityError}</p>}
            <div className="flex gap-3 justify-end mt-5">
              <button onClick={() => setActivityModal(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm ${text}`}>বাতিল</button>
              <button
                onClick={handleSaveActivity}
                disabled={activitySaving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
              >
                {activitySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {activityModal === 'create' ? 'যোগ করুন' : 'আপডেট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col shadow-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${card}`}>
        <div className={`flex items-center justify-between p-4 border-b ${bdr}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">A</span></div>
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
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition">
                <Menu className={`w-5 h-5 ${sub}`} />
              </button>
            </div>
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
              {/* ── DASHBOARD ── */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'মোট ব্যবহারকারী', value: users.length,     icon: Users,         color: 'bg-blue-100 text-blue-600'       },
                      { label: 'মোট ইভেন্ট',       value: events.length,    icon: Calendar,      color: 'bg-purple-100 text-purple-600'   },
                      { label: 'Pending মিলাদ',     value: pendingMilad,     icon: MessageSquare, color: 'bg-yellow-100 text-yellow-600'   },
                      { label: 'মোট দান (সংখ্যা)',  value: donationStats?.total_count ?? donations.length, icon: HandHeart, color: 'bg-emerald-100 text-emerald-600' },
                    ].map(s => (
                      <div key={s.label} className={`${card} rounded-xl p-5 shadow-sm`}>
                        <div className={`inline-flex p-2 rounded-lg mb-3 ${s.color}`}><s.icon className="w-5 h-5" /></div>
                        <p className={`text-2xl font-bold ${text}`}>{s.value}</p>
                        <p className={`text-sm ${sub}`}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {donationStats && (
                    <div className={`${card} rounded-xl shadow-sm p-6`}>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-emerald-100 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
                        <div>
                          <h3 className={`font-semibold ${text}`}>দানের সারসংক্ষেপ</h3>
                          <p className={`text-xs ${sub}`}>শুধুমাত্র সম্পন্ন (completed) দানের হিসাব</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-emerald-50 rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-emerald-700">৳{donationStats.total_completed_amount.toLocaleString('en-BD')}</p>
                          <p className="text-sm text-emerald-600 mt-1">মোট সংগৃহীত</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-green-700">{donationStats.total_count - donationStats.pending_count}</p>
                          <p className="text-sm text-green-600 mt-1">সম্পন্ন দান</p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-yellow-700">{donationStats.pending_count}</p>
                          <p className="text-sm text-yellow-600 mt-1">প্রক্রিয়াধীন</p>
                        </div>
                      </div>
                      {categoryStatsArray.length > 0 && (
                        <div>
                          <h4 className={`text-sm font-semibold mb-3 ${text}`}>ক্যাটাগরি অনুযায়ী দান</h4>
                          <div className="space-y-3">
                            {categoryStatsArray.map(cat => (
                              <div key={cat.category}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-sm font-medium ${text}`}>{cat.name}</span>
                                  <div className="flex items-center gap-3">
                                    <span className={`text-xs ${sub}`}>{cat.count} টি দান</span>
                                    <span className="text-sm font-bold text-emerald-600">৳{cat.amount.toLocaleString('en-BD')}</span>
                                  </div>
                                </div>
                                <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                  <div className={`h-2 rounded-full ${cat.color} transition-all duration-500`} style={{ width: `${(cat.amount / maxAmount) * 100}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`${card} rounded-xl shadow-sm p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${text}`}>সাম্প্রতিক দান</h3>
                      <button onClick={() => setActiveTab('donations')} className="text-emerald-600 text-sm hover:underline">সব দেখুন</button>
                    </div>
                    {donations.length === 0 ? <p className={`text-center py-6 ${sub}`}>কোনো দান নেই</p> : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className={`text-xs ${sub} border-b ${bdr}`}>
                            <th className="text-left pb-2">নাম</th><th className="text-left pb-2">পরিমাণ</th>
                            <th className="text-left pb-2">ক্যাটাগরি</th><th className="text-left pb-2">স্ট্যাটাস</th>
                          </tr></thead>
                          <tbody>
                            {donations.slice(0, 5).map((d: any) => (
                              <tr key={d.id} className={`border-b ${bdr}`}>
                                <td className={`py-3 font-medium ${text}`}>{d.name || 'Anonymous'}</td>
                                <td className="py-3 font-medium text-emerald-600">৳{d.amount}</td>
                                <td className={`py-3 ${sub}`}>{categoryNames[d.category] || d.category}</td>
                                <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(d.payment_status)}`}>{d.payment_status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className={`${card} rounded-xl shadow-sm p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${text}`}>Pending মিলাদ অনুরোধ</h3>
                      <button onClick={() => setActiveTab('milad-requests')} className="text-emerald-600 text-sm hover:underline">সব দেখুন</button>
                    </div>
                    {pendingMilad === 0 ? <p className={`text-center py-6 ${sub}`}>কোনো pending অনুরোধ নেই ✓</p> : (
                      <div className="space-y-3">
                        {miladRequests.filter(m => m.status === 'pending').slice(0, 3).map((m: any) => (
                          <div key={m.id} className={`flex items-center justify-between p-3 border ${bdr} rounded-lg`}>
                            <div>
                              <p className={`font-medium ${text}`}>{m.name}</p>
                              <p className={`text-xs ${sub}`}>{m.milad_date} — {m.phone}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleMiladStatus(m.id, 'approved')} className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg">অনুমোদন</button>
                              <button onClick={() => handleMiladStatus(m.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg">বাতিল</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={`${card} rounded-xl shadow-sm p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${text}`}>আসন্ন ইভেন্ট</h3>
                      <button onClick={() => setActiveTab('events')} className="text-emerald-600 text-sm hover:underline">সব দেখুন</button>
                    </div>
                    {events.length === 0 ? <p className={`text-center py-6 ${sub}`}>কোনো ইভেন্ট নেই</p> : (
                      <div className="space-y-3">
                        {events.slice(0, 3).map((e: any) => (
                          <div key={e.id} className={`flex items-center justify-between p-3 border ${bdr} rounded-lg`}>
                            <div>
                              <p className={`font-medium ${text}`}>{e.event_name}</p>
                              <p className={`text-xs ${sub}`}>{e.event_date} — {e.hijri_date}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              e.event_type === 'festival'  ? 'bg-green-100 text-green-800' :
                              e.event_type === 'special'   ? 'bg-purple-100 text-purple-800' :
                              e.event_type === 'religious' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-orange-100 text-orange-800'}`}>{e.event_type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── USERS ── */}
              {activeTab === 'users' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>ব্যবহারকারী ব্যবস্থাপনা</h3>
                  {users.length === 0 ? <p className={`text-center py-8 ${sub}`}>কোনো ব্যবহারকারী নেই</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <tr>{['নাম', 'ইমেইল', 'ফোন', 'রোল', 'স্ট্যাটাস', 'Action'].map(h => (
                            <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {users.map((u: any) => (
                            <tr key={u.id} className={`border-b ${bdr}`}>
                              <td className={`p-3 font-medium ${text}`}>{u.name}</td>
                              <td className={`p-3 ${sub}`}>{u.email}</td>
                              <td className={`p-3 ${sub}`}>{u.phone || '-'}</td>
                              <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>{u.role}</span></td>
                              <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{u.is_active ? 'active' : 'inactive'}</span></td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleToggleUser(u.id, !!u.is_active)} className="p-1 rounded hover:bg-gray-100">
                                    {u.is_active ? <UserX className="w-4 h-4 text-orange-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                                  </button>
                                  {u.role !== 'admin' && (
                                    <button onClick={() => setDeleteConfirm(u.id)} className="p-1 rounded hover:bg-red-50">
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── PRAYER TIMES ── */}
              {activeTab === 'prayer-times' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>নামাজের সময়সূচি</h3>
                  {prayerTimes.length === 0 ? <p className={`text-center py-8 ${sub}`}>কোনো তথ্য নেই</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <tr>{['নাম (বাংলা)', 'নাম (ইংরেজি)', 'সময়', 'ধরন', 'ক্যাটাগরি', 'স্ট্যাটাস', 'Action'].map(h => (
                            <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {prayerTimes.map((p: any) => (
                            <tr key={p.id} className={`border-b ${bdr}`}>
                              <td className={`p-3 font-medium ${text}`}>{p.display_name_bn}</td>
                              <td className={`p-3 ${sub}`}>{p.display_name_en}</td>
                              <td className="p-3 font-bold text-emerald-600 text-base">{p.time || p.prayer_time}</td>
                              <td className={`p-3 ${sub}`}>{p.prayer_type}</td>
                              <td className={`p-3 ${sub}`}>{p.category}</td>
                              <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{p.is_active ? 'active' : 'inactive'}</span></td>
                              <td className="p-3">
                                <button onClick={() => handleOpenEditPrayer(p)} className="p-1 rounded hover:bg-emerald-50">
                                  <Edit className="w-4 h-4 text-emerald-600" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── EVENTS ── */}
              {activeTab === 'events' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-semibold ${text}`}>ইসলামিক ইভেন্ট</h3>
                    <button onClick={openCreateEvent} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition">
                      <span className="text-lg leading-none font-bold">+</span> নতুন ইভেন্ট
                    </button>
                  </div>
                  {events.length === 0 ? <p className={`text-center py-8 ${sub}`}>কোনো ইভেন্ট নেই</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <tr>{['ইভেন্ট', 'তারিখ', 'হিজরি', 'ধরন', 'স্ট্যাটাস', 'Action'].map(h => (
                            <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {events.map((e: any) => (
                            <tr key={e.id} className={`border-b ${bdr}`}>
                              <td className={`p-3 font-medium ${text}`}>{e.event_name}</td>
                              <td className={`p-3 ${sub}`}>{e.event_date}</td>
                              <td className={`p-3 ${sub}`}>{e.hijri_date || '-'}</td>
                              <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                e.event_type === 'festival'   ? 'bg-green-100 text-green-800' :
                                e.event_type === 'special'    ? 'bg-purple-100 text-purple-800' :
                                e.event_type === 'historical' ? 'bg-orange-100 text-orange-800' :
                                e.event_type === 'religious'  ? 'bg-emerald-100 text-emerald-800' :
                                'bg-blue-100 text-blue-800'}`}>{e.event_type}</span></td>
                              <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${e.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{e.is_active ? 'active' : 'inactive'}</span></td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => openEditEvent(e)} className="p-1 rounded hover:bg-emerald-50"><Edit className="w-4 h-4 text-emerald-600" /></button>
                                  <button onClick={() => setDeleteEventConfirm(e.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── MILAD REQUESTS ── */}
              {activeTab === 'milad-requests' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>মিলাদ অনুরোধ</h3>
                  {miladRequests.length === 0 ? <p className={`text-center py-8 ${sub}`}>কোনো অনুরোধ নেই</p> : (
                    <div className="space-y-4">
                      {miladRequests.map((m: any) => (
                        <div key={m.id} className={`border ${bdr} rounded-lg p-4`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className={`font-semibold ${text}`}>{m.name}</h4>
                              <p className={`text-sm ${sub}`}>{m.phone} — {m.milad_date}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(m.status)}`}>{m.status}</span>
                          </div>
                          {m.description && <p className={`text-sm mt-2 ${sub}`}>{m.description}</p>}
                          {m.admin_remark && <div className="mt-2 p-2 bg-blue-50 rounded"><p className="text-xs text-blue-600">Admin Note: {m.admin_remark}</p></div>}
                          {m.status === 'pending' && (
                            <div className="flex justify-end gap-2 mt-3">
                              <button onClick={() => handleMiladStatus(m.id, 'approved')} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> অনুমোদন</button>
                              <button onClick={() => handleMiladStatus(m.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-1"><XCircle className="w-4 h-4" /> বাতিল</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── DONATIONS ── */}
              {activeTab === 'donations' && (
                <div className="space-y-4">
                  {donationStats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className={`${card} rounded-xl p-4 shadow-sm`}>
                        <p className={`text-xs ${sub} mb-1`}>মোট সংগৃহীত</p>
                        <p className="text-2xl font-bold text-emerald-600">৳{donationStats.total_completed_amount.toLocaleString('en-BD')}</p>
                      </div>
                      <div className={`${card} rounded-xl p-4 shadow-sm`}>
                        <p className={`text-xs ${sub} mb-1`}>মোট দান সংখ্যা</p>
                        <p className={`text-2xl font-bold ${text}`}>{donationStats.total_count}</p>
                      </div>
                      <div className={`${card} rounded-xl p-4 shadow-sm`}>
                        <p className={`text-xs ${sub} mb-1`}>প্রক্রিয়াধীন</p>
                        <p className="text-2xl font-bold text-yellow-600">{donationStats.pending_count}</p>
                      </div>
                    </div>
                  )}
                  <div className={`${card} rounded-xl shadow-sm p-6`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                      <h3 className={`text-xl font-semibold ${text}`}>দানের তালিকা</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'all',       label: 'সব' },
                          { key: 'completed', label: '✓ সম্পন্ন' },
                          { key: 'pending',   label: '⏳ প্রক্রিয়াধীন' },
                          { key: 'failed',    label: '✗ ব্যর্থ' },
                        ].map(f => (
                          <button key={f.key} onClick={() => setDonationFilter(f.key)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${donationFilter === f.key ? 'bg-emerald-600 text-white' : `border ${bdr} ${sub} hover:bg-gray-100`}`}>
                            {f.label}
                          </button>
                        ))}
                        <select
                          value={['all','completed','pending','failed'].includes(donationFilter) ? 'cat_all' : donationFilter}
                          onChange={e => setDonationFilter(e.target.value === 'cat_all' ? 'all' : e.target.value)}
                          className={`px-3 py-1 rounded-lg text-xs border ${bdr} ${text} ${darkMode ? 'bg-gray-700' : 'bg-white'} focus:outline-none`}>
                          <option value="cat_all">সব ক্যাটাগরি</option>
                          {Object.entries(categoryNames).map(([key, val]) => (
                            <option key={key} value={key}>{val}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {filteredDonations.length === 0 ? <p className={`text-center py-8 ${sub}`}>কোনো দান নেই</p> : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <tr>{['Transaction ID', 'নাম', 'পরিমাণ', 'ক্যাটাগরি', 'পদ্ধতি', 'স্ট্যাটাস', 'তারিখ'].map(h => (
                              <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                            ))}</tr>
                          </thead>
                          <tbody>
                            {filteredDonations.map((d: any) => (
                              <tr key={d.id} className={`border-b ${bdr}`}>
                                <td className={`p-3 text-xs ${sub}`}>{d.tran_id}</td>
                                <td className={`p-3 font-medium ${text}`}>{d.name || 'Anonymous'}</td>
                                <td className="p-3 font-medium text-emerald-600">৳{d.amount}</td>
                                <td className={`p-3 ${sub}`}>{categoryNames[d.category] || d.category}</td>
                                <td className={`p-3 ${sub}`}>{d.payment_method || '-'}</td>
                                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(d.payment_status)}`}>{d.payment_status}</span></td>
                                <td className={`p-3 ${sub}`}>{d.created_at?.slice(0, 10)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── MESSAGES ── */}
              {activeTab === 'messages' && (
                <div className={`${card} rounded-xl shadow-sm p-6 w-full max-w-6xl`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>User Messages</h3>
                  <div className="grid gap-6 lg:grid-cols-3 min-h-[500px]">
                    <div className={`${card} rounded-lg border ${bdr} overflow-hidden flex flex-col`}>
                      <div className="bg-emerald-600 text-white p-4 font-semibold">Conversations</div>
                      <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">No conversations</div>
                        ) : (
                          conversations.map(conv => (
                            <button key={conv.id} onClick={() => handleSelectConversation(conv)}
                              className={`w-full p-4 border-b ${bdr} text-left transition ${selectedConversation?.id === conv.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : 'hover:bg-gray-50'}`}>
                              <p className={`font-semibold text-sm ${text}`}>{conv.user?.name || 'User'}</p>
                              <p className="text-xs text-gray-500 truncate">{conv.user?.email}</p>
                              <p className="text-xs text-gray-600 mt-1 truncate">{conv.lastMessage?.message || 'No messages'}</p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                    <div className={`lg:col-span-2 ${card} rounded-lg border ${bdr} overflow-hidden flex flex-col`}>
                      {selectedConversation ? (
                        <>
                          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between font-semibold">
                            <div>
                              <p className="text-sm opacity-90">Conversation with</p>
                              <p>{selectedConversation.user?.name}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedConversation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {selectedConversation.status}
                            </span>
                          </div>
                          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-3">
                            {conversationMessages.length === 0 ? (
                              <div className="flex items-center justify-center h-full text-gray-400 text-center"><p>No messages yet. Start replying!</p></div>
                            ) : (
                              conversationMessages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender_type === 'admin' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-900 rounded-bl-none'}`}>
                                    <p className="text-xs opacity-70 mb-1">{msg.sender?.name}</p>
                                    <p className="text-sm">{msg.message}</p>
                                    <p className="text-xs opacity-50 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <div className={`border-t ${bdr} p-4 bg-white`}>
                            {selectedConversation.status === 'active' ? (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <input type="text" value={messageInput} onChange={e => setMessageInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type your reply..." className={inputCls} />
                                  <button onClick={handleSendMessage} disabled={!messageInput.trim() || messageSending}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-semibold">Send</button>
                                </div>
                                <button onClick={handleCloseConversation} className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold">Close Conversation</button>
                              </div>
                            ) : (
                              <p className="text-center text-sm text-red-600 font-semibold">This conversation is closed</p>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-center"><p>Select a conversation to view messages</p></div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── CONTACT ── */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'মোট Message',       value: contacts.length,                                     color: text              },
                      { label: 'অপঠিত',             value: contacts.filter(c => c.status === 'unread').length,  color: 'text-yellow-600' },
                      { label: 'Reply দেওয়া হয়েছে', value: contacts.filter(c => c.status === 'replied').length, color: 'text-emerald-600' },
                    ].map(s => (
                      <div key={s.label} className={`${card} rounded-xl p-4 shadow-sm text-center`}>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className={`text-xs ${sub} mt-1`}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className={`${card} rounded-xl shadow-sm overflow-hidden`}>
                    <div className="grid lg:grid-cols-5 min-h-[560px]">
                      <div className={`lg:col-span-2 border-r ${bdr} flex flex-col`}>
                        <div className={`p-4 border-b ${bdr} flex items-center justify-between`}>
                          <h3 className={`font-semibold ${text}`}>Contact Messages</h3>
                          <select value={contactFilter} onChange={e => setContactFilter(e.target.value)}
                            className={`text-xs border ${bdr} rounded-lg px-2 py-1 ${text} ${darkMode ? 'bg-gray-700' : 'bg-white'} focus:outline-none`}>
                            <option value="all">সব</option>
                            <option value="unread">অপঠিত</option>
                            <option value="read">পঠিত</option>
                            <option value="replied">Reply দেওয়া</option>
                          </select>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          {contacts.filter(c => contactFilter === 'all' || c.status === contactFilter).length === 0 ? (
                            <div className={`p-8 text-center ${sub} text-sm`}>কোনো message নেই</div>
                          ) : (
                            contacts.filter(c => contactFilter === 'all' || c.status === contactFilter).map(c => (
                              <button key={c.id} onClick={() => { setSelectedContact(c); if (c.status === 'unread') handleMarkRead(c.id); }}
                                className={`w-full p-4 border-b ${bdr} text-left transition ${selectedContact?.id === c.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : `hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}`}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-semibold text-sm truncate ${text}`}>{c.name}</p>
                                    <p className={`text-xs truncate ${sub}`}>{c.email}</p>
                                    <p className={`text-xs mt-1 truncate ${sub}`}>{c.message?.slice(0, 50)}...</p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                                      {c.status === 'unread' ? 'নতুন' : c.status === 'read' ? 'পঠিত' : 'Reply দেওয়া'}
                                    </span>
                                    <span className={`text-xs ${sub}`}>{c.created_at?.slice(0, 10)}</span>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="lg:col-span-3 flex flex-col">
                        {selectedContact ? (
                          <>
                            <div className={`p-4 border-b ${bdr} flex items-center justify-between`}>
                              <div>
                                <p className={`font-semibold ${text}`}>{selectedContact.name}</p>
                                <p className={`text-xs ${sub}`}>{selectedContact.email}{selectedContact.company ? ` · ${selectedContact.company}` : ''}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContact.status)}`}>
                                  {selectedContact.status === 'unread' ? 'নতুন' : selectedContact.status === 'read' ? 'পঠিত' : 'Reply দেওয়া'}
                                </span>
                                <button onClick={() => setContactDeleteConfirm(selectedContact.id)} className="p-1.5 rounded hover:bg-red-50 transition">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                            <div className={`flex-1 p-5 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                              <div className={`${card} rounded-xl p-4 border ${bdr}`}>
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-emerald-700 font-bold text-sm">{selectedContact.name?.charAt(0)?.toUpperCase()}</span>
                                  </div>
                                  <div>
                                    <p className={`text-sm font-semibold ${text}`}>{selectedContact.name}</p>
                                    <p className={`text-xs ${sub}`}>{selectedContact.created_at?.slice(0, 16).replace('T', ' ')}</p>
                                  </div>
                                </div>
                                <p className={`text-sm leading-relaxed ${text} whitespace-pre-wrap`}>{selectedContact.message}</p>
                              </div>
                            </div>
                            <div className={`p-4 border-t ${bdr} ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                              <p className={`text-xs font-medium mb-2 ${sub}`}>
                                Reply to: <span className="font-semibold text-emerald-600">{selectedContact.email}</span>
                                {selectedContact.status === 'replied' && <span className="ml-2 text-emerald-600">· ইতিমধ্যে reply দেওয়া হয়েছে</span>}
                              </p>
                              <textarea rows={4} value={contactReply} onChange={e => setContactReply(e.target.value)}
                                placeholder="এখানে reply লিখুন... (email এ পাঠানো হবে)"
                                className={`w-full border ${bdr} rounded-lg px-3 py-2 text-sm ${text} ${darkMode ? 'bg-gray-700' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mb-3`} />
                              <button onClick={handleContactReply} disabled={!contactReply.trim() || contactReplying}
                                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition">
                                {contactReplying ? <><Loader2 className="w-4 h-4 animate-spin" /> পাঠানো হচ্ছে...</> : <><Mail className="w-4 h-4" /> Email এ Reply পাঠান</>}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className={`flex-1 flex items-center justify-center ${sub} text-sm`}>বাম পাশ থেকে একটি message select করুন</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ACTIVITIES ── */}
              {activeTab === 'activities' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-semibold ${text}`}>Activities ব্যবস্থাপনা</h3>
                    <button onClick={openCreateActivity}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition">
                      <span className="text-lg leading-none font-bold">+</span> নতুন Activity
                    </button>
                  </div>
                  {activities.length === 0 ? (
                    <p className={`text-center py-8 ${sub}`}>কোনো activity নেই</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activities.map((a: any) => (
                        <div key={a.id} className={`border ${bdr} rounded-xl overflow-hidden`}>
                          {a.image_url ? (
                            <img src={a.image_url} alt={a.title} className="w-full h-44 object-cover" />
                          ) : (
                            <div className={`w-full h-44 flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              <Image className={`w-8 h-8 ${sub}`} />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className={`font-semibold ${text} leading-tight`}>{a.title}</h4>
                              <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${a.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                {a.is_active ? 'active' : 'inactive'}
                              </span>
                            </div>
                            {a.category && (
                              <span className="inline-block mb-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                {a.category}
                              </span>
                            )}
                            <p className={`text-sm ${sub} line-clamp-2 mb-4`}>{a.description}</p>
                            <div className="flex gap-2">
                              <button onClick={() => openEditActivity(a)}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-emerald-200 rounded-lg text-xs text-emerald-600 hover:bg-emerald-50 transition">
                                <Edit className="w-3.5 h-3.5" /> সম্পাদনা
                              </button>
                              <button onClick={() => setDeleteActivityConfirm(a.id)}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-red-200 rounded-lg text-xs text-red-500 hover:bg-red-50 transition">
                                <Trash2 className="w-3.5 h-3.5" /> মুছুন
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── ABOUT US ── */}
              {activeTab === 'about' && (
                <div className={`${card} rounded-xl shadow-sm p-6 max-w-2xl`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>About Us</h3>
                  <p className={`${sub} text-sm`}>এই পেজটি এখনো তৈরি হয়নি।</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}