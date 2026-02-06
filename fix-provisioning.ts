import { db } from './server/db';
import { clinicProvisioningRequests } from './server/db/schema';
import { desc, eq } from 'drizzle-orm';

async function fixProvisioningStatus() {
    try {
        // Get the most recent provisioning requests
        const requests = await db
            .select()
            .from(clinicProvisioningRequests)
            .orderBy(desc(clinicProvisioningRequests.createdAt))
            .limit(5);

        console.log('📋 Recent provisioning requests:');
        requests.forEach((req, idx) => {
            console.log(`${idx + 1}. ID: ${req.id}`);
            console.log(`   Status: ${req.status}`);
            console.log(`   Org ID: ${req.clerkOrganizationId || 'N/A'}`);
            console.log(`   Name: ${req.desiredName || 'N/A'}`);
            console.log('');
        });

        // Find the one that needs to be updated (has org but status is not provisioned)
        const needsUpdate = requests.find(r => r.clerkOrganizationId && r.status !== 'provisioned');

        if (needsUpdate) {
            console.log(`🔧 Updating request ${needsUpdate.id} to 'provisioned' status...`);

            await db
                .update(clinicProvisioningRequests)
                .set({ status: 'provisioned' })
                .where(eq(clinicProvisioningRequests.id, needsUpdate.id));

            console.log('✅ Status updated successfully!');
            console.log('🎉 The user should now be redirected automatically.');
        } else {
            console.log('⚠️ No provisioning request found that needs updating.');
            console.log('Either all are already provisioned, or the webhook hasn\'t created the org yet.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixProvisioningStatus();
