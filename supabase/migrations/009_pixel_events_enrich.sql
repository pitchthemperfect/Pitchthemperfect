-- Enrich pixel_events with more context
ALTER TABLE pixel_events ADD COLUMN IF NOT EXISTS registration_id bigint;
ALTER TABLE pixel_events ADD COLUMN IF NOT EXISTS session_id text;
ALTER TABLE pixel_events ADD COLUMN IF NOT EXISTS page_url text;
