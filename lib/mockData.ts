import { Patient, Appointment, FinancialEntry, StockItem, LabOrder, Procedure, UserRole } from '../types';

/**
 * ------------------------------------------------------------------
 * ARQUIVO DE DADOS MOCKADOS (SIMULAÇÃO DE BANCO DE DADOS)
 * ------------------------------------------------------------------
 * Edite este arquivo para alterar os dados que aparecem na interface
 * enquanto o backend real não está conectado.
 */

export const MOCK_PATIENTS: Patient[] = [
  { id: 1, organizationId: 1, name: 'Ana Clara Souza', phone: '(11) 99999-1111', status: 'active', lastVisit: '10/05/2024', email: 'ana@email.com' },
  { id: 2, organizationId: 1, name: 'Roberto Firmino', phone: '(11) 98888-2222', status: 'active', lastVisit: '22/05/2024', email: 'beto@email.com' },
  { id: 3, organizationId: 1, name: 'Julia Roberts', phone: '(11) 97777-3333', status: 'pending', lastVisit: '01/02/2024', email: 'julia@email.com' },
  { id: 4, organizationId: 1, name: 'Carlos Eduardo', phone: '(11) 96666-4444', status: 'completed', lastVisit: '15/12/2023' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 1, organizationId: 1, patientId: 1, patientName: 'Ana Clara Souza', dentistId: 1, startTime: '2024-05-22T10:00:00', endTime: '2024-05-22T11:00:00', procedure: 'Manutenção Ortodôntica', status: 'confirmed' },
  { id: 2, organizationId: 1, patientId: 2, patientName: 'Roberto Firmino', dentistId: 1, startTime: '2024-05-22T11:00:00', endTime: '2024-05-22T12:00:00', procedure: 'Avaliação Inicial', status: 'attended' },
  { id: 3, organizationId: 1, patientId: 3, patientName: 'Julia Roberts', dentistId: 1, startTime: '2024-05-22T14:00:00', endTime: '2024-05-22T15:30:00', procedure: 'Clareamento', status: 'scheduled' },
];

export const MOCK_FINANCE: FinancialEntry[] = [
  { id: 1, organizationId: 1, type: 'income', description: 'Tratamento Ortodôntico (Entrada)', amount: 1500.00, dueDate: '20/05/2024', status: 'paid' },
  { id: 2, organizationId: 1, type: 'income', description: 'Limpeza e Profilaxia', amount: 350.00, dueDate: '21/05/2024', status: 'paid' },
  { id: 3, organizationId: 1, type: 'expense', description: 'Dental Cremer (Materiais)', amount: 850.50, dueDate: '25/05/2024', status: 'pending' },
  { id: 4, organizationId: 1, type: 'expense', description: 'Aluguel Sala Comercial', amount: 2500.00, dueDate: '05/06/2024', status: 'pending' },
];

export const MOCK_INVENTORY: StockItem[] = [
  { id: 1, organizationId: 1, name: 'Resina Z350 A2', category: 'Restaurador', quantity: 2, minQuantity: 3, unit: 'tubo', price: 120.00 },
  { id: 2, organizationId: 1, name: 'Luvas de Procedimento M', category: 'Descartável', quantity: 15, minQuantity: 5, unit: 'cx', price: 45.90 },
  { id: 3, organizationId: 1, name: 'Anestésico Lidocaína', category: 'Medicamento', quantity: 8, minQuantity: 10, unit: 'cx', price: 89.00 },
  { id: 4, organizationId: 1, name: 'Kit Clareamento Office', category: 'Estética', quantity: 1, minQuantity: 2, unit: 'kit', price: 350.00 },
];

export const MOCK_LABS: LabOrder[] = [
  { id: 1, organizationId: 1, patientName: 'Carlos Eduardo', procedure: 'Prótese Total Superior', labName: 'Laboratório Sorriso', status: 'production', deadline: '30/05/2024', cost: 800.00 },
  { id: 2, organizationId: 1, patientName: 'Roberto Firmino', procedure: 'Coroa E-max #21', labName: 'Digital Lab', status: 'ready', deadline: '24/05/2024', cost: 450.00 },
];

export const MOCK_PROCEDURES: Procedure[] = [
  { id: 1, organizationId: 1, name: 'Consulta Inicial', code: '8100001', price: 150.00, durationMinutes: 30, duration: 30, category: 'Diagnóstico' },
  { id: 2, organizationId: 1, name: 'Restauração Resina 1 face', code: '8510001', price: 280.00, durationMinutes: 45, duration: 45, category: 'Dentística' },
  { id: 3, organizationId: 1, name: 'Profilaxia (Limpeza)', code: '8400009', price: 200.00, durationMinutes: 30, duration: 30, category: 'Prevenção' },
  { id: 4, organizationId: 1, name: 'Exodontia Simples', code: '8200003', price: 350.00, durationMinutes: 60, duration: 60, category: 'Cirurgia' },
];

export const MOCK_MARKETPLACE_PRODUCTS = [
  { name: 'Adesivo Single Bond Universal', brand: '3M', price: 215.0, img: '🧪', discount: '15%' },
  { name: 'Alginato Chromopan 450g', brand: 'Lascod', price: 62.0, img: '📦', discount: null },
  { name: 'Bicarbonato de Sódio 2kg', brand: 'Maquira', price: 48.0, img: '⚪', discount: '10%' },
  { name: 'Broca Diamantada 1012', brand: 'KG Sorensen', price: 18.0, img: '⚙️', discount: null },
];