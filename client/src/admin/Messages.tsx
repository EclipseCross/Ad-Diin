import { useState } from 'react';
import { Image as ImageIcon, Search } from 'lucide-react';
import { ThemeProps, API_URL, authHeaders } from './shared';

interface MessagesProps extends ThemeProps {
  conversations: any[];
}

export default function Messages({ card, text, sub, bdr, inputCls, conversations }: MessagesProps) {
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  const loadMessages = async (conversationId: number) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/messages/${conversationId}`, { headers: authHeaders() });
      const d = await r.json();
      if (d.success) setMessages(d.messages || []);
    } catch (err) { console.error(err); }
  };

  const handleSelect = async (conv: any) => {
    setSelected(conv);
    setInput('');
    setImageFile(null);
    await loadMessages(conv.id);
  };

  const handleSend = async () => {
    if ((!input.trim() && !imageFile) || !selected) return;
    setSending(true);
    try {
      const body = new FormData();
      if (input.trim()) body.append('message', input.trim());
      if (imageFile) body.append('image', imageFile);
      const { 'Content-Type': _contentType, ...headers } = authHeaders();
      const r = await fetch(`${API_URL}/api/v1/messages/${selected.id}/send`, {
        method: 'POST', headers, body,
      });
      const d = await r.json();
      if (d.success) {
        setMessages(prev => [...prev, d.message]);
        setInput('');
        setImageFile(null);
        setSelected((prev: any) => ({ ...prev, updated_at: new Date().toISOString() }));
      }
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  const handleDeleteConversation = async (conversation: any) => {
    const forEveryone = window.confirm('Delete this conversation for everyone?\n\nChoose Cancel to hide it only from your admin inbox.');
    if (!forEveryone && !window.confirm('Hide this conversation only for your admin account?')) return;
    try {
      const r = await fetch(`${API_URL}/api/v1/messages/${conversation.id}/${forEveryone ? 'delete-for-everyone' : 'delete-for-me'}`, {
        method: 'POST', headers: authHeaders(),
      });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.message || 'Delete failed');
      setSelected((current: any) => current?.id === conversation.id ? null : current);
      setMessages([]);
      window.location.reload();
    } catch (err: any) {
      window.alert(err.message || 'Could not delete conversation');
    } finally {
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!selected) return;
    const forEveryone = window.confirm('Delete this message for everyone?\n\nChoose Cancel to delete it only for your admin account.');
    if (!forEveryone && !window.confirm('Delete this message only for your admin account?')) return;
    try {
      const r = await fetch(`${API_URL}/api/v1/messages/${selected.id}/messages/${messageId}/${forEveryone ? 'delete-for-everyone' : 'delete-for-me'}`, {
        method: 'POST', headers: authHeaders(),
      });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.message || 'Delete failed');
      setMessages((items) => items.filter((item) => item.id !== messageId));
    } catch (err: any) {
      window.alert(err.message || 'Could not delete message');
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const query = search.trim().toLowerCase();
    return !query || `${conv.user?.name || ''} ${conv.user?.email || ''}`.toLowerCase().includes(query);
  });

  void handleDeleteConversation;
  void handleDeleteMessage;

  return (
    <div className={`${card} rounded-xl shadow-sm p-6 w-full max-w-6xl`}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className={`text-xl font-semibold ${text}`}>Live support inbox</h3>
          <p className={`mt-1 text-sm ${sub}`}>Reply, mark conversations closed, or remove old chats.</p>
        </div>
        <label className={`flex items-center gap-2 rounded-lg border ${bdr} px-3 py-2`}>
          <Search className={`h-4 w-4 ${sub}`} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users" className={`w-44 bg-transparent text-sm outline-none ${text}`} />
        </label>
      </div>
      <div className="grid gap-6 lg:grid-cols-3 min-h-[500px]">
        {/* Conversation List */}
        <div className={`${card} rounded-lg border ${bdr} overflow-hidden flex flex-col`}>
          <div className="bg-emerald-600 text-white p-4 font-semibold">Conversations</div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No conversations</div>
            ) : (
              filteredConversations.map(conv => (
                <div key={conv.id} className={`flex items-center gap-2 border-b ${bdr} ${selected?.id === conv.id ? 'bg-emerald-50/10 border-l-4 border-l-emerald-500' : ''}`}>
                  <button onClick={() => handleSelect(conv)}
                    className="min-w-0 flex-1 p-4 text-left transition hover:bg-emerald-50/10">
                    <p className={`font-semibold text-sm ${text}`}>{conv.user?.name || 'User'}</p>
                    <p className={`truncate text-xs ${sub}`}>{conv.user?.email}</p>
                    <p className={`mt-1 truncate text-xs ${sub}`}>{conv.lastMessage?.message || 'No messages'}</p>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Panel */}
        <div className={`lg:col-span-2 ${card} rounded-lg border ${bdr} overflow-hidden flex flex-col`}>
          {selected ? (
            <>
              <div className="bg-emerald-600 text-white p-4 flex items-center justify-between font-semibold">
                <div>
                  <p className="text-sm opacity-90">Conversation with</p>
                  <p>{selected.user?.name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selected.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {selected.status}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-center">
                    <p>No messages yet. Start replying!</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`group relative max-w-xs px-4 py-2 rounded-lg ${msg.sender_type === 'admin' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-900 rounded-bl-none'}`}>
                        <p className="text-xs opacity-70 mb-1">{msg.sender?.name}</p>
                        <p className="text-sm">{msg.message}</p>
                        {msg.image_url && <a href={msg.image_url} target="_blank" rel="noreferrer" className="mt-2 block"><img src={msg.image_url} alt="Message attachment" className="max-h-64 max-w-full rounded-xl object-cover" /></a>}
                        <p className="text-xs opacity-50 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className={`border-t ${bdr} p-4 bg-white`}>
                {selected.status === 'active' ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <label className="cursor-pointer rounded-lg border border-emerald-200 px-3 py-2 text-emerald-600 hover:bg-emerald-50" title="Attach image">
                        <ImageIcon className="h-5 w-5" />
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            window.alert('Image must be 10 MB or smaller');
                            return;
                          }
                          setImageFile(file);
                          e.target.value = '';
                        }} />
                      </label>
                      <input type="text" value={input} onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type your reply..." className={inputCls} />
                      <button onClick={handleSend} disabled={(!input.trim() && !imageFile) || sending}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-semibold">Send</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-sm text-red-600 font-semibold">This conversation is closed</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-center">
              <p>Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
