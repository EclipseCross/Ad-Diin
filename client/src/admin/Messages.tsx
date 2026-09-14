import { useState } from 'react';
import { ThemeProps, API_URL, authHeaders } from './shared';

interface MessagesProps extends ThemeProps {
  conversations: any[];
}

export default function Messages({ card, text, bdr, inputCls, conversations }: MessagesProps) {
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

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
    await loadMessages(conv.id);
  };

  const handleSend = async () => {
    if (!input.trim() || !selected) return;
    setSending(true);
    try {
      const r = await fetch(`${API_URL}/api/v1/messages/${selected.id}/send`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ message: input }),
      });
      const d = await r.json();
      if (d.success) {
        setMessages(prev => [...prev, d.message]);
        setInput('');
        setSelected((prev: any) => ({ ...prev, updated_at: new Date().toISOString() }));
      }
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  const handleClose = async () => {
    if (!selected) return;
    try {
      const r = await fetch(`${API_URL}/api/v1/messages/${selected.id}/close`, {
        method: 'PATCH', headers: authHeaders(),
      });
      const d = await r.json();
      if (d.success) setSelected((prev: any) => ({ ...prev, status: 'closed' }));
    } catch (err) { console.error(err); }
  };

  return (
    <div className={`${card} rounded-xl shadow-sm p-6 w-full max-w-6xl`}>
      <h3 className={`text-xl font-semibold mb-6 ${text}`}>User Messages</h3>
      <div className="grid gap-6 lg:grid-cols-3 min-h-[500px]">
        {/* Conversation List */}
        <div className={`${card} rounded-lg border ${bdr} overflow-hidden flex flex-col`}>
          <div className="bg-emerald-600 text-white p-4 font-semibold">Conversations</div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No conversations</div>
            ) : (
              conversations.map(conv => (
                <button key={conv.id} onClick={() => handleSelect(conv)}
                  className={`w-full p-4 border-b ${bdr} text-left transition ${selected?.id === conv.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : 'hover:bg-gray-50'}`}>
                  <p className={`font-semibold text-sm ${text}`}>{conv.user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{conv.user?.email}</p>
                  <p className="text-xs text-gray-600 mt-1 truncate">{conv.lastMessage?.message || 'No messages'}</p>
                </button>
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
                {selected.status === 'active' ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input type="text" value={input} onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type your reply..." className={inputCls} />
                      <button onClick={handleSend} disabled={!input.trim() || sending}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-semibold">Send</button>
                    </div>
                    <button onClick={handleClose} className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold">Close Conversation</button>
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
