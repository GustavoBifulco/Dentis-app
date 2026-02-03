import 'dotenv/config';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const recreateAppointmentTables = async () => {
    console.log('🔄 Recreating appointment system tables...\n');

    try {
        // Drop existing tables in correct order (respecting foreign keys)
        console.log('Dropping existing tables...');
        await db.execute(sql`DROP TABLE IF EXISTS notification_logs CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS appointment_requests CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS appointment_settings CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS appointments CASCADE`);
        console.log('✅ Old tables dropped\n');

        // 1. Appointments table
        console.log('Creating appointments table...');
        await db.execute(sql`
            CREATE TABLE appointments (
                id SERIAL PRIMARY KEY,
                organization_id TEXT NOT NULL,
                patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
                dentist_id TEXT NOT NULL,
                
                -- Scheduling info
                scheduled_date DATE NOT NULL,
                scheduled_time TIME NOT NULL,
                duration INTEGER DEFAULT 60,
                status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
                
                -- Clinical details
                appointment_type TEXT DEFAULT 'consulta' CHECK (appointment_type IN ('consulta', 'retorno', 'urgência', 'procedimento')),
                procedure_id INTEGER REFERENCES procedures(id) ON DELETE SET NULL,
                notes TEXT,
                chief_complaint TEXT,
                
                -- Follow-up control
                is_followup BOOLEAN DEFAULT false,
                parent_appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
                
                -- Notifications
                notify_patient BOOLEAN DEFAULT true,
                notification_sent BOOLEAN DEFAULT false,
                notification_sent_at TIMESTAMP,
                confirmation_required BOOLEAN DEFAULT true,
                confirmed_at TIMESTAMP,
                confirmed_by TEXT,
                
                -- Reminders
                reminder_24h_sent BOOLEAN DEFAULT false,
                reminder_2h_sent BOOLEAN DEFAULT false,
                
                -- Metadata
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                cancelled_at TIMESTAMP,
                cancellation_reason TEXT
            )
        `);
        console.log('✅ Appointments table created');

        // 2. Appointment settings table
        console.log('Creating appointment_settings table...');
        await db.execute(sql`
            CREATE TABLE appointment_settings (
                id SERIAL PRIMARY KEY,
                organization_id TEXT NOT NULL UNIQUE,
                
                -- Availability
                allow_patient_booking BOOLEAN DEFAULT false,
                booking_advance_days INTEGER DEFAULT 30,
                booking_buffer_hours INTEGER DEFAULT 24,
                
                -- Working hours (JSON)
                working_hours JSONB DEFAULT '{
                    "monday": {"enabled": true, "start": "08:00", "end": "18:00", "break_start": "12:00", "break_end": "13:00"},
                    "tuesday": {"enabled": true, "start": "08:00", "end": "18:00", "break_start": "12:00", "break_end": "13:00"},
                    "wednesday": {"enabled": true, "start": "08:00", "end": "18:00", "break_start": "12:00", "break_end": "13:00"},
                    "thursday": {"enabled": true, "start": "08:00", "end": "18:00", "break_start": "12:00", "break_end": "13:00"},
                    "friday": {"enabled": true, "start": "08:00", "end": "18:00", "break_start": "12:00", "break_end": "13:00"},
                    "saturday": {"enabled": false, "start": "08:00", "end": "12:00"},
                    "sunday": {"enabled": false}
                }'::jsonb,
                
                -- Slot configuration
                default_slot_duration INTEGER DEFAULT 60,
                slot_interval INTEGER DEFAULT 30,
                max_appointments_per_day INTEGER DEFAULT 10,
                
                -- WhatsApp (for future use)
                whatsapp_enabled BOOLEAN DEFAULT false,
                whatsapp_number TEXT,
                send_confirmation_requests BOOLEAN DEFAULT true,
                send_reminders BOOLEAN DEFAULT true,
                reminder_24h_enabled BOOLEAN DEFAULT true,
                reminder_2h_enabled BOOLEAN DEFAULT true,
                
                -- Blocked dates and exceptions
                blocked_dates JSONB DEFAULT '[]'::jsonb,
                special_hours JSONB DEFAULT '[]'::jsonb,
                
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Appointment settings table created');

        // 3. Appointment requests table
        console.log('Creating appointment_requests table...');
        await db.execute(sql`
            CREATE TABLE appointment_requests (
                id SERIAL PRIMARY KEY,
                organization_id TEXT NOT NULL,
                patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
                
                -- Request details
                requested_date DATE NOT NULL,
                requested_time TIME NOT NULL,
                preferred_duration INTEGER DEFAULT 60,
                reason TEXT NOT NULL,
                urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent')),
                
                -- Status
                status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
                reviewed_by TEXT,
                reviewed_at TIMESTAMP,
                rejection_reason TEXT,
                
                -- Link to created appointment
                appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
                
                created_at TIMESTAMP DEFAULT NOW(),
                expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '48 hours'
            )
        `);
        console.log('✅ Appointment requests table created');

        // 4. Notification logs table
        console.log('Creating notification_logs table...');
        await db.execute(sql`
            CREATE TABLE notification_logs (
                id SERIAL PRIMARY KEY,
                organization_id TEXT NOT NULL,
                appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
                patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
                
                -- Type and channel
                notification_type TEXT NOT NULL CHECK (notification_type IN ('confirmation', 'reminder_24h', 'reminder_2h', 'cancellation', 'rescheduled', 'request_approved', 'request_rejected')),
                channel TEXT DEFAULT 'app' CHECK (channel IN ('whatsapp', 'sms', 'email', 'app')),
                
                -- Content
                message TEXT NOT NULL,
                template_id TEXT,
                
                -- Status
                status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
                sent_at TIMESTAMP,
                delivered_at TIMESTAMP,
                read_at TIMESTAMP,
                failed_at TIMESTAMP,
                error_message TEXT,
                
                -- Response (for confirmations)
                response_received BOOLEAN DEFAULT false,
                response_text TEXT,
                response_at TIMESTAMP,
                
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Notification logs table created');

        // 5. Create indexes for performance
        console.log('\nCreating indexes...');
        await db.execute(sql`
            CREATE INDEX idx_appointments_org_date ON appointments(organization_id, scheduled_date);
            CREATE INDEX idx_appointments_patient ON appointments(patient_id);
            CREATE INDEX idx_appointments_status ON appointments(status);
            CREATE INDEX idx_appointment_requests_org ON appointment_requests(organization_id, status);
            CREATE INDEX idx_notification_logs_appointment ON notification_logs(appointment_id);
        `);
        console.log('✅ Indexes created');

        // 6. Seed default settings for existing organizations
        console.log('\nSeeding default settings for existing organizations...');
        await db.execute(sql`
            INSERT INTO appointment_settings (organization_id)
            SELECT DISTINCT organization_id FROM patients
            ON CONFLICT (organization_id) DO NOTHING
        `);
        console.log('✅ Default settings seeded');

        console.log('\n✅ All appointment tables created successfully!');

    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    }
};

recreateAppointmentTables()
    .then(() => {
        console.log('\n🎉 Migration completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    });
