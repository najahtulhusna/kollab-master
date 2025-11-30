

CREATE TABLE business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT UNIQUE NOT NULL,  
  job_position TEXT UNIQUE NOT NULL,
  team_size TEXT,
  location TEXT
);

-- Index for faster lookups by user_id
CREATE INDEX idx_business_user_id ON business(user_id);
