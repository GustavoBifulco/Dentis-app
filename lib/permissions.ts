
import { UserCapabilities, UserSession, OrganizationRole } from '../types';

/**
 * Entregável 4: Regras de Negócio centralizadas.
 */
export const PermissionManager = {

    /**
     * Verifica se o usuário tem uma permissão granular específica.
     * Ex: hasPermission(session, 'clinical', 'view')
     */
    hasPermission: (session: UserSession, module: string, action: string): boolean => {
        if (!session.user.permissions) return false;
        // Admin or '*' wildcard
        if (session.user.permissions.includes('*:*')) return true;
        if (session.user.permissions.includes(`${module}:*`)) return true;
        return session.user.permissions.includes(`${module}:${action}`);
    },

    /**
     * Verifica se pode acessar dados financeiros.
     * Requer role 'admin' na organização OU permissão 'financial:view'.
     */
    canAccessFinancial: (session: UserSession): boolean => {
        return session.capabilities.isOrgAdmin || PermissionManager.hasPermission(session, 'financial', 'view');
    },

    /**
     * Verifica se pode acessar prontuários e agenda clínica.
     * Requer ser profissional de saúde OU admin OU permissão 'clinical:view'.
     */
    canAccessClinical: (session: UserSession): boolean => {
        return session.capabilities.isHealthProfessional || session.capabilities.isOrgAdmin || PermissionManager.hasPermission(session, 'clinical', 'view');
    },

    /**
     * Verifica se pode realizar procedimentos (Odontograma).
     * Requer ser estritamente Profissional de Saúde.
     */
    canExecuteClinical: (session: UserSession): boolean => {
        return session.capabilities.isHealthProfessional; // Strict? Or allow 'clinical:execute'?
    },

    /**
     * Helper para derivar capacidades a partir dos dados brutos do Clerk e do Banco.
     */
    deriveCapabilities: (
        orgRole: string | null,
        isProfessional: boolean,
        isCourier: boolean
    ): UserCapabilities => {
        return {
            isOrgAdmin: orgRole === 'admin',
            isHealthProfessional: isProfessional,
            isCourier: isCourier,
            isPatient: !isProfessional && !isCourier && !orgRole
        };
    }
};
