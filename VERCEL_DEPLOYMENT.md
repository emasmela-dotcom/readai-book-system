# 🚀 Vercel Cloud Deployment Guide - ReadAI Neon

**Complete setup to ensure your daily book additions run reliably in the cloud**

---

## ✅ Pre-Deployment Checklist

- [x] Neon database set up and connected
- [x] 508 books migrated to Neon
- [x] Database tables created (`books`, `daily_logs`)
- [x] Local connection tested

---

## 🚀 Step 1: Deploy to Vercel

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

---

## 🔐 Step 2: Set Environment Variables (CRITICAL!)

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Variables:

1. **`DATABASE_URL`** ⚠️ **MUST SET THIS**
   ```
   postgresql://neondb_owner:npg_VlAkJ4ij9nRI@ep-crimson-dew-a4x50rh1-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
   - **Select ALL environments:** Production, Preview, Development
   - Required for Neon database access in production

2. **`CRON_SECRET`** (Recommended for security)
   ```bash
   # Generate a secret:
   openssl rand -hex 32
   ```
   - Copy the generated string
   - Add as `CRON_SECRET` in Vercel
   - Select ALL environments

---

## ⏰ Step 3: Verify Cron Job

1. Go to **Vercel Dashboard → Your Project → Settings → Cron Jobs**
2. You should see:
   - **Path:** `/api/daily-books.js`
   - **Schedule:** `0 6 * * *` (6:00 AM UTC daily)
   - **Status:** Active

If you don't see it:
- Make sure `vercel.json` is in your project root
- Redeploy: `vercel --prod`

---

## 🧪 Step 4: Test the Deployment

### Option A: Manual Test (Recommended)
```bash
# Get your CRON_SECRET from Vercel environment variables
curl -X GET "https://your-project.vercel.app/api/daily-books.js" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Option B: Check Vercel Functions Logs
1. Go to **Vercel Dashboard → Your Project → Functions**
2. Look for `/api/daily-books.js`
3. Check execution logs

### Option C: Check Neon Database
```bash
# Run locally to check count
node check-count.js
```

---

## 📊 Step 5: Monitor Daily Executions

### Check Daily Logs in Neon:
```sql
SELECT * FROM daily_logs 
ORDER BY date DESC 
LIMIT 10;
```

### Check via API:
```bash
curl https://your-project.vercel.app/api/book-count
```

### Check Locally:
```bash
node check-count.js
```

---

## 🛡️ Prevention Measures

### 1. **Database URL Verification**
   - ✅ Set in Vercel (not just locally)
   - ✅ Neon `DATABASE_URL` in all environments
   - ✅ Available in all environments

### 2. **Cron Job Monitoring**
   - Check Vercel Functions tab daily
   - Set up Vercel notifications for failed cron jobs
   - Monitor `daily_logs` table for gaps

### 3. **Health Check Endpoint**
   Use the `/api/book-count` endpoint to verify:
   - Books are being added
   - Database is accessible
   - Count is increasing

### 4. **Alert Setup** (Optional)
   - Vercel will email you if cron jobs fail
   - Check your email settings in Vercel dashboard

---

## 🔍 Troubleshooting

### Cron Job Not Running?
1. Check `vercel.json` exists and is correct
2. Verify cron job appears in Vercel dashboard
3. Check environment variables are set
4. Look at Vercel Functions logs for errors

### Books Not Being Added?
1. Check `DATABASE_URL` is set in Vercel
2. Verify `DATABASE_URL` is your Neon connection string
3. Check Vercel Functions logs for connection errors
4. Test database connection locally: `node check-count.js`

### Connection Errors?
1. Verify Neon database is active (not paused)
2. Check connection string is correct
3. Ensure `DATABASE_URL` is in Vercel environment variables
4. Test connection locally first

---

## 📈 Expected Results

After deployment:
- ✅ **200 books added daily** at 6:00 AM UTC
- ✅ **1,400 books per week**
- ✅ **6,000+ books per month**
- ✅ **Database stays active** (Neon won't pause)
- ✅ **All logged** in `daily_logs` table

---

## 🎯 Quick Verification Commands

```bash
# Check current book count
node check-count.js

# Test database connection
python3 -c "from readai_neon_connector import ReadAINeonConnector; ReadAINeonConnector().test_connection()"

# Check recent daily logs
python3 -c "import psycopg2; import os; from dotenv import load_dotenv; load_dotenv(); conn = psycopg2.connect(os.getenv('DATABASE_URL')); cur = conn.cursor(); cur.execute('SELECT date, books_added, total_books FROM daily_logs ORDER BY date DESC LIMIT 5'); [print(f'{r[0]}: +{r[1]} books (Total: {r[2]})') for r in cur.fetchall()]; conn.close()"
```

---

## ✅ Success Checklist

- [ ] Deployed to Vercel
- [ ] `DATABASE_URL` set in Vercel (all environments)
- [ ] `CRON_SECRET` set in Vercel (all environments)
- [ ] Cron job visible in Vercel dashboard
- [ ] Manual test successful
- [ ] Books count increasing daily
- [ ] Daily logs showing entries

---

## 🎉 You're All Set!

Your ReadAI system is now:
- 🚀 **Deployed in the cloud** (Vercel)
- 🛡️ **Using Neon** PostgreSQL
- ⏰ **Automated daily** (200 books/day)
- 📊 **Fully monitored** (logs and health checks)

**No more lost books!** 🎊

