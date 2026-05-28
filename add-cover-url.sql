-- Run once in Neon SQL editor (or psql) after deploy.
ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_url TEXT;
CREATE INDEX IF NOT EXISTS idx_books_cover_url ON books (cover_url) WHERE cover_url IS NOT NULL;
