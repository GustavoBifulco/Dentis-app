-- Migration: Add userId to patients and update patient_invitations schema
-- Date: 2026-02-04
-- Description: Adds support for patient user accounts and invitation system

-- 1. Add userId column to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS user_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);

-- 2. Update patient_invitations table schema
-- First, check if we need to recreate the table
DO $$
BEGIN
    -- Drop the old table if it exists with wrong schema
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'patient_invitations'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'patient_invitations' 
        AND column_name = 'patient_id'
    ) THEN
        DROP TABLE patient_invitations CASCADE;
    END IF;
END
$$;

-- Create or replace patient_invitations table with correct schema
CREATE TABLE IF NOT EXISTS patient_invitations (
    id SERIAL PRIMARY KEY,
    organization_id TEXT NOT NULL,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    prefilled_data JSONB,
    status TEXT DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patient_invitations_token ON patient_invitations(token);
CREATE INDEX IF NOT EXISTS idx_patient_invitations_patient_id ON patient_invitations(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_invitations_status ON patient_invitations(status);
CREATE INDEX IF NOT EXISTS idx_patient_invitations_expires_at ON patient_invitations(expires_at);

-- Add comment for documentation
COMMENT ON TABLE patient_invitations IS 'Stores invitation tokens for patients to create their accounts';
COMMENT ON COLUMN patient_invitations.prefilled_data IS 'JSON containing patient data to prefill registration: {name, email, phone, cpf}';
COMMENT ON COLUMN patient_invitations.used_at IS 'Timestamp when the invitation was accepted';
