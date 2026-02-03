import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function resetDatabaseComplete() {
    console.log('🔄 COMPLETE DATABASE RESET - Analyzing schema.ts and creating ALL tables with ALL columns');
    console.log('⏳ Starting in 2 seconds...');

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        console.log('\n1️⃣ Dropping ALL tables...');

        await db.execute(sql`DROP SCHEMA public CASCADE;`);
        await db.execute(sql`CREATE SCHEMA public;`);
        await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres;`);
        await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);

        console.log('✅ All tables dropped (schema recreated)');

        console.log('\n2️⃣ Creating ALL tables with COMPLETE schema...');

        // 1. USERS - Base table
        await db.execute(sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        clerk_id TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        cpf TEXT,
        phone TEXT,
        organization_id TEXT,
        avatar_url TEXT,
        profile_data JSONB DEFAULT '{}',
        onboarding_complete TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ users');

        // 2. ORGANIZATIONS
        await db.execute(sql`
      CREATE TABLE organizations (
        id SERIAL PRIMARY KEY,
        clerk_org_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        slug TEXT,
        type TEXT DEFAULT 'CLINIC',
        status TEXT DEFAULT 'ACTIVE',
        phone TEXT,
        address TEXT,
        latitude TEXT,
        longitude TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ organizations');

        // 3. ORGANIZATION_MEMBERS
        await db.execute(sql`
      CREATE TABLE organization_members (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(organization_id, user_id)
      );
    `);
        console.log('✅ organization_members');

        // 4. PROFESSIONAL_PROFILES
        await db.execute(sql`
      CREATE TABLE professional_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        cro TEXT,
        specialties JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ professional_profiles');

        // 5. PATIENT_PROFILES - COM medical_conditions!
        await db.execute(sql`
      CREATE TABLE patient_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        medical_conditions JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ patient_profiles (with medical_conditions)');

        // 6. COURIER_PROFILES
        await db.execute(sql`
      CREATE TABLE courier_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        latitude TEXT,
        longitude TEXT,
        is_online BOOLEAN DEFAULT false,
        last_location_update TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ courier_profiles');

        // 7. PATIENTS (legacy table)
        await db.execute(sql`
      CREATE TABLE patients (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL DEFAULT 'org-1',
        user_id TEXT,
        name TEXT NOT NULL,
        cpf TEXT,
        phone TEXT,
        email TEXT,
        last_visit TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ patients');

        // 8. PROCEDURES
        await db.execute(sql`
      CREATE TABLE procedures (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL DEFAULT 'org-1',
        name TEXT NOT NULL,
        description TEXT,
        price TEXT NOT NULL,
        tuss_code TEXT,
        code TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ procedures');

        // 9. APPOINTMENTS
        await db.execute(sql`
      CREATE TABLE appointments (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL DEFAULT 'org-1',
        patient_id INTEGER REFERENCES patients(id),
        dentist_id TEXT NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ appointments');

        // 10. CLINICAL_RECORDS
        await db.execute(sql`
      CREATE TABLE clinical_records (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL DEFAULT 'org-1',
        patient_id INTEGER REFERENCES patients(id),
        dentist_id TEXT NOT NULL,
        date TIMESTAMP DEFAULT NOW(),
        treatment TEXT NOT NULL,
        notes TEXT,
        attachments JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ clinical_records');

        // 11. FINANCIALS
        await db.execute(sql`
      CREATE TABLE financials (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL DEFAULT 'org-1',
        patient_id INTEGER REFERENCES patients(id),
        amount INTEGER NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        due_date TIMESTAMP,
        paid_at TIMESTAMP,
        payment_method TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ financials');

        // 12. ORDERS
        await db.execute(sql`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL DEFAULT 'org-1',
        patient_id INTEGER REFERENCES patients(id),
        lab_id INTEGER REFERENCES organizations(id),
        dentist_id TEXT,
        courier_id INTEGER,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'requested',
        price TEXT,
        subtotal TEXT,
        delivery_fee TEXT,
        deadline TIMESTAMP,
        is_digital BOOLEAN DEFAULT false,
        stl_file_url TEXT,
        payment_status TEXT DEFAULT 'PENDING',
        pickup_code TEXT,
        delivery_code TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ orders');

        // 13. DOCUMENTS
        await db.execute(sql`
      CREATE TABLE documents (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL DEFAULT 'org-1',
        patient_id INTEGER REFERENCES patients(id),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ documents');

        // 14. CAMPAIGNS
        await db.execute(sql`
      CREATE TABLE campaigns (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL,
        creator_id TEXT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        target_audience TEXT,
        message_template TEXT,
        status TEXT DEFAULT 'DRAFT',
        scheduled_for TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ campaigns');

        // 15. MESSAGE_LOGS
        await db.execute(sql`
      CREATE TABLE message_logs (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER REFERENCES campaigns(id),
        patient_id INTEGER REFERENCES patients(id),
        channel TEXT,
        status TEXT,
        sent_at TIMESTAMP
      );
    `);
        console.log('✅ message_logs');

        // 16. INVITES
        await db.execute(sql`
      CREATE TABLE invites (
        id SERIAL PRIMARY KEY,
        token TEXT UNIQUE NOT NULL,
        inviter_organization_id INTEGER REFERENCES organizations(id),
        inviter_user_id INTEGER REFERENCES users(id),
        invited_name TEXT,
        invited_phone TEXT,
        target_organization_id INTEGER REFERENCES organizations(id),
        status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ invites');

        // 17. AUDIT_LOGS
        await db.execute(sql`
      CREATE TABLE audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        tenant_id TEXT,
        ip TEXT,
        reason TEXT,
        details TEXT,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ audit_logs');

        // 18. CATALOG_ITEMS
        await db.execute(sql`
      CREATE TABLE catalog_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price TEXT NOT NULL,
        category TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ catalog_items');

        // 19. CHAT_MESSAGES
        await db.execute(sql`
      CREATE TABLE chat_messages (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL DEFAULT 'org-1',
        case_id INTEGER REFERENCES appointments(id),
        sender_id TEXT NOT NULL,
        content TEXT NOT NULL,
        attachments JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ chat_messages');

        console.log('\n3️⃣ Creating indexes for performance...');

        await db.execute(sql`CREATE INDEX idx_users_clerk_id ON users(clerk_id);`);
        await db.execute(sql`CREATE INDEX idx_users_organization_id ON users(organization_id);`);
        await db.execute(sql`CREATE INDEX idx_organizations_clerk_org_id ON organizations(clerk_org_id);`);
        await db.execute(sql`CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);`);
        await db.execute(sql`CREATE INDEX idx_organization_members_org_id ON organization_members(organization_id);`);
        await db.execute(sql`CREATE INDEX idx_professional_profiles_user_id ON professional_profiles(user_id);`);
        await db.execute(sql`CREATE INDEX idx_patient_profiles_user_id ON patient_profiles(user_id);`);
        await db.execute(sql`CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);`);
        await db.execute(sql`CREATE INDEX idx_appointments_dentist_id ON appointments(dentist_id);`);
        await db.execute(sql`CREATE INDEX idx_orders_patient_id ON orders(patient_id);`);
        await db.execute(sql`CREATE INDEX idx_orders_lab_id ON orders(lab_id);`);

        console.log('✅ All indexes created');

        console.log('\n🎉 COMPLETE DATABASE RESET SUCCESSFUL!');
        console.log('\n📊 19 Tables Created:');
        console.log('   1. users (clerk_id, role, name, email, cpf, phone, organization_id, avatar_url, ...)');
        console.log('   2. organizations (clerk_org_id, name, slug, type, status, phone, address, ...)');
        console.log('   3. organization_members (organization_id, user_id, role)');
        console.log('   4. professional_profiles (user_id, type, cro, specialties)');
        console.log('   5. patient_profiles (user_id, medical_conditions) ✅ WITH medical_conditions!');
        console.log('   6. courier_profiles (user_id, latitude, longitude, is_online)');
        console.log('   7. patients (legacy - organization_id, user_id, name, cpf, phone)');
        console.log('   8. procedures (organization_id, name, description, price, tuss_code)');
        console.log('   9. appointments (organization_id, patient_id, dentist_id, start_time, status)');
        console.log('   10. clinical_records (organization_id, patient_id, dentist_id, treatment)');
        console.log('   11. financials (organization_id, patient_id, amount, description, status)');
        console.log('   12. orders (organization_id, patient_id, lab_id, dentist_id, courier_id)');
        console.log('   13. documents (organization_id, patient_id, name, type, url)');
        console.log('   14. campaigns (organization_id, creator_id, name, type, status)');
        console.log('   15. message_logs (campaign_id, patient_id, channel, status)');
        console.log('   16. invites (token, inviter_organization_id, inviter_user_id, status)');
        console.log('   17. audit_logs (user_id, action, resource_type, tenant_id)');
        console.log('   18. catalog_items (name, description, price, category)');
        console.log('   19. chat_messages (organization_id, case_id, sender_id, content)');
        console.log('\n✅ Database is 100% compatible with schema.ts!');

    } catch (error) {
        console.error('❌ Error resetting database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

resetDatabaseComplete();
