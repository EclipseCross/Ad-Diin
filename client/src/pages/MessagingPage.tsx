import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, AlertCircle, Loader, Check, CheckCheck, Image as ImageIcon, Smile } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apiBaseUrl } from '../api';

const API_URL = apiBaseUrl;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';


interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  image_url?: string | null;
  sender_type: 'user' | 'admin';
  is_read: boolean;
  created_at: string;
  sender: {
    id: number;
    name: string;
    email: string;
  };
}

interface Conversation {
  id: number;
  user_id: number;
  admin_id: number | null;
  subject: string;
  status: 'active' | 'closed' | 'pending';
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  admin?: {
    id: number;
    name: string;
    email: string;
  };
  lastMessage?: Message;
}

export default function MessagingPage() {
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const conversationRequestInFlight = useRef(false);
  const messagesRequestInFlight = useRef(false);
  const conversationListRevision = useRef(0);

  // Load conversations
  useEffect(() => {
    loadConversations();
    const interval = setInterval(() => loadConversations(true), 8000); // Background refresh
    return () => clearInterval(interval);
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      const interval = setInterval(() => loadMessages(selectedConversation.id, true), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const loadConversations = async (silent = false) => {
    if (conversationRequestInFlight.current) {
      return;
    }

    conversationRequestInFlight.current = true;
    const requestRevision = conversationListRevision.current;

    try {
      if (!silent) {
        setError(null);
      }
      const token = localStorage.getItem('token');
      
      console.log('Loading conversations... Token present:', !!token);
      
      if (!token) {
        setError('Not authenticated. Redirecting to login...');
        setLoading(false);
        console.warn('No token found');
        navigate('/user-login', { state: { from: '/messaging' } });
        return;
      }

      console.log('Fetching from:', `${API_URL}/api/v1/messages`);
      const response = await axios.get(`${API_URL}/api/v1/messages`, {
        params: { refresh: Date.now() },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      console.log('Conversations response:', response.data);
      
      if (!response.data.success) {
        const errorMsg = response.data.message || 'Failed to load conversations';
        setError(errorMsg);
        setLoading(false);
        if (String(errorMsg).toLowerCase().includes('unauthenticated')) {
          navigate('/user-login', { state: { from: '/messaging' } });
        }
        return;
      }

      // Ignore a response from a poll that started before a conversation was deleted.
      if (requestRevision !== conversationListRevision.current) {
        return;
      }

      const loadedConversations = (response.data.conversations || []).map((conversation: Conversation) => ({
        ...conversation,
        status: 'active' as const,
      }));
      console.log('Conversations loaded:', response.data.conversations?.length || 0);

      // Open the user's existing support thread automatically. Without this,
      // the page stays on the empty state even though the API returned a chat.
      if (loadedConversations.length > 0) {
        setSelectedConversation((current) => {
          const currentConversation = current
            ? loadedConversations.find((conversation: Conversation) => conversation.id === current.id)
            : null;
          return currentConversation || loadedConversations[0];
        });
      }

      // Load unread count
      try {
        const unreadRes = await axios.get(`${API_URL}/api/v1/messages/unread`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        });
        if (unreadRes.data.success) {
          setUnreadCount(unreadRes.data.unread_count);
        }
      } catch (err) {
        console.warn('Failed to load unread count:', err);
      }
      
      setLoading(false);

      // Users have one support thread, like messaging a Facebook Page.
      // Create it automatically instead of showing a "New Message" action.
      if (!silent && loadedConversations.length === 0) {
        await startNewConversation();
      }
    } catch (error: any) {
      console.error('Failed to load conversations:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load conversations';
      // Background polling timeout should not block the chat UI.
      if (!silent || !String(errorMsg).toLowerCase().includes('timeout')) {
        setError(errorMsg);
      }
      setLoading(false);
      if (error.response?.status === 401 || String(errorMsg).toLowerCase().includes('unauthenticated')) {
        navigate('/user-login', { state: { from: '/messaging' } });
      }
      if (!silent) {
        toast.error('Error: ' + errorMsg);
      }
    } finally {
      conversationRequestInFlight.current = false;
    }
  };

  const loadMessages = async (conversationId: number, silent = false) => {
    if (messagesRequestInFlight.current) {
      return;
    }

    messagesRequestInFlight.current = true;

    try {
      if (!silent) {
        setError(null);
      }
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/v1/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });
      
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load messages';
      if (!silent || !String(errorMsg).toLowerCase().includes('timeout')) {
        setError(errorMsg);
      }
    } finally {
      messagesRequestInFlight.current = false;
    }
  };

  const startNewConversation = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      console.log('Creating new conversation... Token present:', !!token);
      
      if (!token) {
        setError('Not authenticated. Please login first.');
        toast.error('Please login to create a conversation');
        return;
      }

      setLoading(true);
      console.log('POST to:', `${API_URL}/api/v1/messages/create`);
      
      const response = await axios.post(
        `${API_URL}/api/v1/messages/create`,
        { subject: 'Support Request' },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log('Create conversation response:', response.data);
      
      if (response.data.success) {
        setSelectedConversation(response.data.conversation);
        await loadConversations(true);
        toast.success('New conversation started');
      } else {
        throw new Error(response.data.message || 'Failed to create conversation');
      }
    } catch (error: any) {
      console.error('Create conversation error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create conversation';
      setError(errorMsg);
      toast.error('Error: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if ((!messageInput.trim() && !imageFile) || !selectedConversation || sending) return;

    try {
      setSending(true);
      setError(null);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      if (messageInput.trim()) formData.append('message', messageInput.trim());
      if (imageFile) formData.append('image', imageFile);
      const response = await axios.post(
        `${API_URL}/api/v1/messages/${selectedConversation.id}/send`,
        formData,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
      );
      
      if (response.data.success) {
        setMessages((items) => [...items, response.data.message]);
        setMessageInput('');
        setImageFile(null);
        loadConversations(true);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to send message';
      setError(errorMsg);
      toast.error('Error: ' + errorMsg);
    } finally {
      setSending(false);
    }
  };

  const addSticker = (sticker: string) => {
    setMessageInput((value) => `${value}${sticker}`);
    setShowStickers(false);
  };

  /* message deletion is intentionally unavailable in the support UI */
  const deleteMessage = async (messageId: number, mode: 'me' | 'everyone') => {
    if (!selectedConversation) return;
    if (!window.confirm(mode === 'everyone' ? 'Delete this message for everyone?' : 'Delete this message only for you?')) return;
    try {
      await axios.post(`${API_URL}/api/v1/messages/${selectedConversation.id}/messages/${messageId}/delete-for-${mode}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        timeout: 10000,
      });
      setMessages((items) => items.filter((item) => item.id !== messageId));
      toast.success('Message deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete message');
    }
  };

  void deleteMessage;

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-100/50 px-4 py-10 md:px-8 md:py-14">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-slate-600 font-semibold">Loading conversations...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadConversations();
                }}
                className="mt-2 text-sm text-red-700 hover:text-red-900 underline font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && (
          <>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
            <MessageCircle className="h-10 w-10 text-emerald-600" />
            Support Center
          </h1>
          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
            Direct support
          </span>
        </div>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm font-semibold text-blue-800">
            You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
          </div>
        )}

        <div className="min-h-[680px]">
          {/* Single Facebook-Page-style support thread */}
          <div className="rounded-3xl border border-emerald-200/80 bg-white/95 shadow-xl overflow-hidden flex min-h-[680px] flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white font-bold flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Conversation with</p>
                    <p className="text-lg">
                      {selectedConversation.admin?.name || 'Support Team'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`group relative max-w-xs px-4 py-2 rounded-lg ${
                            msg.sender_type === 'user'
                              ? 'bg-emerald-600 text-white rounded-br-none'
                              : 'bg-slate-200 text-slate-900 rounded-bl-none'
                          }`}
                        >
                          <p className="text-xs opacity-70 mb-1">
                            {msg.sender?.name}
                          </p>
                          <p className="text-sm">{msg.message}</p>
                          {msg.image_url && (
                            <a href={msg.image_url} target="_blank" rel="noreferrer" className="mt-2 block">
                              <img src={msg.image_url} alt="Message attachment" className="max-h-64 max-w-full rounded-xl object-cover" />
                            </a>
                          )}
                          <p className="text-xs opacity-50 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            {msg.sender_type === 'user' && (
                              <span className="ml-2 inline-flex items-center gap-1" title={msg.is_read ? 'Seen' : 'Sent'}>
                                {msg.is_read ? <><CheckCheck className="h-3.5 w-3.5 text-sky-300" /> Seen</> : <><Check className="h-3.5 w-3.5" /> Sent</>}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-emerald-200 p-4 bg-white">
                    {imageFile && (
                      <div className="mb-3 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                        <span className="truncate">{imageFile.name}</span>
                        <button type="button" onClick={() => setImageFile(null)} className="ml-3 font-semibold hover:text-red-600">Remove</button>
                      </div>
                    )}
                    {showStickers && (
                      <div className="mb-3 flex flex-wrap gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                        {['👍', '❤️', '😂', '😊', '🤲', '🕌', '✨', '🎉'].map((sticker) => (
                          <button key={sticker} type="button" onClick={() => addSticker(sticker)} className="rounded-lg bg-white px-3 py-2 text-xl shadow-sm hover:bg-emerald-100">
                            {sticker}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" title="Attach image">
                        <ImageIcon className="h-5 w-5" />
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error('Image must be 10 MB or smaller');
                            return;
                          }
                          setImageFile(file);
                          event.target.value = '';
                        }} />
                      </label>
                      <button type="button" onClick={() => setShowStickers((value) => !value)} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" title="Stickers and emoji">
                        <Smile className="h-5 w-5" />
                      </button>
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            void sendMessage();
                          }
                        }}
                        placeholder="Type your message..."
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={(!messageInput.trim() && !imageFile) || sending}
                        className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-700 disabled:bg-gray-400"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-semibold">Select a conversation to start</p>
                  <p className="text-sm mt-2">or create a new one to get support</p>
                </div>
              </div>
            )}
          </div>
        </div>

          </>
        )}
      </div>
    </section>
  );
}
