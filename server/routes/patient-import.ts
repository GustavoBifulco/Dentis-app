import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { patients } from '../db/schema';
import { scopedDb } from '../db/scoped';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const app = new Hono();
app.use('*', authMiddleware);

// Column mapping - recognizes common variations
const COLUMN_MAPPINGS: Record<string, string[]> = {
    name: ['name', 'nome', 'patient_name', 'paciente', 'full_name', 'nome_completo', 'patient'],
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

function parseCSV(fileContent: string): any[] {
    const result = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
    });

    return result.data;
}

function parseExcel(buffer: Buffer): any[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    return XLSX.utils.sheet_to_json(sheet);
}

function parseSQL(sqlContent: string): any[] {
    const patients: any[] = [];

    // Match INSERT INTO statements
    const insertRegex = /INSERT\s+INTO\s+\w+\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/gi;
    let match;

    while ((match = insertRegex.exec(sqlContent)) !== null) {
        const columns = match[1].split(',').map(c => c.trim().replace(/[`'"]/g, ''));
        const values = match[2].split(',').map(v => v.trim().replace(/['"]/g, ''));

        const patient: any = {};
        columns.forEach((col, idx) => {
            if (values[idx]) {
                patient[col] = values[idx];
            }
        });

        patients.push(patient);
    }

    return patients;
}

function transformPatientData(rawData: any[], columnMapping: Record<string, string>): any[] {
    return rawData.map(row => {
        const patient: any = {
            status: 'active',
        };

        Object.entries(row).forEach(([key, value]) => {
            const targetField = columnMapping[key];
            if (targetField && value) {
                patient[targetField] = String(value).trim();
            }
        });

        // Ensure at least name exists
        if (!patient.name) {
            // Try to find any field that might be a name
            const possibleName = Object.values(row).find(v => v && String(v).length > 2);
            if (possibleName) {
                patient.name = String(possibleName);
            }
        }

        return patient;
    }).filter(p => p.name); // Only keep patients with names
}

app.post('/upload', async (c) => {
    try {
        const auth = c.get('auth');
        const body = await c.req.parseBody();
        const file = body['file'] as File;

        if (!file) {
            return c.json({ error: 'No file uploaded' }, 400);
        }

        const fileName = file.name.toLowerCase();
        const fileContent = await file.text();
        let rawData: any[] = [];

        // Parse based on file type
        if (fileName.endsWith('.csv')) {
            rawData = parseCSV(fileContent);
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            const buffer = Buffer.from(await file.arrayBuffer());
            rawData = parseExcel(buffer);
        } else if (fileName.endsWith('.sql')) {
            rawData = parseSQL(fileContent);
        } else {
            return c.json({ error: 'Unsupported file type. Use CSV, Excel, or SQL.' }, 400);
        }

        if (rawData.length === 0) {
            return c.json({ error: 'No data found in file' }, 400);
        }

        // Map columns
        const headers = Object.keys(rawData[0]);
        const columnMapping = mapColumns(headers);

        // Transform data
        const transformedData = transformPatientData(rawData, columnMapping);

        if (transformedData.length === 0) {
            return c.json({ error: 'No valid patient data found (at least name is required)' }, 400);
        }

        // Bulk insert
        const scoped = scopedDb(c);
        const insertedPatients = await scoped.insert(patients).values(
            transformedData.map(p => ({
                ...p,
                organizationId: auth.organizationId,
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
            error: 'Failed to import patients',
            details: error.message
        }, 500);
    }
});

export default app;
