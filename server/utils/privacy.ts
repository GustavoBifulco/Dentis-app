
/**
 * Utility for masking Sensitive PII (Personally Identifiable Information)
 * Compliance with LGPD/GDPR
 */

const CPF_REGEX = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_REGEX = /\b(\+?55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}\b/g; // Basic BR Phone regex
// const CREDIT_CARD_REGEX = ... (Handled by Stripe usually, but good to have if we logging raw inputs)

export const redactPII = (text: string | object): string => {
    if (!text) return '';

    let str = '';

    if (typeof text === 'object') {
        try {
            str = JSON.stringify(text);
        } catch {
            return '[Unable to stringify object]';
        }
    } else {
        str = String(text);
    }

    // Redact CPF
    str = str.replace(CPF_REGEX, (match) => {
        // Keep first 3 digits
        return match.substring(0, 3) + '.***.***-**';
    });

    // Redact Email
    str = str.replace(EMAIL_REGEX, (match) => {
        const parts = match.split('@');
        return parts[0].substring(0, 2) + '***@' + parts[1];
    });

    // Redact Phone
    str = str.replace(PHONE_REGEX, '[PHONE-REDACTED]');

    return str;
};
