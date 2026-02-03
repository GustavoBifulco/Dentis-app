import 'dotenv/config';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const addProcedureColumns = async () => {
    console.log('🔄 Adding columns to procedures table...');

    try {
        await db.execute(sql`
            ALTER TABLE procedures 
            ADD COLUMN IF NOT EXISTS category TEXT,
            ADD COLUMN IF NOT EXISTS subcategory TEXT,
            ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 60
        `);
        console.log('✅ Columns added to procedures table');

    } catch (error) {
        console.error('❌ Error adding columns:', error);
        throw error;
    }
};

addProcedureColumns()
    .then(() => {
        console.log('✅ Migration completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });
