-- Add encryption metadata for credential files
-- This allows us to encrypt files at rest while maintaining ability to decrypt

ALTER TABLE hosts ADD COLUMN IF NOT EXISTS gov_keystore_iv VARCHAR(32);
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS gov_keystore_auth_tag VARCHAR(32);
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS gov_private_key_iv VARCHAR(32);
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS gov_private_key_auth_tag VARCHAR(32);

-- Add comments
COMMENT ON COLUMN hosts.gov_keystore_iv IS 'Initialization vector for encrypted keystore file';
COMMENT ON COLUMN hosts.gov_keystore_auth_tag IS 'Authentication tag for encrypted keystore file';
COMMENT ON COLUMN hosts.gov_private_key_iv IS 'Initialization vector for encrypted private key file';
COMMENT ON COLUMN hosts.gov_private_key_auth_tag IS 'Authentication tag for encrypted private key file';
