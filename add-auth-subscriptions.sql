-- ReadAI auth + subscriptions (matches app code in lib/auth/* and lib/stripe/*)
-- Run once in Neon SQL Editor (or: psql "$DATABASE_URL" -f add-auth-subscriptions.sql)
--
-- Creates: users, sessions, password_reset_tokens
-- Subscription state lives on users.subscription_tier (no separate subscriptions table).
--
-- If you previously ran an older version of this file (INTEGER user ids, token_hash,
-- expires_at, subscriptions table), see the migration block at the bottom first.

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  trial_started_at TIMESTAMPTZ,
  subscription_tier TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_stripe_customer_id_unique UNIQUE (stripe_customer_id)
);

CREATE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));

-- ---------------------------------------------------------------------------
-- sessions (httpOnly cookie → lookup by session_token hash)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  CONSTRAINT sessions_session_token_unique UNIQUE (session_token)
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires);

-- ---------------------------------------------------------------------------
-- password_reset_tokens (forgot-password / reset-password routes)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT password_reset_tokens_token_hash_unique UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx ON password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_at_idx ON password_reset_tokens (expires_at);

-- ---------------------------------------------------------------------------
-- user_saved_books (saved place per account — not browser localStorage)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_saved_books (
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES books (id) ON DELETE CASCADE,
  position_mode TEXT NOT NULL DEFAULT 'pages' CHECK (position_mode IN ('pages', 'scroll')),
  position_page INTEGER,
  position_scroll_y INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, book_id)
);

CREATE INDEX IF NOT EXISTS user_saved_books_user_id_idx ON user_saved_books (user_id);

-- ---------------------------------------------------------------------------
-- Optional: upgrade columns on an existing users table (safe if already present)
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ---------------------------------------------------------------------------
-- Migration from OLD schema (only if sessions has token_hash / expires_at)
-- Run these manually after checking: SELECT column_name FROM information_schema.columns WHERE table_name = 'sessions';
-- ---------------------------------------------------------------------------
-- ALTER TABLE sessions RENAME COLUMN token_hash TO session_token;
-- ALTER TABLE sessions RENAME COLUMN expires_at TO expires;
-- DROP TABLE IF EXISTS subscriptions;
