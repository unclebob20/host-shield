-- Migration: Add 'type' column to properties table
-- Date: 2026-02-01
-- Purpose: Fix schema mismatch causing "column type does not exist" error

ALTER TABLE properties ADD COLUMN IF NOT EXISTS type VARCHAR(50);
