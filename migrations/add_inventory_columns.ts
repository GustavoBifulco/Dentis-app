import 'dotenv/config';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const addInventoryColumns = async () => {
    console.log('🔄 Adding columns to template_inventory and inventory tables...');

    try {
        // Add columns to template_inventory
        await db.execute(sql`
            ALTER TABLE template_inventory 
            ADD COLUMN IF NOT EXISTS category TEXT,
            ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
            ADD COLUMN IF NOT EXISTS min_quantity INTEGER DEFAULT 0
        `);
        console.log('✅ Columns added to template_inventory');

        // Add columns to inventory (for existing organizations)
        await db.execute(sql`
            ALTER TABLE inventory 
            ADD COLUMN IF NOT EXISTS category TEXT,
            ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
            ADD COLUMN IF NOT EXISTS supplier TEXT,
            ADD COLUMN IF NOT EXISTS link TEXT,
            ADD COLUMN IF NOT EXISTS min_stock INTEGER,
            ADD COLUMN IF NOT EXISTS current_stock INTEGER,
            ADD COLUMN IF NOT EXISTS photo_url TEXT,
            ADD COLUMN IF NOT EXISTS min_quantity INTEGER DEFAULT 0
        `);
        console.log('✅ Columns added to inventory');

        console.log('✅ Migration completed successfully');

    } catch (error) {
        console.error('❌ Error adding columns:', error);
        throw error;
    }
};

addInventoryColumns()
    .then(() => {
        console.log('✅ Column migration completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });
