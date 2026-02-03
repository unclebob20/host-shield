-- Add government credentials to hosts table
-- This allows each host to use their own eID credentials for submissions

ALTER TABLE hosts ADD COLUMN IF NOT EXISTS gov_ico VARCHAR(50);
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS gov_keystore_path VARCHAR(255);
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS gov_api_subject VARCHAR(100);
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS gov_private_key_path VARCHAR(255);
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS gov_credentials_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS gov_credentials_verified_at TIMESTAMP;

-- Add comments for clarity
COMMENT ON COLUMN hosts.gov_ico IS 'Slovak organization ICO number (identification number)';
COMMENT ON COLUMN hosts.gov_keystore_path IS 'Path to STS keystore file for this host';
COMMENT ON COLUMN hosts.gov_api_subject IS 'Subject identifier for JWT tokens (usually same as ICO)';
COMMENT ON COLUMN hosts.gov_private_key_path IS 'Path to private key for signing JWTs';
COMMENT ON COLUMN hosts.gov_credentials_verified IS 'Whether credentials have been tested and verified';
COMMENT ON COLUMN hosts.gov_credentials_verified_at IS 'Timestamp of last successful credential verification';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_hosts_gov_ico ON hosts(gov_ico);
