-- Add government credential fields to hosts table
ALTER TABLE hosts 
ADD COLUMN IF NOT EXISTS gov_ico VARCHAR(50),
ADD COLUMN IF NOT EXISTS gov_api_subject VARCHAR(255),
ADD COLUMN IF NOT EXISTS gov_keystore_path TEXT,
ADD COLUMN IF NOT EXISTS gov_keystore_iv TEXT,
ADD COLUMN IF NOT EXISTS gov_keystore_auth_tag TEXT,
ADD COLUMN IF NOT EXISTS gov_private_key_path TEXT,
ADD COLUMN IF NOT EXISTS gov_private_key_iv TEXT,
ADD COLUMN IF NOT EXISTS gov_private_key_auth_tag TEXT,
ADD COLUMN IF NOT EXISTS gov_credentials_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gov_credentials_verified_at TIMESTAMP WITH TIME ZONE;

-- Create an index for checking verification status
CREATE INDEX IF NOT EXISTS idx_hosts_gov_verified ON hosts(gov_credentials_verified);
