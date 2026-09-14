import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Phone, Mail, MapPin, Send, Plus, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_BACKEND_ENDPOINT || 'http://127.0.0.1:8000';


interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const conversationRequestInFlight = useRef(false);
  const messagesRequestInFlight = useRef(false);

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

      setConversations(response.data.conversations || []);
      console.log('Conversations loaded:', response.data.conversations?.length || 0);
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
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/v1/messages/${selectedConversation.id}/send`,
        { message: messageInput },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
      );
      
      if (response.data.success) {
        setMessages([...messages, response.data.message]);
        setMessageInput('');
        loadConversations(true);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to send message';
      setError(errorMsg);
      toast.error('Error: ' + errorMsg);
    }
  };

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
          <button
            onClick={startNewConversation}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:bg-gray-400"
          >
            <Plus className="h-5 w-5" />
            New Message
          </button>
        </div>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm font-semibold text-blue-800">
            You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3 min-h-[600px]">
          {/* Conversations List */}
          <div className="rounded-2xl border border-emerald-200/80 bg-white/90 shadow-lg overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white font-bold">
              Conversations
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <p className="text-sm">No conversations yet</p>
                  <button
                    onClick={startNewConversation}
                    className="mt-2 text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                  >
                    Start one now
                  </button>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 border-b border-emerald-100/50 text-left transition ${
                      selectedConversation?.id === conv.id
                        ? 'bg-emerald-50 border-l-4 border-l-emerald-600'
                        : 'hover:bg-emerald-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">
                          {conv.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {conv.lastMessage?.message || 'No messages yet'}
                        </p>
                      </div>
                      {conv.status === 'closed' && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Closed
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 rounded-2xl border border-emerald-200/80 bg-white/90 shadow-lg overflow-hidden flex flex-col">
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
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedConversation.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedConversation.status}
                  </span>
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
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.sender_type === 'user'
                              ? 'bg-emerald-600 text-white rounded-br-none'
                              : 'bg-slate-200 text-slate-900 rounded-bl-none'
                          }`}
                        >
                          <p className="text-xs opacity-70 mb-1">
                            {msg.sender?.name}
                          </p>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-50 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                {selectedConversation.status === 'active' && (
                  <div className="border-t border-emerald-200 p-4 bg-white">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!messageInput.trim()}
                        className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-700 disabled:bg-gray-400"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                {selectedConversation.status === 'closed' && (
                  <div className="border-t border-red-200 bg-red-50 p-4 text-center text-sm text-red-700 font-semibold">
                    This conversation has been closed
                  </div>
                )}
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

        {/* Contact Info */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-emerald-200 bg-white/80 p-4 text-center">
            <Mail className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-900">Email</p>
            <p className="text-sm text-slate-600">info@ad-diin.org</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white/80 p-4 text-center">
            <Phone className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-900">Phone</p>
            <p className="text-sm text-slate-600">+880 1234 567890</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white/80 p-4 text-center">
            <MapPin className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-900">Location</p>
            <p className="text-sm text-slate-600">Dhaka, Bangladesh</p>
          </div>
        </div>
          </>
        )}
      </div>
    </section>
  );
}
