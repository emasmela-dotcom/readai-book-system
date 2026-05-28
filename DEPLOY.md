# 🚀 Quick Deploy Guide

## Deploy to Vercel (2 minutes)

```bash
cd /Users/ericmasmela/digital-hermit/projects/readai-book-system

# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel
```

Follow the prompts:
- Link to existing project or create new
- Confirm settings
- Deploy!

## Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

1. **DATABASE_URL**
   - Your Neon database connection string
   - Format: `postgresql://user:password@host/database?sslmode=require`

2. **CRON_SECRET** (optional but recommended)
   - Generate: `openssl rand -hex 32`
   - Used for security on the cron endpoint

## Verify Cron Job

1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. You should see "daily-books" scheduled for `0 6 * * *` (6 AM UTC daily)

## Test It Works

After deployment, test manually:
```bash
curl -X GET "https://your-project.vercel.app/api/daily-books.js" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or check Vercel Functions tab to see execution logs.

## ✅ Once Deployed

- ✅ Runs automatically every day at 6 AM UTC
- ✅ Adds 200 books per day
- ✅ 1,400 books per week
- ✅ No manual intervention needed
- ✅ All logged to `daily_logs` table

