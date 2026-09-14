import { useState } from 'react';
import { Trash2, Loader2, Mail } from 'lucide-react';
import { ThemeProps, API_URL, authHeaders, getStatusColor } from './shared';

interface ContactProps extends ThemeProps {
  contacts: any[];
  setContacts: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function Contact({ darkMode, card, text, sub, bdr, contacts, setContacts }: ContactProps) {
  const [selected, setSelected]           = useState<any | null>(null);
  const [reply, setReply]                 = useState('');
  const [replying, setReplying]           = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filter, setFilter]               = useState('all');

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/v1/admin/contact/${id}/read`, { method: 'PATCH', headers: authHeaders() });
      setContacts(prev => prev.map(c => c.id == id ? { ...c, status: 'read' } : c));
      if (selected?.id == id) setSelected((p: any) => ({ ...p, status: 'read' }));
    } catch (err) { console.error(err); }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setReplying(true);
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/contact/${selected.id}/reply`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ reply_message: reply }),
      });
      const d = await r.json();
      if (d.success) {
        setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, status: 'replied' } : c));
        setSelected((p: any) => ({ ...p, status: 'replied' }));
        setReply('');
        alert('✓ Reply পাঠানো হয়েছে!');
      } else {
        alert(d.message || 'Reply পাঠাতে ব্যর্থ হয়েছে');
      }
    } catch { alert('Network error'); }
    finally { setReplying(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/contact/${id}`, { method: 'DELETE', headers: authHeaders() });
      const d = await r.json();
      if (d.success) {
        setContacts(prev => prev.filter(c => c.id != id));
        if (selected?.id == id) setSelected(null);
        setDeleteConfirm(null);
      } else {
        alert(d.message || 'Delete failed');
      }
    } catch { alert('Network error'); }
  };

  const filtered = contacts.filter(c => filter === 'all' || c.status === filter);

  return (
    <>
      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${card} rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
            <h3 className={`text-lg font-bold mb-2 ${text}`}>Message মুছবেন?</h3>
            <p className={`text-sm mb-6 ${sub}`}>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm`}>বাতিল</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">হ্যাঁ, মুছুন</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Stats */}
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
            {/* List */}
            <div className={`lg:col-span-2 border-r ${bdr} flex flex-col`}>
              <div className={`p-4 border-b ${bdr} flex items-center justify-between`}>
                <h3 className={`font-semibold ${text}`}>Contact Messages</h3>
                <select value={filter} onChange={e => setFilter(e.target.value)}
                  className={`text-xs border ${bdr} rounded-lg px-2 py-1 ${text} ${darkMode ? 'bg-gray-700' : 'bg-white'} focus:outline-none`}>
                  <option value="all">সব</option>
                  <option value="unread">অপঠিত</option>
                  <option value="read">পঠিত</option>
                  <option value="replied">Reply দেওয়া</option>
                </select>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className={`p-8 text-center ${sub} text-sm`}>কোনো message নেই</div>
                ) : (
                  filtered.map(c => (
                    <button key={c.id}
                      onClick={() => { setSelected(c); if (c.status === 'unread') handleMarkRead(c.id); }}
                      className={`w-full p-4 border-b ${bdr} text-left transition ${selected?.id === c.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : `hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}`}>
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

            {/* Detail */}
            <div className="lg:col-span-3 flex flex-col">
              {selected ? (
                <>
                  <div className={`p-4 border-b ${bdr} flex items-center justify-between`}>
                    <div>
                      <p className={`font-semibold ${text}`}>{selected.name}</p>
                      <p className={`text-xs ${sub}`}>{selected.email}{selected.company ? ` · ${selected.company}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selected.status)}`}>
                        {selected.status === 'unread' ? 'নতুন' : selected.status === 'read' ? 'পঠিত' : 'Reply দেওয়া'}
                      </span>
                      <button onClick={() => setDeleteConfirm(selected.id)} className="p-1.5 rounded hover:bg-red-50 transition">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className={`flex-1 p-5 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className={`${card} rounded-xl p-4 border ${bdr}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-700 font-bold text-sm">{selected.name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${text}`}>{selected.name}</p>
                          <p className={`text-xs ${sub}`}>{selected.created_at?.slice(0, 16).replace('T', ' ')}</p>
                        </div>
                      </div>
                      <p className={`text-sm leading-relaxed ${text} whitespace-pre-wrap`}>{selected.message}</p>
                    </div>
                  </div>
                  <div className={`p-4 border-t ${bdr} ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-xs font-medium mb-2 ${sub}`}>
                      Reply to: <span className="font-semibold text-emerald-600">{selected.email}</span>
                      {selected.status === 'replied' && <span className="ml-2 text-emerald-600">· ইতিমধ্যে reply দেওয়া হয়েছে</span>}
                    </p>
                    <textarea rows={4} value={reply} onChange={e => setReply(e.target.value)}
                      placeholder="এখানে reply লিখুন... (email এ পাঠানো হবে)"
                      className={`w-full border ${bdr} rounded-lg px-3 py-2 text-sm ${text} ${darkMode ? 'bg-gray-700' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mb-3`} />
                    <button onClick={handleReply} disabled={!reply.trim() || replying}
                      className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition">
                      {replying ? <><Loader2 className="w-4 h-4 animate-spin" /> পাঠানো হচ্ছে...</> : <><Mail className="w-4 h-4" /> Email এ Reply পাঠান</>}
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
    </>
  );
}