import { FormEvent, useEffect, useRef, useState } from 'react';
import { apiRequest } from '../api';

type Source = {
  source?: string;
  reference?: string;
  text?: string;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp?: string;
};

type Conversation = {
  id: number;
  title: string;
  updatedAt?: string;
};

type AIResponse = {
  success?: boolean;
  answer?: string;
  response?: string;
  message?: string;
  sources?: Source[];
  conversation_id?: number;
  conversationId?: number;
};

const guestKey = 'diin-ai-chat-history';

const welcome: Message = {
  role: 'assistant',
  content:
    'আসসালামু আলাইকুম! আমি Diin AI — কুরআন ও সহীহ হাদিসের আলোকে ইসলামিক প্রশ্নে সাহায্য করতে প্রস্তুত।',
};

export default function DiinAIPage() {
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] =
    useState<number | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiRequest<{
      authenticated: boolean;
      conversationId?: number;
      messages?: Message[];
    }>('/api/v1/ai/history')
      .then((data) => {
        console.log('📚 AI HISTORY:', data);

        setAuthenticated(data.authenticated);
        setConversationId(data.conversationId || null);

        if (data.messages?.length) {
          setMessages(data.messages);
        } else if (!data.authenticated) {
          const saved = JSON.parse(
            localStorage.getItem(guestKey) || '[]'
          ) as Message[];

          if (saved.length) {
            setMessages(saved);
          }
        }

        if (data.authenticated) {
          void loadConversations();
        }
      })
      .catch((reason) => {
        console.error('❌ AI HISTORY ERROR:', reason);

        const saved = JSON.parse(
          localStorage.getItem(guestKey) || '[]'
        ) as Message[];

        if (saved.length) {
          setMessages(saved);
        }
      });
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, loading]);

  const loadConversations = async () => {
    try {
      const data = await apiRequest<{
        conversations: Conversation[];
      }>('/api/v1/ai/conversations');

      console.log('💬 CONVERSATIONS:', data);

      setConversations(data.conversations || []);
    } catch (error) {
      console.error(
        '❌ CONVERSATIONS ERROR:',
        error
      );
    }
  };

  const send = async (event?: FormEvent) => {
    event?.preventDefault();

    const question = input.trim();

    if (!question || loading) {
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setInput('');
    setError('');

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setLoading(true);

    try {
      console.log('🧠 SENDING AI QUESTION:', question);

      const data = await apiRequest<AIResponse>(
        '/api/v1/ai/ask',
        {
          method: 'POST',
          body: JSON.stringify({
            query: question,
            question: question,
            conversation_id: conversationId,
          }),
        }
      );

      console.log('🔥 DIIN AI RAW RESPONSE:', data);
      console.log('🔥 success:', data.success);
      console.log('🔥 answer:', data.answer);
      console.log('🔥 response:', data.response);
      console.log('🔥 sources:', data.sources);

      const answer =
        data.answer ||
        data.response ||
        '';

      if (!answer.trim()) {
        throw new Error(
          data.message ||
          'Colab AI backend did not return an answer.'
        );
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: answer,
        sources: data.sources || [],
        timestamp: new Date().toISOString(),
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);

      setConversationId(
        data.conversation_id ||
        data.conversationId ||
        conversationId
      );

      if (!authenticated) {
        const updatedMessages = [
          ...messages,
          userMessage,
          assistantMessage,
        ];

        localStorage.setItem(
          guestKey,
          JSON.stringify(updatedMessages)
        );
      } else {
        void loadConversations();
      }
    } catch (reason) {
      console.error(
        '❌ DIIN AI ERROR:',
        reason
      );

      setError(
        reason instanceof Error
          ? reason.message
          : 'AI service unavailable.'
      );
    } finally {
      setLoading(false);
    }
  };

  const newChat = async () => {
    try {
      if (authenticated) {
        await apiRequest(
          '/api/v1/ai/new-chat',
          {
            method: 'POST',
          }
        );
      }
    } catch (error) {
      console.error(
        '❌ NEW CHAT ERROR:',
        error
      );
    }

    setConversationId(null);
    setMessages([welcome]);
    setError('');

    if (!authenticated) {
      localStorage.removeItem(guestKey);
    }
  };

  const openConversation = async (id: number) => {
    try {
      const data = await apiRequest<{
        messages: Message[];
      }>(
        `/api/v1/ai/history?conversation_id=${id}`
      );

      console.log(
        '📖 OPEN CONVERSATION:',
        data
      );

      setConversationId(id);

      setMessages(
        data.messages.length
          ? data.messages
          : [welcome]
      );
    } catch (error) {
      console.error(
        '❌ OPEN CONVERSATION ERROR:',
        error
      );
    }
  };

  return (
    <section className="min-h-screen bg-emerald-50 px-4 py-6">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl lg:flex-row">

        <aside className="border-b border-emerald-100 p-4 lg:w-64 lg:border-b-0 lg:border-r">

          <button
            onClick={newChat}
            className="w-full rounded-xl bg-emerald-600 px-3 py-2 font-bold text-white"
          >
            + New chat
          </button>

          {authenticated && (
            <div className="mt-4 space-y-2">
              {conversations.map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    void openConversation(item.id)
                  }
                  className={`w-full rounded-xl p-3 text-left text-sm ${
                    item.id === conversationId
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {item.title || 'New chat'}
                </button>
              ))}
            </div>
          )}

          <p className="mt-5 text-xs text-slate-500">
            {authenticated
              ? 'Saved to your account'
              : 'Guest history is saved in this browser'}
          </p>
        </aside>

        <div className="flex min-h-[75vh] flex-1 flex-col">

          <header className="bg-emerald-700 p-5 text-white">
            <h1 className="text-2xl font-black">
              Diin AI
            </h1>

            <p className="text-sm text-emerald-100">
              Bengali-friendly Islamic learning assistant
            </p>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-7">

            {messages.map((message, index) => (
              <div
                key={`${message.timestamp}-${index}`}
                className={`flex ${
                  message.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-2xl rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'border border-emerald-100 bg-emerald-50 text-slate-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {message.content.replace(
                      '[CONTACT_ADMIN:/contact]',
                      ''
                    )}
                  </p>

                  {message.content.includes(
                    '[CONTACT_ADMIN:/contact]'
                  ) && (
                    <a
                      href="/contact"
                      className="mt-3 inline-block font-bold text-emerald-700 underline"
                    >
                      যোগাযোগ করুন / Contact Admin
                    </a>
                  )}

                  {message.sources?.length ? (
                    <details className="mt-3 text-xs">
                      <summary className="cursor-pointer font-bold">
                        Sources and references
                      </summary>

                      {message.sources.map(
                        (source, sourceIndex) => (
                          <p
                            key={sourceIndex}
                            className="mt-1"
                          >
                            {source.source ||
                              'Knowledge Base'}{' '}
                            —{' '}
                            {source.reference ||
                              source.text}
                          </p>
                        )
                      )}
                    </details>
                  ) : null}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-sm text-slate-500">
                AI উত্তর প্রস্তুত করছে…
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div className="border-t p-4">

            <div className="mb-3 flex flex-wrap gap-2">
              {[
                'কুরআনে সালাতের গুরুত্ব কী?',
                'রোজার নিয়ত কী?',
                'যাকাত কীভাবে হিসাব করতে হয়?',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="rounded-full border border-emerald-200 px-3 py-1 text-xs text-emerald-700"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) =>
                void send(event)
              }
              className="flex gap-2"
            >
              <textarea
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                placeholder="ইসলাম সম্পর্কিত প্রশ্ন লিখুন…"
                className="flex-1 resize-none rounded-xl border p-3 outline-none focus:border-emerald-500"
              />

              <button
                disabled={loading}
                className="rounded-xl bg-emerald-600 px-5 font-bold text-white disabled:opacity-50"
              >
                পাঠান
              </button>
            </form>

            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
