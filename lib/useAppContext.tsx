import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { AppContext as AppContextType, UserSession } from '../types';
import { useAuth } from "@clerk/clerk-react";

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
    const { getToken } = useAuth();
    const [theme, setTheme] = useState<{ mode: 'light' | 'dark', accentColor: string }>({
        mode: 'light',
        accentColor: '#2563EB' // Clinical Aurora Blue (Safira)
    });

    // Helper: HEX to HSL conversion for Tailwind compatibility
    const hexToHSL = (hex: string): string => {
        // Remove hash
        hex = hex.replace('#', '');

        // Parse RGB
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        // Return HSL values as space-separated string (for CSS variables)
        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Initialize Theme
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

    // Apply Theme Side Effects
    useEffect(() => {
        const root = window.document.documentElement;

        // 1. Dark Mode
        if (theme.mode === 'dark') {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
        } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
        }

        // 2. Accent Color (Convert HEX to HSL for Tailwind)
        const hslValue = hexToHSL(theme.accentColor);
        root.style.setProperty('--primary', hslValue);
        root.style.setProperty('--ring', hslValue); // Use same color for focus rings
        root.style.setProperty('--accent', hslValue); // For AI features

        // Calculate hover state (10% darker in lightness)
        const [h, s, l] = hslValue.split(' ');
        const lightnessValue = parseInt(l);
        const hoverLightness = Math.max(0, lightnessValue - 10);
        root.style.setProperty('--primary-hover', `${h} ${s} ${hoverLightness}%`);

        // Ensure persist locally
        localStorage.setItem('dentis-theme', JSON.stringify(theme));

        // Save to Backend (Debounced)
        const timer = setTimeout(async () => {
            if (session?.user?.id) {
                try {
                    const token = await getToken();
                    if (!token) return; // public route or offline

                    await fetch('/api/preferences', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            theme: theme.mode,
                            primaryColor: theme.accentColor
                        })
                    });
                } catch (err) {
                    console.warn("Failed to save prefs backend", err);
                }
            }
        }, 1000); // 1s debounce

        return () => clearTimeout(timer);

    }, [theme, session, getToken]);


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