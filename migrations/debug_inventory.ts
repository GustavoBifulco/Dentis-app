import 'dotenv/config';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const debugInventory = async () => {
    console.log('🔍 Debugging inventory issue...\n');

    try {
        // Check if inventory table has data
        const inventoryCount = await db.execute(sql`
            SELECT COUNT(*) as count FROM inventory 
            WHERE organization_id = 'personal-user_398o0Fd61BNxA5pAqiP8pvnrENL'
        `);
        console.log(`📊 Inventory items in DB: ${inventoryCount[0].count}`);

        // Check a sample item
        const sampleItems = await db.execute(sql`
            SELECT id, name, category, quantity, unit, price 
            FROM inventory 
            WHERE organization_id = 'personal-user_398o0Fd61BNxA5pAqiP8pvnrENL'
            LIMIT 5
        `);

        console.log('\n📦 Sample items:');
        sampleItems.forEach((item: any) => {
            console.log(`  - ${item.name} (${item.category}) - ${item.quantity} ${item.unit} - R$ ${item.price}`);
        });

        // Check template inventory
        const templateCount = await db.execute(sql`
            SELECT COUNT(*) as count FROM template_inventory
        `);
        console.log(`\n📋 Template inventory items: ${templateCount[0].count}`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
};

debugInventory().then(() => process.exit(0));
