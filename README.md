# Drako HQ — Live Deployment Guide
## Your personal command center, hosted live with AI-powered market briefings

---

## What you're setting up

1. **GitHub** — stores your app files (free)
2. **Netlify** — hosts your app at a live URL and securely holds your API key (free)
3. **Anthropic API** — powers the live market briefings (~$1–2/month at normal use)

Total time: ~15–20 minutes

---

## STEP 1 — Get your Anthropic API Key

1. Go to **https://console.anthropic.com**
2. Click "Sign Up" → create account with email
3. Verify your email
4. Click your profile (top right) → **"API Keys"**
5. Click **"Create Key"**
6. Give it a name like `drako-hq`
7. **COPY THE KEY** — it starts with `sk-ant-...`
   ⚠️ You only see it once. Paste it somewhere safe (Notes app, etc.)
8. Click **"Billing"** in the left sidebar → Add a credit card
   - You won't be charged until you use it
   - Set a usage limit of $10/month for peace of mind (Settings → Limits)

---

## STEP 2 — Create a GitHub account and upload the files

1. Go to **https://github.com**
2. Click "Sign up" → create a free account
3. Once logged in, click the **"+"** icon (top right) → **"New repository"**
4. Name it: `drako-hq`
5. Set to **Public** (required for free Netlify hosting)
6. Check "Add a README file"
7. Click **"Create repository"**

Now upload your files:
8. Click **"Add file"** → **"Upload files"**
9. Drag and drop these files/folders FROM the zip you downloaded:
   - `index.html`
   - `netlify.toml`
   - The entire `netlify/` folder (drag the whole folder)
10. Scroll down, click **"Commit changes"**

---

## STEP 3 — Deploy on Netlify

1. Go to **https://netlify.com**
2. Click **"Sign up"** → choose **"Sign up with GitHub"** → authorize
3. Once in your dashboard, click **"Add new site"** → **"Import an existing project"**
4. Click **"GitHub"**
5. Find and click your **"drako-hq"** repository
6. Leave all build settings as default (Netlify will auto-detect)
7. Click **"Deploy site"**
8. Wait ~60 seconds — you'll see a random URL like `amazing-goldfish-123.netlify.app`
9. (Optional) Click **"Site settings"** → **"Change site name"** → rename to `drako-hq`

---

## STEP 4 — Add your API key (THE MOST IMPORTANT STEP)

This is what keeps your API key secret and secure:

1. In your Netlify dashboard, go to your site
2. Click **"Site configuration"** (left sidebar)
3. Click **"Environment variables"**
4. Click **"Add a variable"**
5. **Key:** `ANTHROPIC_API_KEY`
6. **Value:** paste your `sk-ant-...` key here
7. Click **"Save**
8. Go back to **"Deploys"** → Click **"Trigger deploy"** → **"Deploy site"**
   (This restart is required to load the new environment variable)

---

## STEP 5 — Open your live app

1. Go back to your Netlify site overview
2. Click your live URL (e.g., `drako-hq.netlify.app`)
3. Your full app loads in the browser
4. Go to **Fed + Markets** tab
5. Click **"Get Briefing"**
6. Wait 10–20 seconds — Claude searches the web and writes your personalised briefing

🎉 **That's it. You're live.**

---

## Using the Live Briefing

- **Full briefing** — covers markets, rates, gold, stocks, your action item
- **Topic buttons** — focused briefings on mortgage rates, gold, stocks, Fed, Iran/oil, dollar, AI, real estate
- **Copy button** — copies the full text so you can paste it into notes or share it
- **Cost** — approximately $0.003–$0.01 per click. At 5 clicks/day = ~$1.50/month

---

## Updating the app in the future

When I (Claude) build you a new version:
1. Download the new `index.html` file
2. Go to your GitHub repository
3. Click on `index.html` → click the pencil icon (Edit) → or drag and drop to replace
4. Click "Commit changes"
5. Netlify automatically redeploys in ~30 seconds
6. **Your calendar events are saved in your browser — they survive updates automatically**

---

## Troubleshooting

**"API key not configured" error:**
→ Go to Netlify → Site configuration → Environment variables → make sure `ANTHROPIC_API_KEY` is set → Trigger redeploy

**"Request failed" error:**
→ Check your Anthropic billing — you may need to add a payment method or your balance is $0

**App loads but briefing button does nothing:**
→ Open browser DevTools (F12) → Console tab → look for error messages → share them with me

**Want a custom domain (like drako-hq.com)?**
→ Buy domain on Namecheap (~$10/yr) → In Netlify: Domain management → Add custom domain → follow DNS instructions

---

## Monthly cost estimate

| Service | Cost |
|---------|------|
| GitHub | Free |
| Netlify hosting | Free |
| Anthropic API (5 clicks/day) | ~$1.50/month |
| **Total** | **~$1.50/month** |

---

Built for Mark "Drako" — LO · Builder · Creator
