# 🚀 Neon Database Setup Guide

This guide will help you set up your Neon database connection for ReadAI.

## 📋 Prerequisites

1. **Neon Account** - [Create one here](https://neon.tech) (free tier available)
2. **Python 3.8+** installed
3. **Node.js** installed (for the count script)

---

## 🎯 Quick Setup Steps

### Step 1: Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Sign up or log in
3. Click **"Create Project"**
4. Choose a name (e.g., "readai-books")
5. Select a region close to you
6. Click **"Create Project"**

### Step 2: Get Connection String

1. In your Neon project dashboard, go to **"Connection Details"**
2. Copy the **Connection String** (it looks like: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`)
3. Save it somewhere safe - you'll need it in the next step

### Step 3: Set Up Environment File

Create a `.env` file in your project root:

```bash
cd /Users/ericmasmela/digital-hermit/projects/readai-book-system
```

Then create the `.env` file with your connection string:

```bash
echo 'DATABASE_URL="your-neon-connection-string-here"' > .env
```

Or manually create `.env` and add:
```
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

### Step 4: Install Python Dependencies

```bash
pip install -r requirements.txt
```

Required packages:
- `psycopg2-binary` (PostgreSQL adapter)
- `python-dotenv` (for loading .env file)

### Step 5: Create Database Tables

Run the setup script to create the necessary tables:

```bash
python3 setup-neon.py
```

Or manually run this SQL in Neon's SQL Editor:

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

-- Daily logs table
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_added_date ON books(added_date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
```

### Step 6: Test Connection

Test your connection with the count script:

```bash
node check-count.js
```

Or use the Python connector:

```bash
python3 -c "from readai_neon_connector import ReadAINeonConnector; connector = ReadAINeonConnector(); connector.get_stats()"
```

---

## ✅ Verification

You should see:
- ✅ Connection successful
- ✅ Tables created
- ✅ Can query book count
- ✅ No errors

---

## 🔧 Troubleshooting

### "DATABASE_URL not set"
- Make sure `.env` file exists in project root
- Check that `DATABASE_URL` is spelled correctly
- Verify the connection string is in quotes if it contains special characters

### "Connection refused" or "Connection timeout"
- Check your Neon project is active (not paused)
- Verify the connection string is correct
- Check if your IP needs to be whitelisted (usually not needed for Neon)

### "Table does not exist"
- Run the SQL schema creation in Neon's SQL Editor
- Or run `python3 setup-neon.py`

---

## 📊 Next Steps

Once set up, you can:
- ✅ Check book count: `node check-count.js`
- ✅ Add books manually: `python3 readai_neon_connector.py`
- ✅ View stats: Use the Python connector's `get_stats()` method
- ✅ Deploy to Vercel: The DATABASE_URL will be set in Vercel's environment variables

---

## 🎉 Success!

Your Neon database is now set up and ready to use! 🚀

