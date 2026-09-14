import { useState } from 'react';
import { Edit, Save, Loader2, X } from 'lucide-react';
import { ThemeProps, toInputTime, API_URL, authHeaders } from './shared';

interface PrayerTimesProps extends ThemeProps {
  prayerTimes: any[];
  setPrayerTimes: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function PrayerTimes({
  darkMode, card, text, sub, bdr,
  prayerTimes, setPrayerTimes,
}: PrayerTimesProps) {
  const [editingPrayer, setEditingPrayer]   = useState<any | null>(null);
  const [editPrayerTime, setEditPrayerTime] = useState('');
  const [editSaving, setEditSaving]         = useState(false);
  const [editError, setEditError]           = useState('');

  const handleOpenEdit = (prayer: any) => {
    setEditingPrayer(prayer);
    setEditPrayerTime(toInputTime(prayer.prayer_time || prayer.time || ''));
    setEditError('');
  };

  const handleSave = async () => {
    if (!editingPrayer) return;
    if (!editPrayerTime) { setEditError('সময় দিন'); return; }
    setEditSaving(true);
    setEditError('');
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/prayer-times/${editingPrayer.id}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ prayer_time: editPrayerTime + ':00' }),
      });
      const d = await r.json();
      if (d.success) {
        setPrayerTimes(prev => prev.map(p =>
          p.id === editingPrayer.id
            ? { ...p, prayer_time: editPrayerTime + ':00', time: d.data?.time || editPrayerTime }
            : p
        ));
        setEditingPrayer(null);
      } else {
        setEditError(d.errors?.prayer_time?.[0] || d.message || 'Update failed');
      }
    } catch { setEditError('Network error'); }
    finally { setEditSaving(false); }
  };

  return (
    <>
      {/* Edit Modal */}
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
              <input
                type="time"
                value={editPrayerTime}
                onChange={e => setEditPrayerTime(e.target.value)}
                className={`w-full border ${bdr} rounded-lg px-3 py-2 text-lg ${text} ${darkMode ? 'bg-gray-700' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              />
              <p className={`text-xs mt-1 ${sub}`}>বর্তমান সময়: {editingPrayer.time || editingPrayer.prayer_time}</p>
            </div>
            {editError && <p className="text-red-500 text-sm mb-3">{editError}</p>}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingPrayer(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm ${text}`}>বাতিল</button>
              <button onClick={handleSave} disabled={editSaving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50">
                {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`${card} rounded-xl shadow-sm p-6`}>
        <h3 className={`text-xl font-semibold mb-6 ${text}`}>নামাজের সময়সূচি</h3>
        {prayerTimes.length === 0 ? (
          <p className={`text-center py-8 ${sub}`}>কোনো তথ্য নেই</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  {['নাম (বাংলা)', 'নাম (ইংরেজি)', 'সময়', 'ধরন', 'ক্যাটাগরি', 'স্ট্যাটাস', 'Action'].map(h => (
                    <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prayerTimes.map((p: any) => (
                  <tr key={p.id} className={`border-b ${bdr}`}>
                    <td className={`p-3 font-medium ${text}`}>{p.display_name_bn}</td>
                    <td className={`p-3 ${sub}`}>{p.display_name_en}</td>
                    <td className="p-3 font-bold text-emerald-600 text-base">{p.time || p.prayer_time}</td>
                    <td className={`p-3 ${sub}`}>{p.prayer_type}</td>
                    <td className={`p-3 ${sub}`}>{p.category}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {p.is_active ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleOpenEdit(p)} className="p-1 rounded hover:bg-emerald-50">
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
    </>
  );
}