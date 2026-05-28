# 🛡️ ReadAI Supabase Setup Guide

## 🎯 **Prevent Supabase Database Pausing**

This guide will connect your ReadAI system to Supabase to prevent database pausing through daily book additions.

---

## 📋 **Prerequisites**

1. **Supabase Account** - [Create one here](https://supabase.com)
2. **Python 3.8+** installed
3. **Your existing ReadAI system** (543 books)

---

## 🚀 **Quick Setup (5 minutes)**

### **Step 1: Install Dependencies**
```bash
cd /Users/ericmasmela/digital-hermit/projects/readai-book-system
pip install -r requirements.txt
```

### **Step 2: Get Supabase Credentials**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL**
   - **Anon Key**
   - **Service Role Key** (for admin operations)

### **Step 3: Create Environment File**
```bash
# Create .env file
cat > .env << EOF
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
EOF
```

### **Step 4: Create Database Tables**
In your Supabase dashboard, go to **SQL Editor** and run:

```sql
-- Books table
CREATE TABLE books (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER,
    rating DECIMAL(2,1),
    description TEXT,
    tags TEXT[],
    pages INTEGER,
    difficulty TEXT,
    recommended_for TEXT,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    added_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily logs table
CREATE TABLE daily_logs (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    books_added INTEGER NOT NULL,
    total_books INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_subcategory ON books(subcategory);
CREATE INDEX idx_books_added_date ON books(added_date);
CREATE INDEX idx_daily_logs_date ON daily_logs(date);
```

### **Step 5: Run Setup**
```bash
python3 setup-supabase.py
```

---

## 🔄 **Migration Process**

The setup will:
1. ✅ **Test Supabase connection**
2. ✅ **Migrate your 543 existing books**
3. ✅ **Set up daily 200-book additions**
4. ✅ **Prevent database pausing**

---

## 🤖 **Automated Daily System**

### **Manual Test**
```bash
# Test the system once
python3 readai-supabase-connector.py
```

### **Automated Scheduler**
```bash
# Run the daily scheduler (keeps running)
python3 readai-supabase-scheduler.py
```

### **Cron Job (Recommended)**
Add to your crontab for automatic daily runs:
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 6:00 AM)
0 6 * * * cd /Users/ericmasmela/digital-hermit/projects/readai-book-system && python3 readai-supabase-connector.py
```

---

## 📊 **Daily Book Distribution**

**200 books added daily:**
- **Fiction (80 books - 40%)**
  - Sci-Fi: 16 books
  - Fantasy: 16 books
  - Mystery: 12 books
  - Romance: 12 books
  - Literary: 8 books
  - Thriller: 8 books
  - Horror: 4 books
  - Historical Fiction: 4 books

- **Non-Fiction (70 books - 35%)**
  - Self Help: 10 books
  - Business: 8 books
  - History: 6 books
  - Science: 6 books
  - Biography: 4 books
  - Memoir: 4 books
  - Philosophy: 4 books
  - Psychology: 4 books
  - Health: 4 books
  - Travel: 4 books
  - Cooking: 4 books
  - Art: 4 books
  - Technology: 4 books
  - Education: 4 books
  - Sports: 4 books
  - Nature: 4 books

- **Children (30 books - 15%)**
  - Picture Books: 8 books
  - Young Adult: 8 books
  - Middle Grade: 6 books
  - Children Fiction: 6 books
  - Educational: 2 books

- **Educational (20 books - 10%)**
  - Programming: 6 books
  - Language Learning: 4 books
  - Academic: 4 books
  - Reference: 4 books
  - Textbooks: 2 books

---

## 🛡️ **Database Pause Prevention**

### **Why This Works:**
- ✅ **Daily Activity**: 200 books added every day
- ✅ **Database Writes**: Keeps Supabase active
- ✅ **Scheduled Automation**: Runs at 6:00 AM daily
- ✅ **No Manual Intervention**: Fully automated

### **Monitoring:**
- Check Supabase dashboard for daily activity
- View `daily_logs` table for addition history
- Monitor `books` table for growing collection

---

## 🔧 **Troubleshooting**

### **Connection Issues:**
```bash
# Test connection
python3 -c "from readai_supabase_connector import ReadAISupabaseConnector; ReadAISupabaseConnector().test_connection()"
```

### **Migration Issues:**
```bash
# Check if JSON file exists
ls -la readai-books-database.json

# Manual migration
python3 -c "from readai_supabase_connector import ReadAISupabaseConnector; ReadAISupabaseConnector().migrate_from_json('readai-books-database.json')"
```

### **Scheduler Issues:**
```bash
# Check if scheduler is running
ps aux | grep readai-supabase-scheduler

# Manual daily addition
python3 readai-supabase-connector.py
```

---

## 📈 **Expected Results**

After setup:
- ✅ **543 existing books** migrated to Supabase
- ✅ **200 new books** added daily
- ✅ **Database stays active** (no pausing)
- ✅ **Automated system** runs daily
- ✅ **Growing book collection** in Supabase

---

## 🎉 **Success!**

Your ReadAI system is now:
- 🛡️ **Connected to Supabase**
- 📚 **Adding 200 books daily**
- ⏰ **Automated scheduling**
- 🚫 **Preventing database pausing**

**Your Supabase database will never pause again!** 🎉
