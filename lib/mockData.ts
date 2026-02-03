import { Patient, FinancialEntry } from '../types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 1,
    organizationId: '1',
    name: 'Paciente Beta',
    status: 'active',
    email: 'contato1@provider.com',
    phone: '(11) 99999-9999'
  },
  {
    id: 2,
    organizationId: '1',
    name: 'Paciente Gama',
    status: 'active',
    email: 'contato2@provider.com',
    phone: '(11) 98888-8888'
  }
];

export const MOCK_FINANCE: FinancialEntry[] = [];
export const MOCK_MARKETPLACE_PRODUCTS: any[] = [];
