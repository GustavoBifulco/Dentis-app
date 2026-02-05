import { z } from 'zod';

/**
 * Common validation schemas for route parameters
 * Used across all API routes to prevent SQL injection and type errors
 */

// === ID Validation ===

export const idParamSchema = z.object({
    id: z.coerce.number().int().positive({
        message: 'ID deve ser um número inteiro positivo'
    })
});

export const stringIdParamSchema = z.object({
    id: z.string().min(1, 'ID não pode estar vazio')
});

// === Pagination ===

export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
});

// === Date Validation ===

export const dateParamSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Data deve estar no formato YYYY-MM-DD'
    })
});

export const dateRangeSchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
}).refine(
    (data) => new Date(data.startDate) <= new Date(data.endDate),
    { message: 'Data inicial deve ser anterior ou igual à data final' }
);

// === Patient Routes ===

export const createPatientSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(255),
    socialName: z.string().max(255).optional(),
    email: z.string().email('Email inválido').optional(),
    phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').max(20).optional(),
    cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos').optional(),
    birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    status: z.enum(['active', 'pending', 'completed', 'archived']).default('active'),
});

export const updatePatientSchema = createPatientSchema.partial();

// === Appointment Routes ===

export const createAppointmentSchema = z.object({
    patientId: z.number().int().positive(),
    dentistId: z.union([z.number().int().positive(), z.string().min(1)]),
    scheduledDate: z.string().datetime({ message: 'Data deve estar no formato ISO 8601' }),
    duration: z.number().int().positive().default(30),
    procedure: z.string().min(1).max(255),
    notes: z.string().max(1000).optional(),
    status: z.enum(['scheduled', 'confirmed', 'attended', 'cancelled', 'no-show']).default('scheduled'),
});

export const updateAppointmentSchema = createAppointmentSchema.partial();

export const appointmentStatusSchema = z.object({
    status: z.enum(['scheduled', 'confirmed', 'attended', 'cancelled', 'no-show'])
});

// === Financial Routes ===

export const createFinancialEntrySchema = z.object({
    type: z.enum(['income', 'expense']),
    amount: z.number().positive({ message: 'Valor deve ser positivo' }),
    description: z.string().min(1).max(500),
    category: z.string().max(100).optional(),
    dueDate: z.string().datetime(),
    status: z.enum(['paid', 'pending', 'overdue', 'INVOICED']).default('pending'),
    patientId: z.number().int().positive().optional(),
});

export const updateFinancialEntrySchema = createFinancialEntrySchema.partial();

// === Procedure Routes ===

export const createProcedureSchema = z.object({
    name: z.string().min(1).max(255),
    code: z.string().min(1).max(50),
    price: z.number().positive(),
    cost: z.number().nonnegative().optional(),
    durationMinutes: z.number().int().positive().default(30),
    category: z.string().max(100).optional(),
    description: z.string().max(1000).optional(),
});

export const updateProcedureSchema = createProcedureSchema.partial();

// === Inventory Routes ===

export const createInventoryItemSchema = z.object({
    name: z.string().min(1).max(255),
    category: z.string().max(100).optional(),
    quantity: z.number().int().nonnegative(),
    minQuantity: z.number().int().nonnegative().default(0),
    unit: z.string().max(50),
    price: z.number().nonnegative().optional(),
    supplier: z.string().max(255).optional(),
    link: z.string().url().optional(),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

// === Clinical Records ===

export const createEncounterSchema = z.object({
    patientId: z.number().int().positive(),
    date: z.string().datetime(),
    chiefComplaint: z.string().max(500).optional(),
    diagnosis: z.string().max(1000).optional(),
    treatment: z.string().max(2000).optional(),
    notes: z.string().max(5000).optional(),
    toothNumber: z.number().int().min(11).max(85).optional(), // Dental notation
});

export const createPrescriptionSchema = z.object({
    patientId: z.number().int().positive(),
    medication: z.string().min(1).max(255),
    dosage: z.string().max(100),
    frequency: z.string().max(100),
    duration: z.string().max(100),
    instructions: z.string().max(1000),
    startDate: z.string().datetime(),
});

// === AI Routes ===

export const aiChatSchema = z.object({
    message: z.string().min(1, 'Mensagem não pode estar vazia').max(5000, 'Mensagem muito longa'),
    conversationId: z.number().int().positive().optional(),
    context: z.record(z.any()).optional(),
});

// === File Upload ===

export const fileUploadSchema = z.object({
    fileName: z.string().min(1).max(255),
    fileType: z.string().regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i, 'Tipo de arquivo inválido'),
    fileSize: z.number().int().positive().max(10 * 1024 * 1024, 'Arquivo muito grande (máx 10MB)'),
});

// === Query Filters ===

export const patientFilterSchema = z.object({
    status: z.enum(['active', 'pending', 'completed', 'archived']).optional(),
    search: z.string().max(255).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const appointmentFilterSchema = z.object({
    patientId: z.coerce.number().int().positive().optional(),
    dentistId: z.union([z.coerce.number().int().positive(), z.string().min(1)]).optional(),
    status: z.enum(['scheduled', 'confirmed', 'attended', 'cancelled', 'no-show']).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const financialFilterSchema = z.object({
    type: z.enum(['income', 'expense']).optional(),
    status: z.enum(['paid', 'pending', 'overdue', 'INVOICED']).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// === Helper Functions ===

/**
 * Validate route parameter and return parsed value
 * @throws ZodError if validation fails
 */
export function validateParam<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}

/**
 * Validate route parameter and return result with error handling
 */
export function safeValidateParam<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    };
}
