# Daily Books API - Cloud Scheduler

This API endpoint automatically adds 200 books to the ReadAI Neon database every day at 6:00 AM UTC.

## Setup

1. **Deploy to Vercel:**
   ```bash
   vercel deploy
   ```

2. **Set Environment Variables in Vercel:**
   - `DATABASE_URL` - Your Neon database connection string
   - `CRON_SECRET` - A secret token for cron job security (optional but recommended)

3. **Vercel Cron Configuration:**
   The `vercel.json` file is already configured to run this endpoint daily at 6:00 AM UTC.

## How It Works

- **Even Distribution:** 200 books are evenly distributed across all categories:
  - Fiction: 104 books (13 per subcategory × 8 subcategories)
  - Non-Fiction: 128 books (8 per subcategory × 16 subcategories)  
  - Children: 50 books (10 per subcategory × 5 subcategories)
  - Educational: 50 books (10 per subcategory × 5 subcategories)
  - **Total: 332 books** (Wait, let me recalculate...)

Actually, let me fix the distribution to exactly 200 books:

## Fixed Distribution (200 books total)

- Fiction: 50 books (6-7 per subcategory)
- Non-Fiction: 80 books (5 per subcategory)
- Children: 35 books (7 per subcategory)
- Educational: 35 books (7 per subcategory)

## Proof & Logging

Every execution:
1. ✅ Checks if books were already added today (prevents duplicates)
2. ✅ Generates 200 books evenly across categories
3. ✅ Inserts books in batches of 50
4. ✅ Logs to `daily_logs` table with:
   - Date
   - Books added count
   - Total books in database
   - Execution timestamp
   - Status (success/error)
5. ✅ Returns comprehensive proof including:
   - Sample books added
   - Category breakdown
   - Execution log

## Manual Trigger

You can manually trigger the endpoint:
```bash
curl -X GET "https://your-domain.vercel.app/api/daily-books" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Monitoring

Check the `daily_logs` table in your Neon database to see:
- Daily execution history
- Books added per day
- Total book count over time
- Any errors that occurred

