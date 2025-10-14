
-- Refactored: user_id is NOT NULL, all timestamps are TIMESTAMPTZ, index on user_id
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,              -- 'local', 'google', 'github', etc.
  provider_account_id TEXT,            -- unique ID from provider (Google sub, etc.)
  password_hash TEXT,                  -- only used for local accounts
  access_token TEXT,                   -- from OAuth provider
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,              -- timezone-aware timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (provider, provider_account_id)
);

-- Index for faster lookups by user_id
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- Note: Using TIMESTAMPTZ stores timezone-aware timestamps, which is best for analytics, reporting, and global applications.
