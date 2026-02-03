
import 'dotenv/config';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const fixTables = async () => {
    console.log('🔄 Creating missing tables...');

    try {
        // Inventory Table
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL DEFAULT 'org-1',
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 0,
        unit TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ Inventory table created');

    } catch (error) {
        console.error('❌ Error creating tables:', error);
    }
};

fixTables();
