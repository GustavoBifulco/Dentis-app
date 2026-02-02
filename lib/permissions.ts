
import { UserCapabilities, UserSession, OrganizationRole } from '../types';

/**
 * Entregável 4: Regras de Negócio centralizadas.
 */
export const PermissionManager = {

    /**
     * Verifica se o usuário pode acessar dados financeiros.
     * Requer role 'admin' na organização.
     */
    canAccessFinancial: (session: UserSession): boolean => {
        return session.capabilities.isOrgAdmin;
    },

    /**
     * Verifica se pode acessar prontuários e agenda clínica.
     * Requer ser profissional de saúde OU admin.
     */
    canAccessClinical: (session: UserSession): boolean => {
        return session.capabilities.isHealthProfessional || session.capabilities.isOrgAdmin;
    },

    /**
     * Verifica se pode realizar procedimentos (Odontograma).
     * Requer ser estritamente Profissional de Saúde.
     */
    canExecuteClinical: (session: UserSession): boolean => {
        return session.capabilities.isHealthProfessional;
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
