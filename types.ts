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

// --- SESSION & CONTEXT ---

export type ContextType = 'CLINIC' | 'LAB' | 'PATIENT' | 'COURIER';

export interface AppContext {
    type: ContextType;
    id: number;
    name: string;
    organizationId?: string;
}

export enum UserRole {
    ADMIN = 'admin',
    DENTIST = 'dentist',
    ASSISTANT = 'assistant',
    PATIENT = 'patient',
    CLINIC_OWNER = 'clinic_owner',
    COURIER = 'courier',
    MANAGER = 'manager',
    OWNER = 'OWNER'
}

export interface UserSession {
    user: {
        id: string;
        email: string;
        name: string;
        role: UserRole | string;
    };
    name?: string; // Compatibility
    primaryEmailAddress?: { emailAddress: string } | null; // Compatibility
    capabilities: UserCapabilities;
    availableContexts: AppContext[];
    activeContext: AppContext | null;
    onboardingComplete: boolean;

    // Compatibility
    activeOrganization: any | null;
    orgRole: OrganizationRole | null;
}

export type ApiResponse<T> = {
    data?: T;
    error?: string;
};

// --- BUSINESS DATA ---

export interface Patient {
    id: number;
    organizationId: string;
    userId?: string; // Clerk user ID when patient creates account
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
    organizationId: string;
    patientId: number;
    patientName: string;
    dentistId: number | string;
    startTime: string | Date;
    endTime: string | Date;
    procedure: string;
    status: 'scheduled' | 'confirmed' | 'attended' | 'cancelled' | 'no-show';
    notes?: string;
}

export interface ClinicalRecord {
    id: number;
    organizationId: string;
    patientId: number;
    dentistId: string;
    date: string | Date;
    treatment?: string;
    notes?: string;
    attachments?: any[];
    createdAt: string | Date;
}

export interface FinancialEntry {
    id: number;
    organizationId: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    dueDate: string | Date;
    status: 'paid' | 'pending' | 'overdue' | 'INVOICED';
    category?: string;
}

export interface Procedure {
    id: number;
    organizationId: string;
    name: string;
    code: string;
    price: number | string;
    duration?: number; // Added for compatibility
    durationMinutes: number;
    category: string;
}

export interface StockItem {
    id: number;
    organizationId: string;
    name: string;
    category?: string;
    quantity: number;
    minQuantity: number;
    unit: string;
    price?: number;
    supplier?: string;
    link?: string;
    minStock?: number;
    currentStock?: number;
    photoUrl?: string;
}

export interface LabOrder {
    id: number;
    organizationId: string;
    labName?: string;
    patientName: string;
    procedure: string;
    status: 'requested' | 'production' | 'ready' | 'delivered';
    deadline: string | Date;
    cost: number;
    isDigital?: boolean; // Added
}

export interface TreatmentPhase {
    id: number;
    title: string;
    status: 'completed' | 'current' | 'upcoming';
    progress?: number;
    description?: string;
}

export interface Prescription {
    id: number;
    patientId: number;
    medication: string;
    instructions: string;
    expiryDate: string;
    isActive: boolean;
}

export interface FinancialSummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    pendingAmount: number;
}

export interface Payment {
    id: number;
    amount: number;
    status: string;
    date: string | Date;
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
