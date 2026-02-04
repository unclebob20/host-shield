-- Add Stripe payment fields to hosts table
ALTER TABLE hosts 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50),
ADD COLUMN IF NOT EXISTS subscription_valid_until TIMESTAMP WITH TIME ZONE;

-- Create an index regarding payment queries
CREATE INDEX IF NOT EXISTS idx_hosts_stripe_customer ON hosts(stripe_customer_id);
