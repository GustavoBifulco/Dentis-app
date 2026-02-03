import 'dotenv/config';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const checkCounts = async () => {
    console.log('📊 Checking database counts...\n');

    try {
        const procCount = await db.execute(sql`SELECT COUNT(*) as count FROM template_procedures`);
        const invCount = await db.execute(sql`SELECT COUNT(*) as count FROM template_inventory`);

        console.log(`✅ Template Procedures: ${procCount[0].count}`);
        console.log(`✅ Template Inventory: ${invCount[0].count}`);

        if (procCount[0].count < 101) {
            console.log(`\n⚠️  Expected 101 procedures, found ${procCount[0].count}`);
        } else {
            console.log('\n✅ All 101 procedures present!');
        }

        if (invCount[0].count < 100) {
            console.log(`⚠️  Expected 100+ inventory items, found ${invCount[0].count}`);
        } else {
            console.log('✅ All 100+ inventory items present!');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
};

checkCounts().then(() => process.exit(0));
