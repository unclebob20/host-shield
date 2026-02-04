-- Add property_id to guest_register to link to properties table
ALTER TABLE guest_register
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_guest_property ON guest_register(property_id);
