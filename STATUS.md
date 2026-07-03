# Pitch Them Perfect — Status Tracker

> **Last updated:** July 4, 2026  
> **Live:** `https://www.pitchthemperfect.com` | `https://pitch-them-perfect.vercel.app`  
> **Repo:** `pitchthemperfect/Pitchthemperfect`

---

## ✅ Done

### Website
- [x] Landing page at `/` — hero, how it works, gallery, stats, FAQ, footer
- [x] Registration form at `/registration` — Step 1 (name, phone, email, role)
- [x] Pitcher flow — `/register/pitcher` (their name, IG, **gender**, relationship, pitch, consent)
- [x] Watcher flow — `/register/watcher` (gender, age, consent)
- [x] Payment pages — price from Supabase, Ziina link (opens new tab — to be embedded)
- [x] Success pages — Pitcher, Watcher, Waitlist
- [x] SEO: OG tags, Twitter card, meta description, theme-color
- [x] Custom domain: `pitchthemperfect.com`

### Admin Dashboard (`/admin` — Supabase Auth)
- [x] Registration table — search, role filter, status filter (paid/pitch/pending/waitlist)
- [x] **Actions:** Approve / Decline / Promote / Delete per row
- [x] **Attended checkbox** — event-day check-in, optimistic update
- [x] **Refresh button** — reload data tanpa logout
- [x] **Stats grid** — Total, Pitcher M/F, Watcher, Paid, Pending, Waitlist, Remaining capacity
- [x] **Export CSV**
- [x] **Settings modal:**
  - Ticket prices (watcher, pitcher)
  - Ziina payment URLs
  - Event date & location
  - Gallery photos — upload to Supabase Storage bucket `photos`
  - Capacity limits (pitcher male/female, watcher) with live used/left counts

### Capacity System
- [x] `events` table — configurable caps per category (admin settings)
- [x] Live counting via `useCapacity` hook — split by pitchee gender
- [x] Sold-out → waitlist flow (collects name/email/phone/role, no payment)
- [x] Admin can promote waitlist → active

### Tracking (GTM)
- [x] GTM loader via `VITE_GTM_ID` env var — gracefully disabled if not set
- [x] Events firing: `lead` (CTA + form submit), `complete_registration` (payment click), `purchase` (success page)
- [x] Tracking utility: `src/lib/tracking.js`

### Backend
- [x] `supabase/functions/send-confirmation` — welcome email via Brevo
- [x] `supabase/functions/send-reminders` — pre-event H-2 email
- [x] `supabase/functions/send-followups` — post-event feedback survey
- [x] `supabase/migrations/` — 001 (events), 002 (pitchee_gender), 003 (attended + pg_cron)

### Deploy
- [x] `deploy.sh` — one-command: `./deploy.sh`
- [x] `vercel.json` — SPA rewrite rules

---

## 🔴 BLOCKED — Nunggu Keys/API

### Ziina (nunggu client)
- [ ] Ziina API key — buat create dynamic payment links
- [ ] Ziina webhook URL + secret — buat verify payment
- [ ] Edge Function: `handle-ziina-webhook` — terima webhook → update status → panggil `send-confirmation`
- [ ] Edge Function: `create-payment` — generate unique Ziina payment link per registration
- [ ] Embed Ziina di form — ganti `target="_blank"` dengan embedded payment
- [ ] Change watcher status flow — `pending` → webhook → `paid`

### Brevo (nunggu API key)
- [ ] `BREVO_API_KEY` — set di Supabase Edge Function env
- [ ] `BREVO_LIST_ID` — optional, buat contact list
- [ ] Deploy Edge Functions: `supabase functions deploy send-confirmation send-reminders send-followups`

### GTM / Meta Pixel (nunggu container ID)
- [ ] Bikin GTM container di `tagmanager.google.com` → dapet `GTM-XXXXXXX`
- [ ] Set `VITE_GTM_ID` di Vercel env vars → redeploy
- [ ] Tambah Meta Pixel tag di dalam GTM (Pixel ID dari Meta Business Suite)
- [ ] Tambah GA4 tag di dalam GTM
- [ ] Build retargeting audience: `Lead` fired but `CompleteRegistration` NOT fired

### Gallery Photos (nunggu client)
- [ ] 4 foto event — upload via Admin Settings

---

## 🟡 Minor / Nice-to-have

- [ ] Custom domain SSL — Vercel: "attempting asynchronously" (cek periodically)
- [ ] QR code / Live story cards form (`/live`) — 30 menit kerjaan
- [ ] Code splitting — bundle 507KB, split with dynamic imports
- [ ] Server-side capacity double-check Edge Function
- [ ] `pg_cron` + `pg_net` extensions enabled di Supabase (untuk scheduled reminders)
- [ ] OG image (`og-image.jpg`) — upload ke public/

---

## 🗄️ Database — SQL to run (ALREADY DONE ✅)

```sql
-- Events table
CREATE TABLE IF NOT EXISTS events (...);
INSERT INTO events ...;

-- Columns
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS pitchee_gender text DEFAULT '';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS attended boolean DEFAULT false;
```

**Tidak ada lagi SQL yang perlu dijalankan.**

---

## 🚀 Quick Actions Pas Keys Udah Ada

```bash
# 1. Set keys di Vercel
npx vercel env add VITE_GTM_ID production     # GTM-XXXXXXX

# 2. Set keys di Supabase (Dashboard → Edge Functions → Settings)
# BREVO_API_KEY=xxx
# FEEDBACK_FORM_URL=https://...

# 3. Deploy Edge Functions
cd supabase
supabase functions deploy send-confirmation
supabase functions deploy send-reminders  
supabase functions deploy send-followups

# 4. Redeploy frontend
./deploy.sh

# 5. Enable Supabase extensions
# Dashboard → Extensions → enable pg_cron + pg_net
```

---

## ⏳ Yang Perlu Dibuat Pas Ziina API Ready

```
supabase/functions/handle-ziina-webhook/index.ts
supabase/functions/create-payment/index.ts
```

Sisanya **zero frontend changes** — cuma deploy Edge Functions.
