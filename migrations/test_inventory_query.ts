import 'dotenv/config';
import { db } from '../server/db';
import { inventory } from '../server/db/schema';
import { eq } from 'drizzle-orm';

const testInventoryQuery = async () => {
    console.log('🔍 Testing inventory query with Drizzle...\n');

    try {
        const orgId = 'personal-user_398o0Fd61BNxA5pAqiP8pvnrENL';

        // Test the exact query the API would use
        const items = await db
            .select()
            .from(inventory)
            .where(eq(inventory.organizationId, orgId));

        console.log(`✅ Found ${items.length} items`);

        if (items.length > 0) {
            console.log('\n📦 First 3 items:');
            items.slice(0, 3).forEach((item) => {
                console.log(`  ID: ${item.id}`);
                console.log(`  Name: ${item.name}`);
                console.log(`  Category: ${item.category}`);
                console.log(`  Quantity: ${item.quantity}`);
                console.log(`  Unit: ${item.unit}`);
                console.log(`  Price: ${item.price}`);
                console.log(`  ---`);
            });

            // Check if category field is being returned
            const hasCategory = items.every(item => item.category !== undefined);
            console.log(`\n✅ All items have category field: ${hasCategory}`);

            // Check unique categories
            const categories = [...new Set(items.map(i => i.category))];
            console.log(`\n📊 Unique categories (${categories.length}):`);
            categories.forEach(cat => console.log(`  - ${cat}`));
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
};

testInventoryQuery().then(() => process.exit(0));
