import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { AppContext as AppContextType, UserSession } from '../types';

interface AppContextState {
    session: UserSession | null;
    setSession: Dispatch<SetStateAction<UserSession | null>>;
    switchContext: (context: AppContextType) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    toast: { message: string, type: 'success' | 'error' | 'info' } | null;
    theme: { mode: 'light' | 'dark', accentColor: string };
    setTheme: Dispatch<SetStateAction<{ mode: 'light' | 'dark', accentColor: string }>>;
}

const AppContextContext = createContext<AppContextState | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    console.log("AppContextProvider rendering");
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
        console.log(`Switching to context: ${context.name} (${context.organizationId})`);
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

    // --- THEME MANAGEMENT ---
    const [theme, setTheme] = useState<{ mode: 'light' | 'dark', accentColor: string }>({
        mode: 'light',
        accentColor: '#2563EB' // Default Blue
    });

    // Initialize Theme from LocalStorage or System Preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('dentis-theme');
        if (savedTheme) {
            try {
                setTheme(JSON.parse(savedTheme));
            } catch (e) {
                console.error("Failed to parse theme", e);
            }
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme(prev => ({ ...prev, mode: 'dark' }));
        }
    }, []);

    // Helper to adjust brightness (simple hex manipulation)
    const adjustBrightness = (hex: string, percent: number) => {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    };

    // Apply Theme Side Effects
    useEffect(() => {
        const root = window.document.documentElement;

        // 1. Dark Mode
        if (theme.mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // 2. Accent Color
        root.style.setProperty('--primary', theme.accentColor);
        // Generate a 15% darker shade for hover
        root.style.setProperty('--primary-hover', adjustBrightness(theme.accentColor, -20));

        // Ensure persist
        localStorage.setItem('dentis-theme', JSON.stringify(theme));

    }, [theme]);


    return (
        <AppContextContext.Provider value={{ session, setSession, switchContext, showToast, toast, theme, setTheme }}>
            {children}
        </AppContextContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContextContext);
    if (!context) throw new Error('useAppContext must be used within AppContextProvider');
    return context;
};