import { UserSession } from '../types';

export const FEATURE_FLAGS = {
    CLINIC_MANAGEMENT: 'clinic_management',
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS | string;

// LISTA DE E-MAILS QUE TÊM ACESSO TOTAL (VOCÊ)
const ADMIN_EMAILS = [
    'gustavosbifulco@gmail.com', // <--- TROQUE PELO SEU E-MAIL REAL
    'gustavo@dentis.com'
];

export const isFeatureEnabled = (feature: FeatureFlag, user?: UserSession | null): boolean => {
    // 1. Se não tiver usuário logado, nega tudo que é crítico
    if (!user) return false;

    if (feature === FEATURE_FLAGS.CLINIC_MANAGEMENT) {
        // Regra 1: Super Admins (Hardcoded para segurança inicial)
        if (user.email && ADMIN_EMAILS.includes(user.email)) {
            return true;
        }

        // Regra 2: No futuro, verificar flags vindas do banco (ex: user.allowedModules)
        // if (user.allowedModules?.includes('CLINIC_MANAGEMENT')) return true;

        // Padrão: Bloqueado para o resto do mundo
        return false;
    }

    return false;
};