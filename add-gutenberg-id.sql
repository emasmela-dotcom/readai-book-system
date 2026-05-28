ALTER TABLE books ADD COLUMN IF NOT EXISTS gutenberg_id INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS books_gutenberg_id_unique ON books (gutenberg_id) WHERE gutenberg_id IS NOT NULL;
