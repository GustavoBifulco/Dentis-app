
/**
 * AI Safety Utilities
 * Protection against Prompt Injection and Malicious Inputs.
 */

// Basic list of known jailbreak/leak patterns
const JAILBREAK_PATTERNS = [
    /ignore previous instructions/i,
    /ignore the above/i,
    /system prompt/i,
    /reveal your instructions/i,
    /simule/i, // Often used in "Simule um..."
    /dan mode/i,
    /do anything now/i,
    /você agora é/i
];

/**
 * Detects potential prompt injection or jailbreak attempts.
 */
export const detectJailbreak = (text: string): boolean => {
    if (!text) return false;
    return JAILBREAK_PATTERNS.some(pattern => pattern.test(text));
};

/**
 * Sanitizes input removes invisible characters, zero-width spaces, 
 * and other Unicode trickery often used to bypass filters.
 */
export const sanitizeInput = (text: string): string => {
    if (!text) return '';

    // 1. Normalize Unicode (NFC)
    let clean = text.normalize('NFC');

    // 2. Remove invisible characters (control chars, zero width)
    // eslint-disable-next-line no-control-regex
    clean = clean.replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '');

    return clean.trim();
};
