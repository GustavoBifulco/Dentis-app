-- Migration: Add organization_id column to users table
-- This column was missing in the database but is defined in the schema

-- Add organization_id column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- Add phone column if it doesn't exist (also needed for onboarding)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
