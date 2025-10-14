
-- Refactored: all timestamps are TIMESTAMPTZ for timezone-aware storage
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: Using TIMESTAMPTZ stores timezone-aware timestamps, which is best for analytics, reporting, and global applications.
