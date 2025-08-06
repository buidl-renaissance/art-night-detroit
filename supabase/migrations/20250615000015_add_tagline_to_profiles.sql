-- Add tagline column to profiles table
ALTER TABLE profiles
  ADD COLUMN tagline TEXT;

-- Create index for tagline lookups
CREATE INDEX idx_profiles_tagline ON profiles(tagline);

-- Add comment to document the new field
COMMENT ON COLUMN profiles.tagline IS 'User tagline/brief description for display purposes'; 