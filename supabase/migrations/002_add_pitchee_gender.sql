-- Migration: Add pitchee_gender column for capacity tracking
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS pitchee_gender text DEFAULT '';
