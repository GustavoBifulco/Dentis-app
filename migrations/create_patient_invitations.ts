import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function createPatientInvitationsTable() {
    console.log('Creating patient_invitations table...');

    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS patient_invitations (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      prefilled_data JSONB NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_by TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_patient_invitations_token ON patient_invitations(token);
    CREATE INDEX IF NOT EXISTS idx_patient_invitations_patient_id ON patient_invitations(patient_id);
  `);

    console.log('✅ patient_invitations table created successfully');
}

createPatientInvitationsTable()
    .then(() => {
        console.log('Migration completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
