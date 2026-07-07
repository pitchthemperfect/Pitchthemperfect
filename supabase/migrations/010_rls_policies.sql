-- Migration 010: Add RLS policies for authenticated admin access
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Ensure RLS is enabled on all tables
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 2. REGISTRATIONS table policies
-- Allow anon to INSERT (registration form submissions)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'anon_insert_registrations') THEN
    CREATE POLICY "anon_insert_registrations" ON registrations FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

-- Allow anon to SELECT (needed for duplicate checks if any)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'anon_select_registrations') THEN
    CREATE POLICY "anon_select_registrations" ON registrations FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- Allow authenticated admin to do EVERYTHING
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'admin_all_registrations') THEN
    CREATE POLICY "admin_all_registrations" ON registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 3. EVENTS table policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'anon_select_events') THEN
    CREATE POLICY "anon_select_events" ON events FOR SELECT TO anon USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'admin_all_events') THEN
    CREATE POLICY "admin_all_events" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 4. SETTINGS table policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'anon_select_settings') THEN
    CREATE POLICY "anon_select_settings" ON settings FOR SELECT TO anon USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'admin_all_settings') THEN
    CREATE POLICY "admin_all_settings" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
