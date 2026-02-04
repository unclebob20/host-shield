-- 1. Enable UUID extension for secure, non-sequential identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Landlords / Accommodation Providers
-- Stores credentials, subscription info, and the mandatory Police Provider ID
CREATE TABLE hosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    
    -- ID assigned by the Foreign Police for reporting
    police_provider_id VARCHAR(50),
    
    -- Payment & Subscription (Stripe)
    stripe_customer_id VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'inactive',
    subscription_plan VARCHAR(50),
    subscription_valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Government Credentials (Slovensko.digital / Police API)
    gov_ico VARCHAR(50),
    gov_api_subject VARCHAR(255),
    gov_credentials_verified BOOLEAN DEFAULT FALSE,
    gov_credentials_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Encrypted Credential File Metadata
    gov_keystore_path TEXT,
    gov_keystore_iv TEXT,
    gov_keystore_auth_tag TEXT,
    gov_private_key_path TEXT,
    gov_private_key_iv TEXT,
    gov_private_key_auth_tag TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for Hosts
CREATE INDEX idx_hosts_stripe_customer ON hosts(stripe_customer_id);
CREATE INDEX idx_hosts_gov_verified ON hosts(gov_credentials_verified);

-- 3. Properties / Accommodation Units
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID REFERENCES hosts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_properties_host ON properties(host_id);

-- 4. The Electronic Guest Register (Kniha ubytovaných)
-- Mandatory data extraction fields for Slovak compliance
CREATE TABLE guest_register (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID REFERENCES hosts(id) ON DELETE CASCADE,
    
    -- Personal Data (Extracted via OCR)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    nationality_iso3 CHAR(3) NOT NULL, -- e.g., 'SVK', 'DEU', 'USA'
    
    -- Travel Document Details
    document_type VARCHAR(50) NOT NULL, -- Passport, ID Card, Residence Permit
    document_number VARCHAR(50) NOT NULL,
    document_expiry_date DATE,
    
    -- Stay Information
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    purpose_of_stay VARCHAR(100) DEFAULT 'turistika',
    object_id INTEGER, -- Legacy integer ID if needed, or link to properties table in future
    
    -- Compliance & Reporting Status
    -- Maps to Slovensko.digital API submission tracking
    gov_submission_id VARCHAR(100), 
    submission_status VARCHAR(20) DEFAULT 'pending', -- pending, sent, error, confirmed
    submitted_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for Guest Register
CREATE INDEX idx_guest_host ON guest_register(host_id);
CREATE INDEX idx_guest_doc ON guest_register(document_number);
CREATE INDEX idx_submission_status ON guest_register(submission_status);

-- 5. Audit & Compliance Log
-- Proves the landlord met the 3-day reporting deadline
CREATE TABLE compliance_audit_log (
    id SERIAL PRIMARY KEY,
    guest_id UUID REFERENCES guest_register(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- e.g., 'OCR_EXTRACT', 'GOV_SUBMIT', 'LEDGER_EXPORT'
    action_details JSONB,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Seed Data (Development/Testing)
-- Default User: testhost@example.com / Test1234
INSERT INTO hosts (email, hashed_password, full_name, police_provider_id)
VALUES ('testhost@example.com', '$2b$10$UmyjAmx2t2P9liSiJ8pHqu01JYA9K77FRcbAuBp2XHsDOsWIyeJMW', 'Test Host', 'TEST_PROVIDER_123')
ON CONFLICT (email) DO NOTHING;