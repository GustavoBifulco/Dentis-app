import { UserSession } from '../types';

export const FEATURE_FLAGS = {
    CLINIC_MANAGEMENT: 'clinic_management',
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS | string;

// Proteção: Admins via Variáveis de Ambiente (.env)
const ADMIN_EMAILS = (import.meta as any).env.VITE_ADMIN_EMAILS 
    ? (import.meta as any).env.VITE_ADMIN_EMAILS.split(',') 
    : [];

export const isFeatureEnabled = (feature: FeatureFlag, user?: UserSession | null): boolean => {
    if (!user || !user.email) return false;

    if (feature === FEATURE_FLAGS.CLINIC_MANAGEMENT) {
        if (ADMIN_EMAILS.includes(user.email)) return true;
        return false;
    }
    return false;
};