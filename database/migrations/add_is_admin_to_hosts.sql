-- Migration: Add is_admin flag to hosts table
-- This enables a super-admin user to access the /admin dashboard

ALTER TABLE hosts
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index for fast admin lookups
CREATE INDEX IF NOT EXISTS idx_hosts_is_admin ON hosts(is_admin) WHERE is_admin = TRUE;

-- To grant admin to yourself, run:
-- UPDATE hosts SET is_admin = TRUE WHERE email = 'your@email.com';
