-- Migration: Add event_id for multi-event lifecycle support
-- Allows archiving old events and starting fresh ones

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id);
ALTER TABLE story_cards ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id);

-- Backfill: assign existing registrations to the active event (if any)
DO $$
DECLARE
  active_event_id uuid;
BEGIN
  SELECT id INTO active_event_id FROM events WHERE is_active = true ORDER BY created_at DESC LIMIT 1;
  IF active_event_id IS NOT NULL THEN
    UPDATE registrations SET event_id = active_event_id WHERE event_id IS NULL;
    UPDATE story_cards SET event_id = active_event_id WHERE event_id IS NULL;
  END IF;
END $$;
