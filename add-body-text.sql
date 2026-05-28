-- Run once in Neon SQL editor to enable full-text reading + cache
ALTER TABLE books ADD COLUMN IF NOT EXISTS body_text TEXT;
