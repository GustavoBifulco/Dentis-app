import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ViewType, AppContext } from '../types';

export type AuroraAIState = 'idle' | 'thinking' | 'working' | 'done' | 'error';

interface AuroraState {
    // Navigation
    currentView: ViewType;
    setCurrentView: (view: ViewType) => void;
    activeContext: AppContext | null;
    setActiveContext: (context: AppContext | null) => void;

    // AI
    aiState: AuroraAIState;
    setAiState: (state: AuroraAIState) => void;
    lastRequestId: string | null;
    setLastRequestId: (id: string | null) => void;

    // UI Feedback
    isTransitioning: boolean;
    triggerTransition: () => void;
}

const AuroraContext = createContext<AuroraState | undefined>(undefined);

export const AuroraProvider = ({ children }: { children: ReactNode }) => {
    const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
    const [activeContext, setActiveContext] = useState<AppContext | null>(null);
    const [aiState, setAiState] = useState<AuroraAIState>('idle');
    const [lastRequestId, setLastRequestId] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const triggerTransition = useCallback(() => {
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 300); // Reset after typical animation duration
    }, []);

    // Intercept generic view changes to trigger animations
    const handleSetView = useCallback((view: ViewType) => {
        if (view !== currentView) {
            triggerTransition();
            setCurrentView(view);
        }
    }, [currentView, triggerTransition]);

    const value = {
        currentView,
        setCurrentView: handleSetView,
        activeContext,
        setActiveContext,
        aiState,
        setAiState,
        lastRequestId,
        setLastRequestId,
        isTransitioning,
        triggerTransition
    };

    return (
        <AuroraContext.Provider value={value}>
            {children}
        </AuroraContext.Provider>
    );
};

export const useAurora = () => {
    const context = useContext(AuroraContext);
    if (!context) {
        throw new Error('useAurora must be used within an AuroraProvider');
    }
    return context;
};

// Hook specifically for AI components to simplify interface
export const useAuroraAI = () => {
    const { aiState, setAiState, lastRequestId, setLastRequestId } = useAurora();

    const startThinking = () => setAiState('thinking');
    const startWorking = () => setAiState('working');
    const finishSuccess = () => {
        setAiState('done');
        setTimeout(() => setAiState('idle'), 2000); // Return to idle after success check
    };
    const finishError = (requestId?: string) => {
        setAiState('error');
        if (requestId) setLastRequestId(requestId);
    };

    return {
        state: aiState,
        requestId: lastRequestId,
        startThinking,
        startWorking,
        finishSuccess,
        finishError,
        reset: () => setAiState('idle')
    };
};
