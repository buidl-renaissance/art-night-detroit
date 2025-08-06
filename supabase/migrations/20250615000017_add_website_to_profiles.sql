-- Add website column to profiles table
ALTER TABLE profiles
  ADD COLUMN website TEXT;

-- Create index for website lookups
CREATE INDEX idx_profiles_website ON profiles(website);

-- Add comment to document the new field
COMMENT ON COLUMN profiles.website IS 'User website URL for display and contact purposes'; 