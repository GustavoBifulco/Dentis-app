
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import ReactMarkdown from 'react-markdown';
import { ViewType } from '../../types';

interface ChatInterfaceProps {
    mode: 'floating' | 'page';
    conversationId?: number;
    onClose?: () => void;
    // If we need navigation capability inside chat (e.g. to open a patient)
    onNavigate?: (view: ViewType, data?: any) => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    createdAt?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ mode, conversationId: initialConvId, onClose }) => {
    const { getToken } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<number | undefined>(initialConvId);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Load history if conversationId is present
    useEffect(() => {
        const loadHistory = async () => {
            if (conversationId) {
                const token = await getToken();
                if (!token) return;

                try {
                    const res = await fetch(`/api/ai/conversations/${conversationId}/messages`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (Array.isArray(data)) setMessages(data);
                } catch (err) {
                    console.error("Failed to load history", err);
                }
            } else if (messages.length === 0) {
                // Initial greeting
                setMessages([{ role: 'assistant', content: 'Olá! Como posso ajudar sua clínica hoje?' }]);
            }
        };
        loadHistory();
    }, [conversationId, getToken]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const token = await getToken();
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMsg,
                    conversationId,
                    context: {
                        mode,
                        timestamp: new Date().toISOString()
                    }
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to send message');

            if (data.conversationId && !conversationId) {
                setConversationId(data.conversationId);
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        } catch (error: any) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: `**Erro:** ${error.message || 'Falha na conexão.'}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const isFloating = mode === 'floating';

    return (
        <div className={`flex flex-col h-full bg-slate-50 ${isFloating ? 'rounded-2xl' : ''}`}>
            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                            }`}>
                            {msg.role === 'assistant' ? (
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                            <Sparkles size={16} className="text-blue-500 animate-pulse" />
                            <span className="text-xs text-slate-500">Gerando resposta...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 rounded-b-2xl">
                <div className="flex gap-2 items-end">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Digite algo..."
                        className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[44px] max-h-32"
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm h-[44px] flex items-center justify-center"
                    >
                        {isLoading ? <span className="animate-spin text-white">⟳</span> : <Send size={18} />}
                    </button>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-slate-400">Dentis AI pode cometer erros. Verifique informações clínicas importantes.</span>
                </div>
            </div>
        </div>
    );
};
