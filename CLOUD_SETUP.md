# ReadAI Cloud Setup Guide

This guide will help you set up the daily book addition system to run in the cloud on Vercel.

## ✅ What's Included

- **Cloud-based scheduling** - Runs automatically every day at 6:00 AM UTC
- **Even distribution** - Exactly 200 books spread evenly across all categories
- **Comprehensive logging** - Full proof of execution with detailed logs
- **Duplicate prevention** - Won't add books if already added today

## 📊 Book Distribution (200 books total)

- **Fiction:** 50 books (6-7 per subcategory)
  - sci_fi: 7, fantasy: 7, mystery: 6, romance: 6, literary: 6, thriller: 6, horror: 6, historical_fiction: 6
  
- **Non-Fiction:** 80 books (5 per subcategory)
  - 16 subcategories × 5 books each
  
- **Children:** 35 books (7 per subcategory)
  - 5 subcategories × 7 books each
  
- **Educational:** 35 books (7 per subcategory)
  - 5 subcategories × 7 books each

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
cd /Users/ericmasmela/digital-hermit/projects/readai-book-system
npm install
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel
```

Follow the prompts to link your project.

### 3. Set Environment Variables

In your Vercel dashboard, go to your project → Settings → Environment Variables:

- **`DATABASE_URL`** - Your Neon database connection string
  - Format: `postgresql://user:password@host/database?sslmode=require`
  
- **`CRON_SECRET`** (optional but recommended) - A secret token for security
  - Generate one: `openssl rand -hex 32`

### 4. Enable Vercel Cron

The `vercel.json` file is already configured. Vercel will automatically:
- Detect the cron job
- Run it daily at 6:00 AM UTC
- Send you notifications if it fails

### 5. Verify Setup

Check the Vercel dashboard:
1. Go to your project → Settings → Cron Jobs
2. You should see "daily-books" scheduled for `0 6 * * *`
3. Check the Functions tab to see execution logs

## 📋 Database Schema

Make sure your Neon database has these tables:

```sql
-- Books table
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  year INTEGER,
  rating DECIMAL(3,1),
  description TEXT,
  tags TEXT[],
  pages INTEGER,
  difficulty VARCHAR(50),
  recommended_for VARCHAR(50),
  category VARCHAR(100),
  subcategory VARCHAR(100),
  added_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily logs table (for proof)
CREATE TABLE IF NOT EXISTS daily_logs (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  books_added INTEGER NOT NULL,
  total_books INTEGER NOT NULL,
  execution_time TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔍 Proof & Monitoring

### View Daily Logs

Query your Neon database:

```sql
SELECT * FROM daily_logs 
ORDER BY date DESC 
LIMIT 30;
```

### Check Books Added Today

```sql
SELECT COUNT(*) as books_added_today, category, subcategory
FROM books 
WHERE added_date = CURRENT_DATE
GROUP BY category, subcategory
ORDER BY category, subcategory;
```

### View Execution History

The API returns comprehensive proof including:
- Date and time of execution
- Number of books added
- Total books in database
- Category breakdown
- Sample books added
- Full execution log

## 🧪 Manual Testing

Test the endpoint manually:

```bash
curl -X GET "https://your-domain.vercel.app/api/daily-books" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or test locally:

```bash
# Set environment variables
export DATABASE_URL="your-neon-connection-string"
export CRON_SECRET="your-secret"

# Run Next.js dev server
npm run dev

# Test endpoint
curl http://localhost:3000/api/daily-books \
  -H "Authorization: Bearer your-secret"
```

## 📊 Expected Results

After each run, you should see:
- ✅ 200 books added to the database
- ✅ Entry in `daily_logs` table
- ✅ Even distribution across all categories
- ✅ Total book count increased by 200

## 🛡️ Security

- The endpoint requires an `Authorization: Bearer` header with your `CRON_SECRET`
- Vercel Cron automatically includes this header
- Manual calls must include the secret

## 🔔 Notifications

Vercel will send you email notifications if:
- The cron job fails
- The function times out
- There are errors

## 📈 Monitoring Dashboard

You can create a simple dashboard to view:
- Daily book additions over time
- Category distribution
- Total books in database
- Success/failure rates

Query example:

```sql
SELECT 
  date,
  books_added,
  total_books,
  status,
  execution_time
FROM daily_logs
ORDER BY date DESC;
```

## ✅ Success Checklist

- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] Cron job visible in Vercel dashboard
- [ ] Database tables created
- [ ] Tested manually
- [ ] Received first daily execution
- [ ] Verified books in database
- [ ] Checked daily_logs table

## 🆘 Troubleshooting

**Cron not running?**
- Check Vercel dashboard → Cron Jobs
- Verify `vercel.json` is in root directory
- Check function logs for errors

**Books not adding?**
- Check DATABASE_URL is correct
- Verify database tables exist
- Check function logs in Vercel

**Getting 401 Unauthorized?**
- Verify CRON_SECRET matches
- Check Authorization header format

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Query `daily_logs` table for error messages
3. Verify database connection
4. Test endpoint manually

---

**🎉 Once set up, your database will automatically receive 200 books every day at 6:00 AM UTC, with full proof and logging!**

