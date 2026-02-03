import 'dotenv/config';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const applySeedToExistingOrgs = async () => {
    console.log('🔄 Applying new seed data to all existing organizations...');

    try {
        // Get all unique organization IDs from inventory or procedures
        const orgsResult = await db.execute(sql`
            SELECT DISTINCT organization_id 
            FROM inventory 
            WHERE organization_id IS NOT NULL
            UNION
            SELECT DISTINCT organization_id 
            FROM procedures 
            WHERE organization_id IS NOT NULL
        `);

        const organizations = orgsResult.map((row: any) => row.organization_id);
        console.log(`📊 Found ${organizations.length} organizations to update`);

        if (organizations.length === 0) {
            console.log('⚠️ No organizations found');
            return;
        }

        for (const orgId of organizations) {
            console.log(`\n🔄 Processing organization: ${orgId}`);

            // Clear existing inventory for this org
            await db.execute(sql`DELETE FROM inventory WHERE organization_id = ${orgId}`);
            console.log(`  ✅ Cleared old inventory`);

            // Clear existing procedures for this org
            await db.execute(sql`DELETE FROM procedures WHERE organization_id = ${orgId}`);
            console.log(`  ✅ Cleared old procedures`);

            // Copy inventory from templates
            await db.execute(sql`
                INSERT INTO inventory (organization_id, name, quantity, unit, category, price, min_quantity)
                SELECT 
                    ${orgId},
                    name,
                    quantity,
                    unit,
                    category,
                    price,
                    min_quantity
                FROM template_inventory
            `);
            console.log(`  ✅ Copied new inventory from templates`);

            // Copy procedures from templates
            await db.execute(sql`
                INSERT INTO procedures (organization_id, name, description, price, category, subcategory, duration)
                SELECT 
                    ${orgId},
                    name,
                    description,
                    price,
                    category,
                    subcategory,
                    duration
                FROM template_procedures
            `);
            console.log(`  ✅ Copied new procedures from templates`);

            console.log(`  ✨ Organization ${orgId} updated successfully`);
        }

        console.log(`\n✅ All ${organizations.length} organizations updated with new seed data!`);

    } catch (error) {
        console.error('❌ Error applying seed to existing orgs:', error);
        throw error;
    }
};

applySeedToExistingOrgs()
    .then(() => {
        console.log('\n✅ Migration completed successfully');
        console.log('🎉 All existing accounts now have the updated inventory and procedures!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });
