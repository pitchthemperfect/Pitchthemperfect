-- Migration: Live story cards for event-day QR submission
CREATE TABLE IF NOT EXISTS story_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  table_number text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);
