import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { patients } from '../db/schema';
import { db } from '../db';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

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

        Object.entries(row).forEach(([key, value]) => {
            const targetField = columnMapping[key];
            if (targetField && value) {
                const trimmedValue = String(value).trim();

                // Handle separate first and last name columns
                if (targetField === 'firstName') {
                    firstName = trimmedValue;
                } else if (targetField === 'lastName') {
                    lastName = trimmedValue;
                } else if (targetField === 'name') {
                    // If we have a full name column, use it directly
                    patient.name = trimmedValue;
                } else {
                    patient[targetField] = trimmedValue;
                }
            }
        });

        // Combine firstName + lastName if we don't have a full name
        if (!patient.name && (firstName || lastName)) {
            patient.name = `${firstName} ${lastName}`.trim();
        }

        // Ensure at least name exists
        if (!patient.name) {
            // Try to find any field that might be a name (fallback)
            const possibleName = Object.values(row).find(v => v && String(v).length > 2);
            if (possibleName) {
                patient.name = String(possibleName).trim();
            }
        }

        return patient;
    }).filter(p => p.name); // Only keep patients with names
}

app.post('/upload', async (c) => {
    try {
        const auth = c.get('auth');
        let rawData: any[] = [];

        // Try to parse JSON body first (Client-side parsed)
        try {
            const body = await c.req.json();
            if (body.patients && Array.isArray(body.patients)) {
                rawData = body.patients;
            }
        } catch (e) {
            // Fallback for direct File Upload (Server-side parse) - Optional/Legacy support if needed
            // For now, we focus on the JSON path as per requirements
        }

        if (rawData.length === 0) {
            return c.json({ error: 'Nenhum dado válido recebido. Verifique o arquivo.' }, 400);
        }

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
