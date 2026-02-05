import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { patients } from '../db/schema';
import { db } from '../db';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();
app.use('*', authMiddleware);

// Column mapping - recognizes common variations
const COLUMN_MAPPINGS: Record<string, string[]> = {
    name: ['name', 'nome', 'patient_name', 'paciente', 'full_name', 'nome_completo', 'patient', 'nome completo'],
    firstName: ['first_name', 'firstname', 'primeiro_nome', 'nome_proprio', 'first', 'given_name'],
    lastName: ['last_name', 'lastname', 'sobrenome', 'last', 'surname', 'family_name', 'apellido'],
    phone: ['phone', 'telefone', 'celular', 'mobile', 'contact', 'tel', 'fone', 'whatsapp'],
    email: ['email', 'e-mail', 'mail', 'correio'],
    cpf: ['cpf', 'document', 'documento', 'tax_id'],
    birthDate: ['birth_date', 'birthdate', 'data_nascimento', 'dob', 'date_of_birth', 'nascimento'],
    address: ['address', 'endereco', 'endereço', 'rua', 'street'],
    notes: ['notes', 'observacoes', 'observações', 'obs', 'comments', 'comentarios'],
};

function normalizeColumnName(col: string): string {
    return col.toLowerCase().trim().replace(/[_\s-]+/g, '_');
}

function mapColumns(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};

    headers.forEach(header => {
        const normalized = normalizeColumnName(header);

        for (const [targetField, variations] of Object.entries(COLUMN_MAPPINGS)) {
            if (variations.some(v => normalized.includes(v) || v.includes(normalized))) {
                mapping[header] = targetField;
                break;
            }
        }
    });

    return mapping;
}

function transformPatientData(rawData: any[], columnMapping: Record<string, string>): any[] {
    return rawData.map(row => {
        const patient: any = {
            status: 'active',
        };

        let firstName = '';
        let lastName = '';
        let fullNameFromRow = '';

        Object.entries(row).forEach(([key, value]) => {
            const targetField = columnMapping[key];
            if (targetField && value) {
                const trimmedValue = String(value).trim();

                if (targetField === 'firstName') {
                    firstName = trimmedValue;
                } else if (targetField === 'lastName') {
                    lastName = trimmedValue;
                } else if (targetField === 'name') {
                    fullNameFromRow = trimmedValue;
                } else {
                    patient[targetField] = trimmedValue;
                }
            }
        });

        // Use full name if separate parts aren't fully provided
        if (fullNameFromRow && (!firstName || !lastName)) {
            // If they are missing parts, we can try to split, but usually JSON from client is already fixed
            // However, if this route is called with raw file data (direct upload), we split
            if (!firstName && !lastName) {
                patient.name = fullNameFromRow;
            } else {
                // If it's a mix, let's prefer the combined name logic
                patient.name = fullNameFromRow;
            }
        } else if (firstName || lastName) {
            patient.name = `${firstName} ${lastName}`.trim();
        } else {
            patient.name = fullNameFromRow;
        }

        // Ensure at least name exists
        if (!patient.name) {
            const possibleName = Object.values(row).find(v => v && String(v).length > 2);
            if (possibleName) {
                patient.name = String(possibleName).trim();
            }
        }

        return patient;
    }).filter(p => p.name); // Only keep patients with names
}

const importSchema = z.object({
    patients: z.array(z.record(z.string(), z.any())).min(1, 'Nenhum paciente enviado')
});

app.post('/upload', zValidator('json', importSchema), async (c) => {
    try {
        const auth = c.get('auth');
        const body = c.req.valid('json');

        // We know rawData is body.patients because of schema
        const rawData = body.patients;

        // Map columns
        const headers = Object.keys(rawData[0]);
        const columnMapping = mapColumns(headers);

        // Transform data
        const transformedData = transformPatientData(rawData, columnMapping);

        if (transformedData.length === 0) {
            return c.json({ error: 'Nenhum paciente válido encontrado (o Nome é obrigatório).' }, 400);
        }

        // Bulk insert
        // Use db directly with organizationId - remove scopedDb which was causing issues
        const insertedPatients = await db.insert(patients).values(
            transformedData.map(p => ({
                ...p,
                organizationId: auth.organizationId,
                // Default fallback for optional fields to avoid undefined errors if any
                email: p.email || null,
                phone: p.phone || null,
                cpf: p.cpf || null,
            }))
        ).returning();

        return c.json({
            success: true,
            imported: insertedPatients.length,
            total: rawData.length,
            skipped: rawData.length - insertedPatients.length,
            patients: insertedPatients,
        });

    } catch (error: any) {
        console.error('Import error:', error);
        return c.json({
            error: 'Falha ao importar pacientes',
            details: error.message
        }, 500);
    }
});

export default app;
