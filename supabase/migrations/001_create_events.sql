-- Migration: Create events table with configurable capacity
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_date date NOT NULL DEFAULT now(),
  cap_pitcher_male int NOT NULL DEFAULT 5,
  cap_pitcher_female int NOT NULL DEFAULT 5,
  cap_watcher int NOT NULL DEFAULT 60,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seed the first active event
INSERT INTO events (show_date, cap_pitcher_male, cap_pitcher_female, cap_watcher, is_active)
VALUES (now(), 5, 5, 60, true);
