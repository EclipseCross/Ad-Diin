import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function DiinAIPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: 'আসসালামু আলাইকুম! আমি Diin AI - আপনার ব্যক্তিগত ইসলামিক সহায়ক। ইসলামের যেকোনো বিষয়ে প্রশ্ন করুন, আমি কুরআন ও হাদিসের আলোকে উত্তর দেব।',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        // Add user message
        const userMessage: Message = {
            id: messages.length + 1,
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Call Laravel backend which calls Gemini API
            const response = await fetch('http://localhost:8000/api/v1/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: inputText })
            });

            const data = await response.json();

            // Add AI response (completely dynamic, no fixed replies)
            const botMessage: Message = {
                id: messages.length + 2,
                text: data.response || 'দুঃখিত, আমি উত্তর দিতে পারছি না।',
                sender: 'bot',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                id: messages.length + 2,
                text: 'দুঃখিত, নেটওয়ার্ক সমস্যা হচ্ছে।',
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🕋</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Diin AI - ইসলামিক সহায়ক</h1>
                            <p className="text-emerald-100 text-sm mt-1">learn islam</p>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="h-[450px] overflow-y-auto p-4 bg-emerald-50/30">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-4 ${
                                    message.sender === 'user'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white text-gray-800 shadow-sm border border-emerald-100'
                                }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                <p className={`text-xs mt-2 ${
                                    message.sender === 'user' ? 'text-emerald-100' : 'text-gray-500'
                                }`}>
                                    {message.timestamp.toLocaleTimeString('bn-BD', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                    
                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-emerald-100">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">AI উত্তর লিখছে...</p>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-emerald-100 bg-white">
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="আপনার প্রশ্ন লিখুন... (যেকোনো ইসলামিক বিষয়ে)"
                            className="flex-1 px-4 py-3 border border-emerald-200 rounded-lg 
                                     focus:outline-none focus:ring-2 focus:ring-emerald-500
                                     disabled:bg-gray-100"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputText.trim() || isLoading}
                            className={`px-6 py-3 bg-emerald-600 text-white rounded-lg 
                                     hover:bg-emerald-700 transition-colors font-medium
                                     ${(!inputText.trim() || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? '...' : 'পাঠান'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center text-xs text-gray-500">
                <p>⚡ learn islam </p>
            </div>
        </div>
    );
}