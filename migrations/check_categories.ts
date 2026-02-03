import 'dotenv/config';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const checkInventoryCategories = async () => {
    console.log('📊 Checking inventory categories...\n');

    try {
        const result = await db.execute(sql`
            SELECT category, COUNT(*) as count 
            FROM inventory 
            WHERE organization_id = 'personal-user_398o0Fd61BNxA5pAqiP8pvnrENL'
            GROUP BY category 
            ORDER BY category
        `);

        console.log('Categories found:');
        result.forEach((row: any) => {
            console.log(`  - ${row.category || '(null)'}: ${row.count} items`);
        });

        console.log(`\n✅ Total categories: ${result.length}`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
};

checkInventoryCategories().then(() => process.exit(0));
