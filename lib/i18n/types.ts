export type Locale = 'pt-BR' | 'en' | 'es';

export interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    formatMoney: (amount: number) => string;
    formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
    isLoading: boolean;
}

export type Translations = typeof import('./locales/pt-BR').default;
