import React, { useEffect, useRef, useState } from "react";

interface Source {
  source: string;
  reference: string;
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  sources?: Source[];
}

const offTopicKeywords = [
  "movie",
  "film",
  "নাটক",
  "সিনেমা",
  "গান",
  "music",
  "cricket",
  "football",
  "খেলা",
  "game",
  "politics",
  "রাজনীতি",
  "love",
  "প্রেম",
  "girlfriend",
  "boyfriend",
  "sex",
  "cooking",
  "recipe",
  "রান্না",
  "business",
  "stock",
  "share market",
  "crypto",
  "hack",
  "হ্যাক",
  "joke",
  "মজা",
  "funny",
  "entertainment",
  "gossip",
  "news",
  "খবর",
  "weather",
  "আবহাওয়া",
  "tiktok",
  "youtube",
  "instagram",
  "facebook",
  "social media",
  "school",
  "college",
  "university",
  "job",
  "চাকরি",
  "doctor",
  "medicine",
  "ওষুধ",
  "hospital",
  "programming",
  "coding",
  "python",
  "javascript",
  "react",
  "visa",
  "passport",
  "travel",
  "ভ্রমণ",
];

const isOffTopic = (text: string): boolean => {
  const lower = text.toLowerCase();

  return offTopicKeywords.some((keyword) =>
    lower.includes(keyword.toLowerCase())
  );
};

const fixedReply = `আমি শুধুমাত্র ইসলামিক বিষয়ে সাহায্য করতে পারি। যেমন:

- কুরআন ও তাফসির
- হাদিস ও সুন্নাহ
- নামাজ, রোজা, যাকাত, হজ
- আকিদা ও ফিকহ
- ইসলামিক ইতিহাস
- হালাল-হারাম বিষয়

অনুগ্রহ করে ইসলাম সম্পর্কিত প্রশ্ন করুন। 🕌`;

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_ENDPOINT ||
  "http://127.0.0.1:8000";

export default function DiinAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text:
        "আসসালামু আলাইকুম! আমি Diin AI - আপনার ব্যক্তিগত ইসলামিক সহায়ক। ইসলামের যেকোনো বিষয়ে প্রশ্ন করুন, আমি কুরআন ও হাদিসের আলোকে উত্তর দেওয়ার চেষ্টা করব।",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading, isFiltered]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) {
      return;
    }

    const currentInput = inputText.trim();

    const userMessage: Message = {
      id: Date.now(),
      text: currentInput,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // -----------------------------------------
    // Frontend Islamic topic filter
    // -----------------------------------------

    if (isOffTopic(currentInput)) {
      setIsFiltered(true);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: fixedReply,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);

        setIsFiltered(false);
      }, 600);

      return;
    }

    setIsLoading(true);

    try {
      // -----------------------------------------
      // History
      // -----------------------------------------

      const history = messages
        .filter((message) => message.id !== 1)
        .slice(-10)
        .map((message) => ({
          sender: message.sender,
          text: message.text,
        }));

      // -----------------------------------------
      // Laravel backend
      // -----------------------------------------

      const response = await fetch(
        `${BACKEND_URL}/api/v1/ai/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            message: currentInput,
            history: history,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Backend HTTP error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("AI response:", data);

      // -----------------------------------------
      // Backend response
      // -----------------------------------------

      const answer =
        data.response ||
        data.message ||
        "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।";

      // -----------------------------------------
      // Sources
      // -----------------------------------------

      const sources: Source[] = Array.isArray(data.sources)
        ? data.sources
        : [];

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: answer,
          sender: "bot",
          timestamp: new Date(),
          sources: sources,
        },
      ]);
    } catch (error) {
      console.error("AI service error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text:
            "দুঃখিত, AI service-এর সাথে সংযোগ করতে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------
  // Enter key
  // -----------------------------------------

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // -----------------------------------------
  // Clear chat
  // -----------------------------------------

  const handleClear = () => {
    setMessages([
      {
        id: Date.now(),
        text:
          "আসসালামু আলাইকুম! আমি Diin AI - আপনার ব্যক্তিগত ইসলামিক সহায়ক। ইসলামের যেকোনো বিষয়ে প্রশ্ন করুন, আমি কুরআন ও হাদিসের আলোকে উত্তর দেওয়ার চেষ্টা করব।",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);

    setInputText("");
  };

  // -----------------------------------------
  // Suggested questions
  // -----------------------------------------

  const suggestedQuestions = [
    "কুরআনে সালাতের গুরুত্ব কী?",
    "রোজার নিয়ত কী?",
    "যাকাত কীভাবে দিতে হয়?",
    "তাহাজ্জুদ নামাজ কীভাবে পড়ব?",
  ];

  return (
    <div className="flex flex-col max-w-3xl mx-auto h-screen p-4">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="bg-emerald-700 text-white p-4 rounded-t-lg flex items-center justify-between shadow-md">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-full text-2xl">
            🕋
          </div>

          <div>
            <h1 className="text-xl font-bold">
              Diin AI
            </h1>

            <p className="text-sm text-emerald-200">
              ইসলামিক সহায়ক · সর্বদা প্রস্তুত
            </p>
          </div>

        </div>

        <button
          onClick={handleClear}
          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition"
        >
          নতুন কথোপকথন
        </button>

      </div>

      {/* =====================================
          CHAT AREA
      ====================================== */}

      <div className="flex-1 overflow-y-auto p-4 bg-emerald-50/50 flex flex-col gap-4">

        {messages.map((msg) => (

          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            {/* AI avatar */}

            {msg.sender === "bot" && (
              <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs mr-2 mt-1 flex-shrink-0">
                AI
              </div>
            )}

            <div className="max-w-[85%]">

              {/* Message */}

              <div
                className={`p-3 rounded-xl shadow-sm ${
                  msg.sender === "user"
                    ? "bg-emerald-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none border border-emerald-100"
                }`}
              >

                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </p>

                <p
                  className={`text-xs mt-2 ${
                    msg.sender === "user"
                      ? "text-emerald-100"
                      : "text-gray-400"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString(
                    "bn-BD",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>

              </div>

              {/* =================================
                  SOURCES
              ================================== */}

              {msg.sender === "bot" &&
                msg.sources &&
                msg.sources.length > 0 && (

                  <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">

                    <div className="flex items-center gap-2 mb-2">

                      <span className="text-sm">
                        📚
                      </span>

                      <p className="text-xs font-semibold text-emerald-800">
                        সূত্র
                      </p>

                    </div>

                    <div className="space-y-2">

                      {msg.sources.map(
                        (source, index) => (

                          <div
                            key={`${source.reference}-${index}`}
                            className="text-xs text-gray-700"
                          >

                            <p className="font-medium text-emerald-700">
                              {source.source}
                            </p>

                            <p className="text-gray-600">
                              {source.reference}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>
                )}

            </div>

          </div>

        ))}

        {/* =====================================
            LOADING
        ====================================== */}

        {(isLoading || isFiltered) && (

          <div className="flex justify-start">

            <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs mr-2 mt-1 flex-shrink-0">
              AI
            </div>

            <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">

              <div
                className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />

              <div
                className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />

              <div
                className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />

              <span className="text-xs text-gray-400 ml-1">
                {isFiltered
                  ? "যাচাই করছে..."
                  : "উত্তর লিখছে..."}
              </span>

            </div>

          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* =====================================
          SUGGESTED QUESTIONS
      ====================================== */}

      {messages.length <= 2 && (

        <div className="px-4 py-3 bg-white border-x border-emerald-100">

          <p className="text-xs text-gray-400 mb-2">
            কিছু প্রশ্নের উদাহরণ:
          </p>

          <div className="flex flex-wrap gap-2">

            {suggestedQuestions.map((question) => (

              <button
                key={question}
                onClick={() => {
                  setInputText(question);
                }}
                className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full hover:bg-emerald-100 transition"
              >
                {question}
              </button>

            ))}

          </div>

        </div>
      )}

      {/* =====================================
          INPUT
      ====================================== */}

      <div className="flex gap-2 p-4 bg-white border border-t-0 border-emerald-100 rounded-b-lg shadow-sm">

        <textarea
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="ইসলাম সম্পর্কে যেকোনো প্রশ্ন করুন..."
          className="flex-1 px-4 py-2.5 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 resize-none text-sm"
          disabled={isLoading}
          style={{
            minHeight: "42px",
            maxHeight: "120px",
          }}
        />

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isLoading}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${
            !inputText.trim() || isLoading
              ? "bg-emerald-200 text-emerald-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white"
          }`}
        >
          {isLoading ? "..." : "পাঠান"}
        </button>

      </div>

      {/* =====================================
          FOOTER
      ====================================== */}

      <p className="text-center text-xs text-gray-400 mt-2">
        🕌 Diin AI — কুরআন ও হাদিসের আলোকে পরিচালিত
      </p>

    </div>
  );
}