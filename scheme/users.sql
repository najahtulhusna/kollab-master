
-- Refactored: all timestamps are TIMESTAMPTZ for timezone-aware storage
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  firstname TEXT,
  lastname TEXT,
  usertype TEXT, -- 'business' or 'influencer'
  phone TEXT,
  categories TEXT,
  referral_source TEXT
);

-- Note: Using TIMESTAMPTZ stores timezone-aware timestamps, which is best for analytics, reporting, and global applications.
