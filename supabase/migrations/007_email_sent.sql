ALTER TABLE registrations ADD COLUMN IF NOT EXISTS email_sent boolean DEFAULT false;
