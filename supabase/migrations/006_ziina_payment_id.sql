-- Migration: Add ziina_payment_id for tracking payments
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS ziina_payment_id text;
