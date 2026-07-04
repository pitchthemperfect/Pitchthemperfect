# Domain Setup Guide — pitchthemperfect.com → Vercel

## Current State
- Domain: `pitchthemperfect.com` (GoDaddy)
- Currently showing: GoDaddy site builder
- Target: Point to Vercel deployment
- Vercel project: `pitch-them-perfect`

---

## Step 1 — Check Vercel Domain Settings

1. Buka `https://vercel.com/pitch-them-perfect/pitch-them-perfect/settings/domains`
2. Domain `pitchthemperfect.com` should already be listed
3. If marked as "Invalid" or "Misconfigured" — continue to Step 2

---

## Step 2 — Get Vercel DNS Records

In Vercel Domain Settings, click on `pitchthemperfect.com` → you'll see:

### Option A: Use Vercel Nameservers (Recommended)
Change nameservers at GoDaddy to:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```
- Pro: Auto SSL, auto renew, Vercel handles everything
- Con: DNS migration takes 24-48 hours
- **Use this if GoDaddy is your DNS provider and you want to move it to Vercel**

### Option B: Add A/CNAME Records (Keep GoDaddy DNS)
Add these records at GoDaddy:
```
Type    Name    Value                   TTL
A       @       76.76.21.21            600
CNAME   www     cname.vercel-dns.com   600
```
- Pro: Faster propagation (1-4 hours)
- Con: Manual SSL management
- **Use this if you want to keep DNS at GoDaddy**

---

## Step 3 — Update GoDaddy

1. Login to `https://dcc.godaddy.com`
2. Go to **My Products** → **Domains** → click `pitchthemperfect.com`
3. Click **DNS** → **Manage DNS**

### If using Option A (Nameservers):
- Scroll to **Nameservers** section
- Click **Change** → **Enter my own nameservers**
- Enter: `ns1.vercel-dns.com` and `ns2.vercel-dns.com`
- Save → wait 24-48 hours

### If using Option B (A/CNAME Records):
- Delete any existing A records pointing to GoDaddy IPs
- Add new records:
  - **A Record**: Host `@` → Points to `76.76.21.21` → TTL 600
  - **CNAME Record**: Host `www` → Points to `cname.vercel-dns.com` → TTL 600
- Save → wait 1-4 hours

---

## Step 4 — Verify

1. Back in Vercel Domain Settings, the domain should show as **"Valid"** ✅
2. Vercel will auto-provision SSL (5-10 minutes)
3. Test: open `https://pitchthemperfect.com` in browser
4. If showing Vercel site → done! If still GoDaddy → wait longer (DNS propagation)

---

## Step 5 — After Domain is Live

1. **Brevo**: Verify domain `pitchthemperfect.com` → add TXT record via Vercel DNS
2. **OG Image**: Upload `og-image.jpg` at `https://pitchthemperfect.com/og-image.jpg`
3. **Meta Pixel**: Already working via Vercel URL — auto works on custom domain
