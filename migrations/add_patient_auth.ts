import 'dotenv/config';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const addPatientAuth = async () => {
    console.log('🔄 Adding patient authentication fields...');

    try {
        // Add authentication fields to users table
        await db.execute(sql`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS password_hash TEXT,
            ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS verification_token TEXT,
            ADD COLUMN IF NOT EXISTS reset_password_token TEXT,
            ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP
        `);
        console.log('✅ Authentication fields added to users table');

        // Create sessions table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                token TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Sessions table created');

        // Create index on token for faster lookups
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)
        `);
        console.log('✅ Session token index created');

        // Create index on user_id for faster lookups
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
        `);
        console.log('✅ Session user_id index created');

        console.log('✅ Patient authentication migration completed successfully');

    } catch (error) {
        console.error('❌ Error adding patient authentication:', error);
        throw error;
    }
};

addPatientAuth()
    .then(() => {
        console.log('✅ Migration completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });
