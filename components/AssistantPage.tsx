
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChatInterface } from './ai/ChatInterface';
import { MessageSquare, Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Conversation {
    id: number;
    title: string;
    updatedAt: string;
}

export const AssistantPage: React.FC = () => {
    const { getToken } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConvId, setActiveConvId] = useState<number | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            setIsLoading(true);
            const token = await getToken();
            if (!token) return;

            const res = await fetch('/api/ai/conversations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (Array.isArray(data)) {
                setConversations(data);
                if (data.length > 0 && !activeConvId) {
                    // Optional: Auto-select first? Maybe not.
                    // setActiveConvId(data[0].id);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        setActiveConvId(undefined);
    };

    return (
        <div className="flex h-full bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
            {/* Sidebar: History */}
            <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <button
                        onClick={startNewChat}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm font-medium"
                    >
                        <Plus size={18} />
                        Nova Conversa
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoading && <div className="p-4 text-center text-slate-400 text-sm">Carregando...</div>}

                    {conversations.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => setActiveConvId(conv.id)}
                            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition ${activeConvId === conv.id
                                    ? 'bg-white shadow-sm border border-slate-200 text-blue-600'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <MessageSquare size={18} className={activeConvId === conv.id ? 'text-blue-500' : 'text-slate-400'} />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate text-sm">{conv.title}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                    <Clock size={10} />
                                    {format(new Date(conv.updatedAt), "d MMM, HH:mm", { locale: ptBR })}
                                </div>
                            </div>
                        </button>
                    ))}

                    {!isLoading && conversations.length === 0 && (
                        <div className="text-center p-8 text-slate-400 text-sm">
                            Nenhuma conversa anterior.
                        </div>
                    )}
                </div>
            </div>

            {/* Main: Chat */}
            <div className="flex-1 flex flex-col bg-slate-50 relative">
                {/* We use key to force unmount/remount when switching conversations */}
                <ChatInterface
                    key={activeConvId || 'new'}
                    mode="page"
                    conversationId={activeConvId}
                />
            </div>
        </div>
    );
};

export default AssistantPage;
