-- Fix ReadAI Database Schema
-- Add all missing columns to the books table

-- Add missing columns one by one
ALTER TABLE books ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE books ADD COLUMN IF NOT EXISTS rating DECIMAL(3,1);
ALTER TABLE books ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE books ADD COLUMN IF NOT EXISTS pages INTEGER;
ALTER TABLE books ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS recommended_for TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS added_date DATE DEFAULT CURRENT_DATE;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'books' 
ORDER BY ordinal_position;
