# PatchPulse – Oracle Cloud Patch Monitor

*Never miss an OIC or Fusion update again.*  
PatchPulse automatically scrapes Oracle’s official “What’s New” pages and sends you beautiful email alerts with three actionable links: a detailed summary on PatchPulse, the official release news, and the documentation.

Built for OIC Gen 3 developers and Fusion consultants who need to stay ahead of patches, minor updates, and security advisories.

![PatchPulse Dashboard Preview](https://via.placeholder.com/800x400?text=PatchPulse+Dashboard+Preview)  
(Replace with actual screenshot after deployment)

---

## ✨ Features

- *Email + password authentication* – secure, session-based.
- *User preferences* – choose OIC, Fusion, or both; filter by update type (major/minor/bug/security).
- *Automated scraping* – runs every 6 hours via Vercel Cron Jobs.
- *Instant email alerts* – rich HTML emails with three buttons:
  - 📄 Summary on PatchPulse
  - 📢 Official Release News
  - 📚 Documentation
- *Responsive dashboard* – view recent updates as cards, see full synopsis on detail page.
- *Admin panel* – manually trigger a scrape and view logs.
- *Zero local installation* – develop and deploy entirely in your browser using GitHub.dev.

---

## 🛠️ Tech Stack

| Category       | Technology                                                                 |
|----------------|----------------------------------------------------------------------------|
| Framework      | Next.js 14 (App Router) + TypeScript                                      |
| Styling        | Tailwind CSS                                                              |
| Authentication | NextAuth.js (Auth.js) with Credentials provider + bcrypt                  |
| Database       | Vercel Postgres (cloud)                                                   |
| Email          | Resend (free 3,000 emails/month)                                          |
| Scheduling     | Vercel Cron Jobs                                                          |
| Scraping       | Cheerio + Axios                                                           |
| Hosting        | Vercel (free tier)                                                        |
| Development    | GitHub.dev (browser-based VS Code) – no local installs required           |

---

## 🚀 Deployment Guide (Browser‑only)

You can deploy this project *without installing Node.js, Git, or any database* on your laptop. Everything is done in a browser.

### Prerequisites (free accounts)

- [GitHub](https://github.com)
- [Vercel](https://vercel.com) (sign in with GitHub)
- [Resend](https://resend.com) (verify your email as sender)

### Step 1: Create the repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Repository name: patchpulse
3. Choose *Private* (recommended)
4. Click *Create repository*

### Step 2: Open GitHub.dev and add files

1. On your new repo page, press the . (dot) key on your keyboard.  
   This opens *GitHub.dev* – VS Code in your browser.
2. In the file explorer (left panel), create all the files provided by the AI (or copy from the code generation prompt).
3. After adding all files, go to the *Source Control* panel (branch icon), type a commit message like Initial commit, and click *Commit & Push*.

### Step 3: Set up Vercel Postgres

1. In your Vercel dashboard, go to *Storage* → *Create Database* → *Postgres*.
2. Choose a name (e.g., patchpulse-db) and link it to your GitHub repository.
3. Once created, go to the database dashboard and click *Data Explorer*.
4. Run the SQL schema (provided in the code files) to create users and updates tables.

### Step 4: Deploy to Vercel

1. In Vercel, click *Add New* → *Project*.
2. Import your patchpulse GitHub repository.
3. Vercel will auto‑detect Next.js – keep all default settings.
4. Click *Deploy*.

### Step 5: Add environment variables

After the first deployment (it may fail – that’s normal), go to your project *Settings* → *Environment Variables* and add:

| Variable            | Value                                                                 |
|---------------------|-----------------------------------------------------------------------|
| POSTGRES_URL      | Copy from Vercel Postgres dashboard (under .env.local)                  |
| RESEND_API_KEY    | From Resend dashboard                                                   |
| NEXTAUTH_SECRET   | Generate a random string (e.g., openssl rand -base64 32)           -    |
| NEXTAUTH_URL      | https://patchpulse.vercel.app (your deployed URL)                       |
| CRON_SECRET       | Another random string (used to secure /api/cron)                        |
| ADMIN_EMAIL       | Your email address (to access the admin panel)                          |

Then redeploy: go to *Deployments* → three dots → *Redeploy*.

### Step 6: Test your site

- Visit https://patchpulse.vercel.app/register
- Create an account.
- You should receive a welcome email with the latest patch (or a demo).
- Log in and explore the dashboard.

### Step 7: Verify the cron job

The cron job runs automatically every 6 hours. To test it manually:

1. Open your browser and visit:  
   https://patchpulse.vercel.app/api/cron?secret=YOUR_CRON_SECRET  
   (replace YOUR_CRON_SECRET with the value you set).
2. You should see {"success":true}.
3. Check Vercel *Logs* (under your project) for any errors.

---

## 📁 Environment Variables Summary

Create a .env.local file *only if you ever run locally* (not required for deployment). For Vercel, set them in the dashboard:

env
POSTGRES_URL=postgres://...
RESEND_API_KEY=re_...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://patchpulse.vercel.app
CRON_SECRET=...
ADMIN_EMAIL=you@example.com
