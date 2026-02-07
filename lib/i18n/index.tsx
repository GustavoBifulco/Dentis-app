import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from "@clerk/clerk-react";
import { useAppContext } from '../useAppContext';
import { Locale, Translations } from './types';
import ptBR from './locales/pt-BR';
import en from './locales/en';
import es from './locales/es';
import { formatMoney as fmtMoney, formatDate as fmtDate } from './format';

// Use pt-BR as fallback for types and runtime
const defaultLocale: Locale = 'pt-BR';

interface I18nContextProps {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    formatMoney: (amount: number) => string;
    formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

const translations: Record<Locale, Translations> = {
    'pt-BR': ptBR,
    'en': en,
    'es': es,
};

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [locale, setLocaleState] = useState<Locale>(() => {
        // 1. LocalStorage
        const saved = localStorage.getItem('dentis-locale');
        if (saved && (saved === 'pt-BR' || saved === 'en' || saved === 'es')) {
            return saved as Locale;
        }
        // 2. Navigator
        const nav = navigator.language.toLowerCase();
        if (nav.startsWith('pt')) return 'pt-BR';
        if (nav.startsWith('es')) return 'es';
        if (nav.startsWith('en')) return 'en';

        // 3. Default
        return defaultLocale;
    });

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('dentis-locale', newLocale);
    };

    const { getToken } = useAuth();
    const { session } = useAppContext();

    // Sync FROM backend (Cloud > Local)
    useEffect(() => {
        if (session?.preferences?.locale) {
            const cloudLocale = session.preferences.locale as Locale;
            if (['pt-BR', 'en', 'es'].includes(cloudLocale) && cloudLocale !== locale) {
                console.log(`Syncing locale from cloud: ${cloudLocale}`);
                setLocaleState(cloudLocale);
                localStorage.setItem('dentis-locale', cloudLocale);
            }
        }
    }, [session?.preferences?.locale]);

    // Sync TO backend
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (session?.user?.id) {
                try {
                    const token = await getToken();
                    if (!token) return;

                    await fetch('/api/preferences', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ locale })
                    });
                } catch (err) {
                    console.warn("Failed to save locale pref", err);
                }
            }
        }, 1000); // Debounce

        return () => clearTimeout(timer);
    }, [locale, session?.user?.id]);

    // Helper to get nested keys (e.g. 'dashboard.greeting')
    const getNestedTranslation = (obj: any, path: string): string | undefined => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
        let text = getNestedTranslation(translations[locale], key);

        // Fallback to pt-BR if key missing in current locale
        if (!text) {
            // console.warn(`Missing translation for key: ${key} in locale: ${locale}`);
            text = getNestedTranslation(translations['pt-BR'], key);
        }

        if (!text) return key; // Return key if absolutely nothing found

        // Interpolation
        if (params) {
            Object.keys(params).forEach(param => {
                text = (text as string).replace(new RegExp(`{${param}}`, 'g'), String(params[param]));
            });
        }

        return text as string;
    };

    const formatMoney = (amount: number) => fmtMoney(amount, locale);
    const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => fmtDate(date, locale, options);

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, formatMoney, formatDate }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};
