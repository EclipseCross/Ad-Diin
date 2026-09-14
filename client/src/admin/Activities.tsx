import { useState } from 'react';
import { Edit, Trash2, Save, Loader2, X, Image } from 'lucide-react';
import { ThemeProps, API_URL, authHeaders } from './shared';

interface ActivitiesProps extends ThemeProps {
  activities: any[];
  setActivities: React.Dispatch<React.SetStateAction<any[]>>;
}

const defaultForm = { title: '', description: '', category: '', is_active: true, display_order: '' };

export default function Activities({ darkMode, card, text, sub, bdr, inputCls, activities, setActivities }: ActivitiesProps) {
  const [modal, setModal]                       = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing]                   = useState<any | null>(null);
  const [form, setForm]                         = useState({ ...defaultForm });
  const [imageFile, setImageFile]               = useState<File | null>(null);
  const [imagePreview, setImagePreview]         = useState('');
  const [saving, setSaving]                     = useState(false);
  const [error, setError]                       = useState('');
  const [deleteConfirm, setDeleteConfirm]       = useState<string | null>(null);

  const openCreate = () => {
    setForm({ ...defaultForm });
    setImageFile(null);
    setImagePreview('');
    setError('');
    setEditing(null);
    setModal('create');
  };

  const openEdit = (a: any) => {
    setEditing(a);
    setForm({
      title:         a.title       || '',
      description:   a.description || '',
      category:      a.category    || '',
      is_active:     !!a.is_active,
      display_order: a.display_order ? String(a.display_order) : '',
    });
    setImageFile(null);
    setImagePreview(a.image_url || '');
    setError('');
    setModal('edit');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.title || !form.description) { setError('শিরোনাম ও বিবরণ আবশ্যক'); return; }
    setSaving(true); setError('');
    try {
      const formData = new FormData();
      formData.append('title',         form.title);
      formData.append('description',   form.description);
      formData.append('category',      form.category);
      formData.append('is_active',     form.is_active ? '1' : '0');
      formData.append('display_order', form.display_order || '0');
      if (imageFile) formData.append('image', imageFile);

      const isEdit = modal === 'edit';
      const url    = isEdit ? `${API_URL}/api/v1/admin/activities/${editing.id}` : `${API_URL}/api/v1/admin/activities`;
      const token  = localStorage.getItem('token');

      const r = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
        body: formData,
      });
      const d = await r.json();
      if (d.success) {
        if (isEdit) setActivities(prev => prev.map(a => a.id === editing.id ? { ...a, ...d.data } : a));
        else        setActivities(prev => [...prev, d.data]);
        setModal(null);
      } else {
        if (d.errors) { const fe = Object.values(d.errors)[0]; setError(Array.isArray(fe) ? fe[0] as string : String(fe)); }
        else setError(d.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/activities/${id}`, { method: 'DELETE', headers: authHeaders() });
      const d = await r.json();
      if (d.success) { setActivities(prev => prev.filter(a => a.id !== id)); setDeleteConfirm(null); }
      else alert(d.message || 'Delete failed');
    } catch { alert('Network error'); }
  };

  return (
    <>
      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${card} rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
            <h3 className={`text-lg font-bold mb-2 ${text}`}>Activity মুছবেন?</h3>
            <p className={`text-sm mb-6 ${sub}`}>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm`}>বাতিল</button>
              <button onClick={() => handleDelete(Number(deleteConfirm))} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">হ্যাঁ, মুছুন</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${card} rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-lg font-bold ${text}`}>
                {modal === 'create' ? 'নতুন Activity যোগ করুন' : 'Activity সম্পাদনা করুন'}
              </h3>
              <button onClick={() => setModal(null)} className={sub}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${sub}`}>ছবি (Cloudinary)</label>
                <div className={`border-2 border-dashed ${bdr} rounded-lg p-4 text-center`}>
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="preview" className="w-full h-40 object-cover rounded-lg mb-2" />
                      <button onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <Image className={`w-5 h-5 ${sub}`} />
                      </div>
                      <p className={`text-xs ${sub}`}>ছবি বেছে নিন</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="activity-image-input" />
                  <label htmlFor="activity-image-input"
                    className={`mt-2 inline-block cursor-pointer px-4 py-1.5 border ${bdr} rounded-lg text-xs ${text} hover:bg-gray-50 transition`}>
                    {imagePreview ? 'ছবি পরিবর্তন করুন' : 'ছবি বেছে নিন'}
                  </label>
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${sub}`}>শিরোনাম *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="যেমন: Quranic Study" className={inputCls} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${sub}`}>বিবরণ *</label>
                <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Activity এর বিস্তারিত বিবরণ..." className={`${inputCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>ক্যাটাগরি</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
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
                  <input type="number" value={form.display_order} min="0" onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} placeholder="0" className={inputCls} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="activity-active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-emerald-600" />
                <label htmlFor="activity-active" className={`text-sm ${text}`}>সক্রিয় রাখুন</label>
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
          <h3 className={`text-xl font-semibold ${text}`}>Activities ব্যবস্থাপনা</h3>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition">
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
                    <span className="inline-block mb-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">{a.category}</span>
                  )}
                  <p className={`text-sm ${sub} line-clamp-2 mb-4`}>{a.description}</p>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(a)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-emerald-200 rounded-lg text-xs text-emerald-600 hover:bg-emerald-50 transition">
                      <Edit className="w-3.5 h-3.5" /> সম্পাদনা
                    </button>
                    <button onClick={() => setDeleteConfirm(a.id)}
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
    </>
  );
}