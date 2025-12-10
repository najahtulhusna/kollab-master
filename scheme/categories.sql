-- Categories master table and user <> category many-to-many mapping
-- Run after creating users table.

CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table to attach multiple categories to a user
CREATE TABLE user_categories (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, category_id)
);

-- Helpful index for querying by category
CREATE INDEX idx_user_categories_category_id ON user_categories(category_id);
