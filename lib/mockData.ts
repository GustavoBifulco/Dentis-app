import { Patient, AppContext, UserSession, FinancialEntry, Procedure, LabOrder } from '../types';

// Detecta se é dev environment
const isDev = (import.meta as any).env.MODE === 'development';

export const MOCK_PATIENTS: Patient[] = isDev ? [
    { id: 1, clinicId: '1', organizationId: 1, name: 'Paciente Beta', status: 'active', email: 'contato1@provider.com', phone: '(11) 99999-9999' },
    { id: 2, clinicId: '1', organizationId: 1, name: 'Paciente Gama', status: 'active', email: 'contato2@provider.com', phone: '(11) 98888-8888' }
] : [];

export const MOCK_CONTEXTS = {
    professional: [
        { type: 'CLINIC', id: 1, name: 'Clínica Demo', organizationId: '1' }
    ],
    patient: [
        { type: 'PATIENT', id: 1, name: 'Portal Pessoal' }
    ]
};

// Mocks Financeiros (Adicionado para corrigir o erro de build)
export const MOCK_FINANCE: FinancialEntry[] = isDev ? [
    { id: 1, clinicId: '1', type: 'income', amount: 1500.00, description: 'Consulta Inicial', dueDate: '2024-05-20', status: 'paid', category: 'Clínico' },
    { id: 2, clinicId: '1', type: 'expense', amount: 350.00, description: 'Material Descartável', dueDate: '2024-05-21', status: 'pending', category: 'Insumos' }
] : [];

// Mocks de Procedimentos
export const MOCK_PROCEDURES: Procedure[] = isDev ? [
    { id: 1, clinicId: '1', name: 'Limpeza', code: 'PRO-001', price: 200, durationMinutes: 30, category: 'Prevenção' },
    { id: 2, clinicId: '1', name: 'Clareamento', code: 'PRO-002', price: 800, durationMinutes: 60, category: 'Estética' }
] : [];

// Mocks de Laboratório
export const MOCK_LABS: LabOrder[] = isDev ? [
    { id: 1, clinicId: '1', patientName: 'Paciente Beta', procedure: 'Prótese Total', status: 'production', deadline: '2024-06-01', cost: 500 }
] : [];

export const MOCK_SESSION: Partial<UserSession> = {
    onboardingComplete: true,
    capabilities: { isOrgAdmin: true, isHealthProfessional: true, isCourier: false, isPatient: false }
};

export const MOCK_INVENTORY = [
    { id: 1, name: 'Luvas de Látex (Cx)', quantity: 50, unit: 'box', minLevel: 10 },
    { id: 2, name: 'Anestésico Tópico', quantity: 12, unit: 'frasco', minLevel: 5 },
    { id: 3, name: 'Resina Composta A2', quantity: 8, unit: 'seringa', minLevel: 3 },
    { id: 4, name: 'Agulhas Gengivais', quantity: 100, unit: 'uni', minLevel: 20 },
    { id: 5, name: 'Sugadores Descartáveis', quantity: 200, unit: 'pacote', minLevel: 15 },
];

export const MOCK_MARKETPLACE_PRODUCTS = isDev ? [
    { id: 1, name: 'Produto Exemplo 1', price: 99.99, description: 'Descrição do produto', category: 'Equipamentos' },
    { id: 2, name: 'Produto Exemplo 2', price: 149.99, description: 'Outro produto', category: 'Insumos' }
    // Adicione mais itens conforme necessário
] : [];