import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function runMigration() {
    console.log('🔄 Running migration: Add missing columns to users table...');

    try {
        // Add organization_id column
        await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id TEXT;
    `);
        console.log('✅ Added organization_id column');

        // Add phone column
        await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
    `);
        console.log('✅ Added phone column');

        // Create indexes
        await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
    `);
        console.log('✅ Created index on organization_id');

        await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
    `);
        console.log('✅ Created index on clerk_id');

        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

runMigration();
