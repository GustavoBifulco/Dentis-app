
import { HTTPException } from 'hono/http-exception';

/**
 * Enforces strict tenant (organization) isolation.
 * Throws 403 Forbidden if the user's active organization does not match the resource's organization.
 * 
 * @param user The authenticated user context object (must contain organizationId/organizationId)
 * @param resourceTenantId The organization ID associated with the resource being accessed
 * @param action Optional action name for logging
 */
export const checkTenantAccess = (user: any, resourceTenantId: number | string, action: string = 'access') => {
    if (!user) {
        throw new HTTPException(401, { message: 'User not authenticated' });
    }

    // Normalize IDs to strings for comparison to avoid string/number mismatches
    const userOrgId = String(user.organizationId || user.organizationId);
    const resourceOrgId = String(resourceTenantId);

    if (!userOrgId || userOrgId === 'undefined') {
        console.error(`Security Alert: User ${user.id} has no active organization context during ${action}.`);
        throw new HTTPException(403, { message: 'No active organization context' });
    }

    if (userOrgId !== resourceOrgId) {
        console.error(`SECURITY VIOLATION: User ${user.id} (Org: ${userOrgId}) attempted to ${action} resource in Org ${resourceOrgId}`);
        throw new HTTPException(403, { message: 'Access denied: Resource belongs to another organization' });
    }
};
