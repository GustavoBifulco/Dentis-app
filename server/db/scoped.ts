import { eq } from 'drizzle-orm';
import type { Context } from 'hono';
import { db } from './index'; // ajuste se necessário
import { ForbiddenError } from '../errors'; // crie se não existir

export interface AuthContext {
    userId: string;
    organizationId: string;
    role: 'dentist' | 'patient' | 'clinic_owner' | 'admin';
}

export function scopedDb(c: Context) {
    const auth = c.get('auth') as AuthContext | undefined;
    if (!auth || !auth.organizationId) {
        throw new ForbiddenError('Contexto de tenant inválido: organizationId ausente');
    }

    const organizationId = auth.organizationId;

    return {
        // Simple wrappers for multi-tenant awareness
        select: (table: any) => db.select().from(table).where(eq(table.organizationId, organizationId)),
        insert: (table: any) => ({
            values: (values: any) => {
                const withOrg = Array.isArray(values)
                    ? values.map(v => ({ ...v, organizationId }))
                    : { ...values, organizationId };
                return db.insert(table).values(withOrg);
            },
        }),
        update: (table: any) => ({
            set: (values: any) => db.update(table).set(values).where(eq(table.organizationId, organizationId))
        }),
        delete: (table: any) => db.delete(table).where(eq(table.organizationId, organizationId)),
        query: db.query // Direct access to relations, but use with caution (not scoped here)
    } as any;
}

