# Setup Ziina Webhook — Step by Step (Super Simple)

## What is this for?
When someone pays on Pitch Them Perfect, Ziina will automatically tell our system "payment received!" — so the status updates automatically, no manual checking needed.

## What you need to do (5 minutes)

### Step 1: Login
1. Open the **Ziina app** on your phone, OR go to `ziina.com` and click **Login**
2. Login with your business account

### Step 2: Find Webhook Settings
Look for one of these (different accounts show it differently):
- **Settings → Developers**
- **Settings → API**
- **Developers → Webhooks**
- **Integrations → Webhooks**

If you can't find it, use the search bar inside Ziina and type "webhook"

### Step 3: Add New Webhook
Click **"Add Webhook"** or **"Create Webhook"** button

### Step 4: Fill in the details
Copy and paste these exactly:

| Field | What to type |
|-------|-------------|
| **URL** | `https://tnohztvpuflwkltkbphg.supabase.co/functions/v1/handle-ziina-webhook` |
| **Secret** | `ptp-ziina-webhook-2026` |

> ⚠️ Copy the URL exactly — no spaces, no typos.

### Step 5: Save
Click **Save** or **Create**

### Done! 🎉
That's it. Now when someone pays, the system updates automatically.

---

## Need help?
If you can't find the Webhook settings, send Angelo a screenshot of your Ziina dashboard and I'll point you to it.

## The technical stuff (Angelo only)
- URL: Supabase Edge Function `handle-ziina-webhook`
- Events sent: `payment_intent.succeeded`
- Status update: `pending` → `paid` (watcher) or `pitch` (pitcher)
