
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
  CLINICAL_EXECUTION = 'CLINICAL_EXECUTION'
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
  dentistId: number;
  startTime: string;
  endTime: string;
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
