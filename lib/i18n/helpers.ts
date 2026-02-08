/**
 * i18n Helper Functions for Premium Medical Microcopy
 * Handles Dr./Dra./Dr(a). formatting and formal greetings
 */

import { Locale } from './types';

/**
 * Format doctor title based on gender and locale
 * @param gender - 'male' | 'female' | undefined
 * @param locale - Current locale
 * @returns Formatted title: "Dr.", "Dra.", or "Dr(a)."
 */
export function formatDoctorTitle(
    gender: 'male' | 'female' | undefined,
    locale: Locale = 'pt-BR'
): string {
    if (locale === 'en') {
        // English uses gender-neutral "Dr."
        return 'Dr.';
    }

    // Portuguese and Spanish use gendered titles
    if (gender === 'male') {
        return 'Dr.';
    }
    if (gender === 'female') {
        return 'Dra.';
    }

    // Unknown gender - use gender-inclusive form
    return 'Dr(a).';
}

/**
 * Get time-based greeting key
 * @returns Greeting key based on current hour
 */
export function getTimeBasedGreeting(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
}

/**
 * Format formal greeting with doctor title
 * @param locale - Current locale
 * @param gender - 'male' | 'female' | undefined
 * @param lastName - Doctor's last name
 * @param timeKey - 'morning' | 'afternoon' | 'evening'
 * @returns Fully formatted greeting string
 */
export function formatFormalGreeting(
    locale: Locale,
    gender: 'male' | 'female' | undefined,
    lastName: string,
    timeKey: 'morning' | 'afternoon' | 'evening' = getTimeBasedGreeting()
): string {
    const title = formatDoctorTitle(gender, locale);

    const greetings: Record<Locale, Record<string, string>> = {
        'pt-BR': {
            morning: `Bom dia, ${title} ${lastName}.`,
            afternoon: `Boa tarde, ${title} ${lastName}.`,
            evening: `Boa noite, ${title} ${lastName}.`,
        },
        'en': {
            morning: `Good morning, ${title} ${lastName}.`,
            afternoon: `Good afternoon, ${title} ${lastName}.`,
            evening: `Good evening, ${title} ${lastName}.`,
        },
        'es': {
            morning: `Buenos días, ${title} ${lastName}.`,
            afternoon: `Buenas tardes, ${title} ${lastName}.`,
            evening: `Buenas noches, ${title} ${lastName}.`,
        },
    };

    return greetings[locale][timeKey];
}

/**
 * Format welcome greeting (non time-based)
 * @param locale - Current locale
 * @param gender - 'male' | 'female' | undefined
 * @param lastName - User's last name
 * @returns Welcome greeting with appropriate title
 */
export function formatWelcome(
    locale: Locale,
    gender: 'male' | 'female' | undefined,
    lastName: string
): string {
    const title = formatDoctorTitle(gender, locale);

    switch (locale) {
        case 'en':
            return `Welcome, ${title} ${lastName}.`;
        case 'es':
            return gender === 'female'
                ? `Bienvenida, ${title} ${lastName}.`
                : `Bienvenido, ${title} ${lastName}.`;
        case 'pt-BR':
        default:
            return gender === 'female'
                ? `Seja bem-vinda, ${title} ${lastName}.`
                : `Seja bem-vindo, ${title} ${lastName}.`;
    }
}

/**
 * Get last name from full name
 * @param fullName - Full name string
 * @returns Last name (or full name if only one word)
 */
export function getLastName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    return parts[parts.length - 1] || fullName;
}
