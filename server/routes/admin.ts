import { Hono } from 'hono';
import { db } from '../db';
import { clinicProvisioningRequests } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

const admin = new Hono();

/**
 * TEMPORARY ENDPOINT: Fix stuck provisioning requests
 * Call this from browser: /api/admin/fix-provisioning
 */
admin.get('/fix-provisioning', async (c) => {
    try {
        // Get the most recent provisioning requests
        const requests = await db
            .select()
            .from(clinicProvisioningRequests)
            .orderBy(desc(clinicProvisioningRequests.createdAt))
            .limit(10);

        const results = [];

        for (const req of requests) {
            results.push({
                id: req.id,
                status: req.status,
                orgId: req.clerkOrganizationId,
                name: req.desiredName
            });
        }

        // Find the one that needs to be updated (has org but status is not provisioned)
        const needsUpdate = requests.find(r => r.clerkOrganizationId && r.status !== 'provisioned');

        if (needsUpdate) {
            console.log(`🔧 [ADMIN] Updating request ${needsUpdate.id} to 'provisioned' status...`);

            await db
                .update(clinicProvisioningRequests)
                .set({ status: 'provisioned' })
                .where(eq(clinicProvisioningRequests.id, needsUpdate.id));

            return c.json({
                success: true,
                message: `Updated request ${needsUpdate.id} to 'provisioned'`,
                updated: {
                    id: needsUpdate.id,
                    previousStatus: needsUpdate.status,
                    newStatus: 'provisioned',
                    orgId: needsUpdate.clerkOrganizationId
                },
                allRequests: results
            });
        } else {
            return c.json({
                success: false,
                message: 'No provisioning request found that needs updating',
                allRequests: results
            });
        }
    } catch (error: any) {
        console.error('❌ [ADMIN] Error:', error);
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});

export default admin;
