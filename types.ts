
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  PATIENTS = 'PATIENTS',
  PATIENT_RECORD = 'PATIENT_RECORD',
  SCHEDULE = 'SCHEDULE',
  AI_ASSISTANT = 'AI_ASSISTANT',
  INVENTORY = 'INVENTORY',
  LABS = 'LABS',
  MARKETPLACE = 'MARKETPLACE',
  FINANCE = 'FINANCE',
  PROCEDURES = 'PROCEDURES',
  SETTINGS = 'SETTINGS',
  DOCUMENTS = 'DOCUMENTS',
  TREATMENT = 'TREATMENT',
  TREATMENT_JOURNEY = 'TREATMENT_JOURNEY',
  ANAMNESIS = 'ANAMNESIS',
  PROFILE = 'PROFILE',
  // New Views
  MANAGEMENT_HUB = 'MANAGEMENT_HUB',
  PROCEDURE_ENGINEER = 'PROCEDURE_ENGINEER',
  FINANCIAL_SPLIT = 'FINANCIAL_SPLIT',
  TEAM_SETTINGS = 'TEAM_SETTINGS', // Accessed via Settings
  CLINICAL_EXECUTION = 'CLINICAL_EXECUTION' // Accessed inside Patient Record
}

export type UserRole = 'dentist' | 'clinic_owner' | 'patient';

export interface ThemeConfig {
  mode: 'light' | 'dark';
  accentColor: string; // Hex Code
  useGradient: boolean;
}

export interface UserSession {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Dados coletados no Onboarding
export interface OnboardingData {
  role: UserRole;
  cpf?: string;
  cnpj?: string;
  clinicName?: string;
  clinicAddress?: string;
  cro?: string; // Para dentista ou do responsável técnico
  responsibleDentistName?: string; // Apenas para Dono de Clínica
  profileImage?: string; // Base64 ou URL
}

// API Envelope
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface Patient {
  id: number;
  clinicId: number;
  name: string;
  surname?: string; // Adicionado
  cpf?: string; // Adicionado
  email?: string;
  phone: string;
  status: 'active' | 'pending' | 'completed';
  lastVisit?: string;
  age?: number;
  gender?: string;
  address?: string;
  anamnesisAlerts?: string[];
}

export interface Appointment {
  id: number;
  clinicId: number;
  patientId: number;
  patientName: string;
  startTime: string;
  endTime: string;
  procedure: string;
  status: 'scheduled' | 'confirmed' | 'attended' | 'cancelled' | 'no_show';
}

export interface Procedure {
  id: number;
  clinicId: number;
  name: string;
  code: string;
  price: number;
  duration: number; // Duration in minutes
  durationMinutes: number; // Alias
  category: string; // Adicionado para agrupamento nas ilhas
  description?: string;
  materialsCost?: number;
  estimatedProfit?: number;
}

export interface StockItem {
  id: number;
  clinicId: number;
  name: string;
  category: string; // Ex: Ortodontia, Cirurgia...
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
  lastUpdated?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  split: number; // Porcentagem de comissão (0-100)
  active: boolean;
  color?: string;
}

export interface LabOrder {
  id: number;
  clinicId: number;
  patientName: string;
  procedure: string;
  labName: string;
  status: 'requested' | 'production' | 'ready' | 'delivered';
  deadline: string;
  cost: number;
  notes?: string;
}

export interface FinancialEntry {
  id: number;
  clinicId: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  category?: string; // 'salary', 'rent', 'materials', 'personal'
  recurrence?: 'monthly' | 'one_time';
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  actionData?: any; // Se a IA sugerir uma ação (JSON estruturado)
}

// Declaração global para o elemento do Stripe
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'pricing-table-id': string;
        'publishable-key': string;
        'client-reference-id'?: string;
        'customer-email'?: string;
      };
    }
  }
}
