-- Track pixel events in our own DB for admin reporting
CREATE TABLE IF NOT EXISTS pixel_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_name text NOT NULL,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Allow anon inserts (from frontend)
ALTER TABLE pixel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert" ON pixel_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon select" ON pixel_events FOR SELECT TO anon USING (true);
