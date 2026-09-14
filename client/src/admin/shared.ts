export const API_URL = import.meta.env.VITE_BACKEND_ENDPOINT || 'http://127.0.0.1:8000';

export function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
  };
}

export function toArray(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

export const categoryNames: Record<string, string> = {
  zakat: 'যাকাত', iftar: 'ইফতার', durjog: 'দুর্গত',
  sitarto: 'শীতার্ত', gachropon: 'গাছরোপণ',
  kurbani: 'কুরবানি', orphan: 'এতিম', general: 'সাধারণ',
};

export const categoryColors: Record<string, string> = {
  zakat:     'bg-emerald-500', iftar:     'bg-orange-500',
  durjog:    'bg-red-500',     sitarto:   'bg-blue-500',
  gachropon: 'bg-green-500',   kurbani:   'bg-amber-500',
  orphan:    'bg-purple-500',  general:   'bg-gray-500',
};

export function getStatusColor(status: string) {
  switch (status) {
    case 'completed': case 'active': case 'approved': return 'bg-green-100 text-green-800';
    case 'processing': case 'read':  return 'bg-blue-100 text-blue-800';
    case 'pending':   case 'unread': return 'bg-yellow-100 text-yellow-800';
    case 'failed':    case 'rejected': return 'bg-red-100 text-red-800';
    case 'replied':   return 'bg-emerald-100 text-emerald-800';
    case 'inactive':  return 'bg-gray-100 text-gray-800';
    default:          return 'bg-gray-100 text-gray-800';
  }
}

export function toInputTime(timeStr: string): string {
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

export interface ThemeProps {
  darkMode: boolean;
  bg: string;
  card: string;
  text: string;
  sub: string;
  bdr: string;
  inputCls: string;
}

export function buildTheme(darkMode: boolean): ThemeProps {
  const bdr = darkMode ? 'border-gray-700' : 'border-gray-200';
  return {
    darkMode,
    bg:       darkMode ? 'bg-gray-900' : 'bg-gray-50',
    card:     darkMode ? 'bg-gray-800' : 'bg-white',
    text:     darkMode ? 'text-white'  : 'text-gray-900',
    sub:      darkMode ? 'text-gray-400' : 'text-gray-500',
    bdr,
    inputCls: `w-full border ${bdr} rounded-lg px-3 py-2 text-sm ${darkMode ? 'text-white bg-gray-700' : 'text-gray-900 bg-white'} focus:outline-none focus:ring-2 focus:ring-emerald-500`,
  };
}