# Pitch Them Perfect — Status Tracker

> Last updated: July 3, 2026  
> Live: `https://pitch-them-perfect.vercel.app` | `https://www.pitchthemperfect.com`  
> Repo: `pitchthemperfect/Pitchthemperfect`

---

## ✅ Done

### Website
- [x] Landing page at `/` — premium event design
- [x] Registration form at `/registration` — Step 1 (name, phone, email, role)
- [x] Pitcher flow — `/register/pitcher` (their name, IG, gender, relationship, pitch, consent)
- [x] Watcher flow — `/register/watcher` (gender, age, consent)
- [x] Payment pages — price from Supabase, Ziina link (opens new tab)
- [x] Success pages — Pitcher, Watcher, Waitlist
- [x] Custom domain: `pitchthemperfect.com`

### Admin Dashboard (`/admin`)
- [x] Supabase Auth login
- [x] Registration table — search, role filter, status filter
- [x] Stats grid — Total, Pitcher M/F, Watcher, Paid, Pending, Waitlist
- [x] Export CSV
- [x] Settings modal:
  - Ticket prices (watcher, pitcher)
  - Ziina payment URLs
  - Event date & location
  - Gallery photos — upload to Supabase Storage bucket `photos`
  - Capacity limits (pitcher male, pitcher female, watcher) with live counts

### Capacity System
- [x] `events` table — configurable caps per category
- [x] Live counting via `useCapacity` hook
- [x] When full → waitlist flow (no payment, collects name/email/phone/role)
- [x] Waitlist status visible in admin

### Tracking
- [x] GTM programmatic loader — `VITE_GTM_ID` env var
- [x] Events: `lead`, `complete_registration`, `purchase`
- [x] Gracefully disabled if `VITE_GTM_ID` not set

### Deploy
- [x] `deploy.sh` — one-command Vercel deploy (build locally + prebuilt upload)
- [x] `vercel.json` — SPA rewrite rules

---

## 🔴 Pending (not blocked)

### Priority
- [ ] **Add `VITE_GTM_ID` to Vercel env vars** — get GTM container ID, set in Vercel → redeploy
- [ ] **Setup Meta Pixel + GA4 inside GTM** — fire on custom events
- [ ] **Build Meta retargeting audience** — include `lead`, exclude `complete_registration`

### Nice-to-have
- [ ] **Custom domain SSL** — Vercel says "attempting to create SSL certificates asynchronously" — check back
- [ ] **Brevo Edge Function: send confirmation email** — can build the function now, just needs API key
- [ ] **Brevo Edge Function: pre-event reminder (H-2)** — via `pg_cron`
- [ ] **Brevo Edge Function: post-event follow-up** — via `pg_cron`
- [ ] **Pitcher approval flow** — admin approve/decline, send email
- [ ] **Event-day check-in** — `attended` checkbox in admin table
- [ ] **SEO meta + OG tags** — for WhatsApp/IG link previews
- [ ] **Code split** — bundle > 500KB, split with dynamic imports

---

## 🔴 Blocked (waiting for Ziina)

- [ ] **Ziina API** — create payment link dynamically
- [ ] **Ziina Webhook** — verify payment, update status
- [ ] **Edge Function: `handle-ziina-webhook`** — receive webhook → update DB → send Brevo email
- [ ] **Edge Function: `create-payment`** — generate unique Ziina payment link
- [ ] **Embed Ziina in form** — replace `target="_blank"` with embedded payment
- [ ] **Change watcher status flow** — `pending` → webhook → `paid`

---

## 🔴 Blocked (waiting for client)

- [ ] **Gallery photos** — client to provide 4 event photos

---

## 🗄️ Database

### Tables
```
events         — id, show_date, cap_pitcher_male, cap_pitcher_female, cap_watcher, is_active
registrations  — id, name, whatsapp, email, role, pitchee_gender, relationship, 
                 instagram, their_name, can_attend, pitch, links, gender, age_group,
                 status, amount, created_at
settings       — key, value (prices, URLs, date, location, gallery URLs)
```

### Supabase Storage
```
bucket: photos (public)
  RLS: public read, authenticated upload
```

### SQL to run on Supabase
```sql
-- events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_date date NOT NULL DEFAULT now(),
  cap_pitcher_male int NOT NULL DEFAULT 5,
  cap_pitcher_female int NOT NULL DEFAULT 5,
  cap_watcher int NOT NULL DEFAULT 60,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- pitchee_gender column
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS pitchee_gender text DEFAULT '';

-- Storage RLS
CREATE POLICY "Public read photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Auth upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');
```

---

## 🚀 Deploy

```bash
./deploy.sh
```

Or manually:
```bash
npx vercel build --prod --yes
npx vercel deploy --prebuilt --prod --yes
```

### Vercel Env Vars
| Key | Value | Status |
|-----|-------|--------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ Set |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | ✅ Set |
| `VITE_GTM_ID` | GTM-XXXXXXX | ❌ Not set yet |
