import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContext as AppContextType, UserSession } from '../types';

interface AppContextState {
    session: UserSession | null;
    setSession: (session: UserSession | null) => void;
    switchContext: (context: AppContextType) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    toast: { message: string, type: 'success' | 'error' | 'info' } | null;
}

const AppContextContext = createContext<AppContextState | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<UserSession | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const switchContext = (context: AppContextType) => {
        if (!session) return;

        // Validação de segurança do contexto
        const exists = session.availableContexts.find(c => c.id === context.id);
        if (!exists) {
            showToast('Acesso negado ao contexto', 'error');
            return;
        }

        // Atualização reativa sem reload
        setSession(prev => prev ? ({
            ...prev,
            activeContext: context,
            activeOrganization: context.organizationId ? {
                id: context.organizationId,
                clerkOrgId: '',
                name: context.name,
                type: context.type as any
            } : null
        }) : null);

        localStorage.setItem('activeContext', JSON.stringify(context));
        showToast(`Conectado a: ${context.name}`, 'info');
    };

    useEffect(() => {
        const savedContext = localStorage.getItem('activeContext');
        if (savedContext && session && !session.activeContext) {
            try {
                const context = JSON.parse(savedContext);
                switchContext(context);
            } catch (e) {
                localStorage.removeItem('activeContext');
            }
        }
    }, [session]);

    return (
        <AppContextContext.Provider value={{ session, setSession, switchContext, showToast, toast }}>
            {children}
        </AppContextContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContextContext);
    if (!context) throw new Error('useAppContext must be used within AppContextProvider');
    return context;
};