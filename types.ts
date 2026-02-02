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
  PATIENT_WALLET = 'PATIENT_WALLET',
  KIOSK = 'KIOSK'
}

// --- IDENTITY & CAPABILITIES ---

export type ProfessionalType = 'DENTIST' | 'PROTETICO' | 'AUXILIAR';

export interface UserCapabilities {
  isOrgAdmin: boolean;
  isHealthProfessional: boolean;
  isCourier: boolean;
  isPatient: boolean;
}

export type OrganizationRole = 'admin' | 'member' | 'guest';

// --- SESSION & CONTEXT (Onde o isolamento acontece) ---

export type ContextType = 'CLINIC' | 'LAB' | 'PATIENT' | 'COURIER';

export interface AppContext {
  type: ContextType;
  id: number;
  name: string;
  organizationId?: string; // ID da organização no Clerk (clinicId)
}

export interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'dentist' | 'assistant' | 'patient';
  };
  capabilities: UserCapabilities;
  availableContexts: AppContext[];
  activeContext: AppContext | null;
  onboardingComplete: boolean;

  // Compatibilidade Legada
  activeOrganization: any | null;
  orgRole: OrganizationRole | null;
}

// --- BUSINESS DATA (Com ClinicId para Multi-tenancy) ---

export interface Patient {
  id: number;
  clinicId: string; // Fator de isolamento crítico
  organizationId: number;
  name: string;
  cpf?: string;
  email?: string;
  phone: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  lastVisit?: string;
  photoUrl?: string;
}

export interface Appointment {
  id: number;
  clinicId: string;
  patientId: number;
  patientName: string;
  dentistId: number;
  startTime: string;
  endTime: string;
  procedure: string;
  status: 'scheduled' | 'confirmed' | 'attended' | 'cancelled' | 'no-show';
  notes?: string;
}

// --- AUDIT LOGS (Requisito LGPD) ---

export type LogActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW_SENSITIVE' | 'LOGIN';

export interface AuditLog {
  id: string;
  clinicId: string;
  userId: string;
  userName: string;
  action: LogActionType;
  resource: 'PATIENT' | 'FINANCE' | 'CLINICAL_RECORD' | 'INVENTORY';
  resourceId: string;
  details: string;
  timestamp: string;
}

// --- FINANCE & PROCEDURES ---

export interface FinancialEntry {
  id: number;
  clinicId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  category?: string;
}

export interface Procedure {
  id: number;
  clinicId: string;
  name: string;
  code: string;
  price: number;
  durationMinutes: number;
  category: string;
}

// --- INVENTORY & LABS ---

export interface StockItem {
  id: number;
  clinicId: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
}

export interface LabOrder {
  id: number;
  clinicId: string;
  labName?: string;
  patientName: string;
  procedure: string;
  status: 'requested' | 'production' | 'ready' | 'delivered';
  deadline: string;
  cost: number;
}

// --- PATIENT PORTAL ---

export interface Prescription {
  id: number;
  patientId: number;
  medication: string;
  instructions: string;
  expiryDate: string;
  isActive: boolean;
}

export interface TreatmentPhase {
  id: number;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  progress?: number;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  accentColor: string;
  useGradient: boolean;
}

// --- STRIPE INTEGRATION ---

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