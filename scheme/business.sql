

CREATE TABLE business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT UNIQUE NOT NULL,  
  job_position TEXT UNIQUE NOT NULL
);

-- Index for faster lookups by user_id
CREATE INDEX idx_business_user_id ON sessions(user_id);
