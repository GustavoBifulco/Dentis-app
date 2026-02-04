import { db } from '../db';
import { roles, permissions, rolePermissions } from '../db/schema';
import { eq } from 'drizzle-orm';

const DEFAULT_ROLES = [
    { name: 'admin', description: 'Full access to everything' },
    { name: 'dentist', description: 'Clinical access, can sign records' },
    { name: 'receptionist', description: 'Schedule and basic registration' },
    { name: 'assistant', description: 'Clinical view, draft notes, no signing' },
    { name: 'finance', description: 'Financials only' }
];

const PERMISSIONS_MAP: Record<string, { module: string, action: string }[]> = {
    'admin': [{ module: '*', action: '*' }],
    'dentist': [
        { module: 'clinical', action: 'view' },
        { module: 'clinical', action: 'edit' },
        { module: 'clinical', action: 'sign' },
        { module: 'schedule', action: 'view' },
        { module: 'schedule', action: 'edit' },
    ],
    'receptionist': [
        { module: 'clinical', action: 'view_basic' }, // No deep details
        { module: 'schedule', action: '*' },
        { module: 'patient', action: '*' },
    ],
    'assistant': [
        { module: 'clinical', action: 'view' },
        { module: 'clinical', action: 'edit_draft' },
    ],
    'finance': [
        { module: 'finance', action: '*' },
    ]
};

export const seedRBAC = async (organizationId: string) => {
    // 1. Create permissions (Global)
    // Flatten all permissions
    const allPerms = new Set<string>();
    Object.values(PERMISSIONS_MAP).flat().forEach(p => allPerms.add(`${p.module}:${p.action}`));

    for (const pStr of allPerms) {
        const [module, action] = pStr.split(':');
        const existing = await db.select().from(permissions).where(and(eq(permissions.module, module), eq(permissions.action, action))).limit(1);

        if (existing.length === 0) {
            await db.insert(permissions).values({ module, action });
        }
    }

    // 2. Create Roles for Org
    for (const r of DEFAULT_ROLES) {
        let roleId: number;
        const existingRole = await db.select().from(roles).where(and(eq(roles.name, r.name), eq(roles.organizationId, organizationId))).limit(1);

        if (existingRole.length === 0) {
            const [newRole] = await db.insert(roles).values({
                organizationId,
                name: r.name,
                description: r.description,
                isSystem: true
            }).returning();
            roleId = newRole.id;
        } else {
            roleId = existingRole[0].id;
        }

        // 3. Assign Perms
        const rolePerms = PERMISSIONS_MAP[r.name] || [];
        for (const rp of rolePerms) {
            // Find permission ID
            const permDef = await db.select().from(permissions).where(and(eq(permissions.module, rp.module), eq(permissions.action, rp.action))).limit(1);
            if (permDef.length > 0) {
                // Check if link exists
                const link = await db.select().from(rolePermissions).where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permDef[0].id))).limit(1);
                if (link.length === 0) {
                    await db.insert(rolePermissions).values({ roleId, permissionId: permDef[0].id });
                }
            }
        }
    }
};

// Helper for 'and' import if missing
import { and } from 'drizzle-orm';
