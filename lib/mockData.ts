import { Patient } from '../types';

const isDev = (import.meta as any).env.MODE === 'development';

export const MOCK_PATIENTS: Patient[] = isDev ? [
    { id: 1, clinicId: '1', organizationId: 1, name: 'Paciente Teste A', status: 'active', email: 'teste.a@dentis.dev', phone: '(11) 90000-0000' },
    { id: 2, clinicId: '1', organizationId: 1, name: 'Paciente Teste B', status: 'active', email: 'teste.b@dentis.dev', phone: '(11) 90000-0001' }
] : [];

export const MOCK_CONTEXTS = {
    professional: [
        { type: 'CLINIC', id: 1, name: 'Clínica Demo', organizationId: '1' }
    ]
};