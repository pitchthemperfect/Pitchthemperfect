-- Migration: Add attended column for event-day check-in
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS attended boolean DEFAULT false;

-- pg_cron: Check every day at 9am for events happening in 2 days → send reminders
-- (Requires pg_cron extension + Edge Function)
SELECT cron.schedule(
  'send-pre-event-reminders',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := CONCAT(current_setting('app.settings.supabase_function_url'), '/send-reminders'),
    body := '{}'::jsonb
  );
  $$
);

-- pg_cron: Check every day at 9am for events that happened yesterday → send follow-up
SELECT cron.schedule(
  'send-post-event-followups',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := CONCAT(current_setting('app.settings.supabase_function_url'), '/send-followups'),
    body := '{}'::jsonb
  );
  $$
);
