-- 1. Enable UUID extension for secure, non-sequential identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Landlords / Accommodation Providers
-- Stores credentials and the mandatory Police Provider ID
CREATE TABLE hosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    -- ID assigned by the Foreign Police for reporting
    police_provider_id VARCHAR(50), 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. The Electronic Guest Register (Kniha ubytovaných)
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
    
    -- Stay Information
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    purpose_of_stay VARCHAR(100) DEFAULT 'turistika',
    
    -- Compliance & Reporting Status
    -- Maps to Slovensko.digital API submission tracking
    gov_submission_id VARCHAR(100), 
    submission_status VARCHAR(20) DEFAULT 'pending', -- pending, sent, error, confirmed
    submitted_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Audit & Compliance Log
-- Proves the landlord met the 3-day reporting deadline
CREATE TABLE compliance_audit_log (
    id SERIAL PRIMARY KEY,
    guest_id UUID REFERENCES guest_register(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- e.g., 'OCR_EXTRACT', 'GOV_SUBMIT', 'LEDGER_EXPORT'
    action_details JSONB,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for performance on your Hetzner CX23 node
CREATE INDEX idx_guest_host ON guest_register(host_id);
CREATE INDEX idx_guest_doc ON guest_register(document_number);
CREATE INDEX idx_submission_status ON guest_register(submission_status);