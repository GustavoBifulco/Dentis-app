import React from 'react';

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
  MANAGEMENT_HUB = 'MANAGEMENT_HUB',
  PROCEDURE_ENGINEER = 'PROCEDURE_ENGINEER',
  FINANCIAL_SPLIT = 'FINANCIAL_SPLIT',
  TEAM_SETTINGS = 'TEAM_SETTINGS',
  CLINICAL_EXECUTION = 'CLINICAL_EXECUTION',
  PATIENT_WALLET = 'PATIENT_WALLET'
}

// --- IDENTITY TYPES (WHO ARE YOU?) ---

export type ProfessionalType = 'DENTIST' | 'PROTETICO' | 'AUXILIAR';

export interface UserCapabilities {
  isOrgAdmin: boolean;      // Financeiro / Gestão
  isHealthProfessional: boolean; // Prontuário / Agenda
  isCourier: boolean;       // Entregas
  isPatient: boolean;       // Portal do Paciente
}

// --- PERMISSION TYPES (WHAT CARGO DO YOU HOLD?) ---

export type OrganizationRole = 'admin' | 'member' | 'guest';

export interface Organization {
  id: number;
  clerkOrgId: string;
  name: string;
  type: 'CLINIC' | 'LAB' | 'RADIOLOGY';
}

// --- SESSION CONTEXT ---

export type ContextType = 'CLINIC' | 'LAB' | 'PATIENT' | 'COURIER';

export interface AppContext {
  type: ContextType;
  id: number;
  name: string;
  organizationId?: number; // For CLINIC/LAB contexts
}

export interface UserSession {
  id: number;
  clerkId: string;
  name: string;
  email: string;

  // Identity Flags
  professionalType: ProfessionalType | null;

  // Logical Capability State
  capabilities: UserCapabilities;

  // Multi-Context Support
  availableContexts: AppContext[];
  activeContext: AppContext | null;

  // Legacy (for backward compatibility during migration)
  activeOrganization: Organization | null;
  orgRole: OrganizationRole | null;
}

// --- BUSINESS DATA ---

export interface Patient {
  id: number;
  organizationId: number;
  name: string;
  cpf?: string;
  email?: string;
  phone: string;
  status?: 'active' | 'pending' | 'completed';
  lastVisit?: string;
}

export interface Appointment {
  id: number;
  organizationId: number;
  patientId: number;
  patientName?: string;
  dentistId: number;
  startTime: string;
  endTime: string;
  procedure?: string;
  status: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  accentColor: string;
  useGradient: boolean;
}

// --- PATIENT PORTAL TYPES ---

export interface Prescription {
  id: number;
  patientId: number;
  medication: string;
  dosage: string;
  instructions: string;
  prescribedDate: string;
  expiryDate: string;
  isActive: boolean;
}

export interface Payment {
  id: number;
  patientId: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  method?: string;
  receiptUrl?: string;
}

export interface TreatmentPhase {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  completedDate?: string;
  estimatedDate?: string;
  progress?: number;
}

export interface FinancialSummary {
  totalContracted: number;
  totalPaid: number;
  outstandingBalance: number;
  paymentHistory: Payment[];
  pendingPayments: Payment[];
}


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


export interface LabOrder {
  id: number;
  organizationId: number;
  labName?: string;
  patientName: string;
  procedure: string;
  status: 'requested' | 'production' | 'ready' | 'delivered';
  deadline: string;
  cost: number;
  isDigital?: boolean;
  stlFileUrl?: string;
  designFileUrl?: string;
}

export type UserRole = 'clinic_owner' | 'dentist' | 'lab_admin' | 'courier' | 'supplier' | 'patient';

export interface FinancialEntry {
  id: number;
  organizationId: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  category?: string;
}

export interface StockItem {
  id: number;
  organizationId: number;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
}

export interface Procedure {
  id: number;
  organizationId: number;
  name: string;
  code: string;
  price: number;
  durationMinutes: number;
  duration?: number;
  category: string;
}


