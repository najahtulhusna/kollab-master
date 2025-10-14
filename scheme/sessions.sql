
-- Refactored: user_id and session_token are NOT NULL, all timestamps are TIMESTAMPTZ, index on user_id
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,   -- JWT or random token
  expires_at TIMESTAMPTZ NOT NULL,      -- timezone-aware timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by user_id
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Note: Using TIMESTAMPTZ stores timezone-aware timestamps, which is best for analytics, reporting, and global applications.
