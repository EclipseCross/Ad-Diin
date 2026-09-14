import { useState } from 'react';
import { Edit, Trash2, Save, Loader2, X } from 'lucide-react';
import { ThemeProps, API_URL, authHeaders } from './shared';

interface EventsProps extends ThemeProps {
  events: any[];
  setEvents: React.Dispatch<React.SetStateAction<any[]>>;
}

const defaultForm = {
  event_name: '', event_date: '', hijri_date: '', hijri_month: '',
  hijri_day: '', event_type: 'religious', description: '', is_active: true, display_order: '',
};

export default function Events({ darkMode, card, text, sub, bdr, inputCls, events, setEvents }: EventsProps) {
  const [modal, setModal]                = useState<'create' | 'edit' | null>(null);
  const [editingEvent, setEditingEvent]  = useState<any | null>(null);
  const [form, setForm]                 = useState({ ...defaultForm });
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openCreate = () => {
    setForm({ ...defaultForm });
    setError('');
    setModal('create');
  };

  const openEdit = (event: any) => {
    setEditingEvent(event);
    setForm({
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
    setError('');
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.event_name || !form.event_date || !form.event_type) {
      setError('ইভেন্টের নাম, তারিখ ও ধরন আবশ্যক'); return;
    }
    setSaving(true); setError('');
    try {
      const isEdit = modal === 'edit';
      const url = isEdit ? `${API_URL}/api/v1/admin/events/${editingEvent.id}` : `${API_URL}/api/v1/admin/events`;
      const payload = {
        ...form,
        hijri_day:     form.hijri_day     ? parseInt(form.hijri_day)     : null,
        display_order: form.display_order ? parseInt(form.display_order) : null,
      };
      const r = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      const d = await r.json();
      if (d.success) {
        if (isEdit) setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...d.data } : e));
        else        setEvents(prev => [...prev, d.data]);
        setModal(null);
      } else {
        if (d.errors) { const fe = Object.values(d.errors)[0]; setError(Array.isArray(fe) ? fe[0] as string : String(fe)); }
        else setError(d.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/events/${id}`, { method: 'DELETE', headers: authHeaders() });
      const d = await r.json();
      if (d.success) { setEvents(prev => prev.filter(e => e.id != id)); setDeleteConfirm(null); }
      else alert(d.message || 'Delete failed');
    } catch { alert('Network error'); }
  };

  return (
    <>
      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${card} rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
            <h3 className={`text-lg font-bold mb-2 ${text}`}>ইভেন্ট মুছবেন?</h3>
            <p className={`text-sm mb-6 ${sub}`}>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm`}>বাতিল</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">হ্যাঁ, মুছুন</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${card} rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-lg font-bold ${text}`}>{modal === 'create' ? 'নতুন ইভেন্ট যোগ করুন' : 'ইভেন্ট সম্পাদনা করুন'}</h3>
              <button onClick={() => setModal(null)} className={sub}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${sub}`}>ইভেন্টের নাম *</label>
                <input type="text" value={form.event_name} onChange={e => setForm(f => ({ ...f, event_name: e.target.value }))} placeholder="যেমন: ঈদুল ফিতর" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>তারিখ (ইংরেজি) *</label>
                  <input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>ধরন *</label>
                  <select value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))} className={inputCls}>
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
                  <input type="text" value={form.hijri_date} onChange={e => setForm(f => ({ ...f, hijri_date: e.target.value }))} placeholder="যেমন: ১ শাওয়াল ১৪৪৬" className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>হিজরি মাস</label>
                  <input type="text" value={form.hijri_month} onChange={e => setForm(f => ({ ...f, hijri_month: e.target.value }))} placeholder="যেমন: শাওয়াল" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>হিজরি দিন</label>
                  <input type="number" value={form.hijri_day} min="1" max="30" onChange={e => setForm(f => ({ ...f, hijri_day: e.target.value }))} placeholder="১" className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>ক্রম (Display Order)</label>
                  <input type="number" value={form.display_order} min="1" onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} placeholder="1" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${sub}`}>বিবরণ</label>
                <textarea value={form.description} rows={3} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="ইভেন্টের বিবরণ লিখুন..." className={`${inputCls} resize-none`} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="event-active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-emerald-600" />
                <label htmlFor="event-active" className={`text-sm ${text}`}>সক্রিয় রাখুন</label>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            <div className="flex gap-3 justify-end mt-5">
              <button onClick={() => setModal(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm ${text}`}>বাতিল</button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {modal === 'create' ? 'যোগ করুন' : 'আপডেট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`${card} rounded-xl shadow-sm p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${text}`}>ইসলামিক ইভেন্ট</h3>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition">
            <span className="text-lg leading-none font-bold">+</span> নতুন ইভেন্ট
          </button>
        </div>
        {events.length === 0 ? (
          <p className={`text-center py-8 ${sub}`}>কোনো ইভেন্ট নেই</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  {['ইভেন্ট', 'তারিখ', 'হিজরি', 'ধরন', 'স্ট্যাটাস', 'Action'].map(h => (
                    <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((e: any) => (
                  <tr key={e.id} className={`border-b ${bdr}`}>
                    <td className={`p-3 font-medium ${text}`}>{e.event_name}</td>
                    <td className={`p-3 ${sub}`}>{e.event_date}</td>
                    <td className={`p-3 ${sub}`}>{e.hijri_date || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        e.event_type === 'festival'   ? 'bg-green-100 text-green-800' :
                        e.event_type === 'special'    ? 'bg-purple-100 text-purple-800' :
                        e.event_type === 'historical' ? 'bg-orange-100 text-orange-800' :
                        e.event_type === 'religious'  ? 'bg-emerald-100 text-emerald-800' :
                        'bg-blue-100 text-blue-800'}`}>{e.event_type}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${e.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {e.is_active ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(e)} className="p-1 rounded hover:bg-emerald-50"><Edit className="w-4 h-4 text-emerald-600" /></button>
                        <button onClick={() => setDeleteConfirm(e.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
