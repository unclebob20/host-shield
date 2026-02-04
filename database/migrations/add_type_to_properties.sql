-- Add type column to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS type VARCHAR(50);
