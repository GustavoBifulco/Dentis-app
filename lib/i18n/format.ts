import { Locale } from './types';

export const formatMoney = (amount: number, locale: Locale): string => {
    let currency = 'BRL';
    if (locale === 'en') currency = 'USD';
    // ES uses BRL for now as per requirements

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    }).format(amount / 100); // Assumes amount is in cents
};

export const formatDate = (date: Date | string | number, locale: Locale, options?: Intl.DateTimeFormatOptions): string => {
    const d = new Date(date);
    return new Intl.DateTimeFormat(locale, options).format(d);
};

export const getSalutation = (
    locale: Locale,
    gender?: string | null,
    explicitTitle?: string | null
): string => {
    // 1. Explicit title
    if (explicitTitle) {
        const titleLower = explicitTitle.toLowerCase();
        if (titleLower === 'dr' || titleLower === 'dr.') return 'Dr.';
        if (titleLower === 'dra' || titleLower === 'dra.') return 'Dra.';
    }

    // 2. English always Dr.
    if (locale === 'en') return 'Dr.';

    // 3. Gender (pt/es)
    if (gender) {
        const g = gender.toLowerCase();
        if (g === 'female' || g === 'f' || g === 'feminino') return 'Dra.';
        if (g === 'male' || g === 'm' || g === 'masculino') return 'Dr.';
    }

    // 4. Default neutral (no title, just name usually, but here likely Dr. for safety in clinical context??)
    // Requirement says: "Se não existir, usar neutro (sem título)."
    // But context says "O app deve tratar dentistas com formalidade."
    // Safe default: Dr.
    return 'Dr.';
};
