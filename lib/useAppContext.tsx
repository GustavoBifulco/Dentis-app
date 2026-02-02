import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContext, UserSession } from '../types';

interface AppContextState {
    session: UserSession | null;
    setSession: (session: UserSession | null) => void;
    switchContext: (context: AppContext) => void;
}

const AppContextContext = createContext<AppContextState | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<UserSession | null>(null);

    const switchContext = (context: AppContext) => {
        if (!session) return;

        // Update active context
        setSession({
            ...session,
            activeContext: context,
            // Update legacy fields for backward compatibility
            activeOrganization: context.organizationId ? {
                id: context.organizationId,
                clerkOrgId: '', // Would be fetched from API
                name: context.name,
                type: context.type as any
            } : null
        });

        // Persist to localStorage
        localStorage.setItem('activeContext', JSON.stringify(context));

        // Trigger page reload or state refresh
        window.location.reload();
    };

    // Load persisted context on mount
    useEffect(() => {
        const savedContext = localStorage.getItem('activeContext');
        if (savedContext && session) {
            const context = JSON.parse(savedContext);
            if (session.availableContexts.find(c => c.id === context.id && c.type === context.type)) {
                setSession({ ...session, activeContext: context });
            }
        }
    }, []);

    return (
        <AppContextContext.Provider value={{ session, setSession, switchContext }}>
            {children}
        </AppContextContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContextContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppContextProvider');
    }
    return context;
};
