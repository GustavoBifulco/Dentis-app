import { Context, Next } from 'hono';
import { db } from '../db';
import { userRoles, rolePermissions, permissions, userUnitScopes } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * Checks if the authenticated user has the required permission.
 * Strategies:
 * 1. Check if user is 'admin' (bypass).
 * 2. Fetch user roles.
 * 3. Fetch permissions for those roles.
 * 4. Match against required module/action.
 */
export const hasPermission = async (
    userId: string,
    organizationId: string,
    module: string,
    action: string
): Promise<boolean> => {
    // 1. Get User Roles in Org
    const roles = await db.select({ roleId: userRoles.roleId })
        .from(userRoles)
        .where(and(eq(userRoles.userId, userId), eq(userRoles.organizationId, organizationId)));

    if (roles.length === 0) return false;

    const roleIds = roles.map(r => r.roleId);

    // 2. Check permissions via join
    const perms = await db.select({
        module: permissions.module,
        action: permissions.action
    })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(inArray(rolePermissions.roleId, roleIds));

    // 3. Verify match
    return perms.some(p =>
        (p.module === module || p.module === '*') &&
        (p.action === action || p.action === '*')
    );
};

export const getUserPermissions = async (userId: string, organizationId: string): Promise<string[]> => {
    const roles = await db.select({ roleId: userRoles.roleId })
        .from(userRoles)
        .where(and(eq(userRoles.userId, userId), eq(userRoles.organizationId, organizationId)));

    if (roles.length === 0) return [];

    const roleIds = roles.map(r => r.roleId);

    const perms = await db.select({
        module: permissions.module,
        action: permissions.action
    })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(inArray(rolePermissions.roleId, roleIds));

    return perms.map(p => `${p.module}:${p.action}`);
};

export const requirePermission = (module: string, action: string) => {
    return async (c: Context, next: Next) => {
        const user = c.get('user');
        const organizationId = c.get('organizationId');

        if (!user || !organizationId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Bypass for 'admin' role in legacy field if useful, but we should rely on RBAC tables now.
        if (user.role === 'admin') {
            await next();
            return;
        }

        // Check granular permissions
        // Note: userId is usually stored as string (Clerk ID) in user.id or user.clerkId.
        // Schema uses text for userId.
        const allowed = await hasPermission(String(user.id), organizationId, module, action);

        if (!allowed) {
            return c.json({ error: `Forbidden: Requires ${module}.${action}` }, 403);
        }

        await next();
    };
};
