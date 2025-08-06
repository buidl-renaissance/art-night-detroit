-- Add image_url column to profiles table
ALTER TABLE profiles
  ADD COLUMN image_url TEXT;

-- Create index for image_url lookups
CREATE INDEX idx_profiles_image_url ON profiles(image_url);

-- Add comment to document the new field
COMMENT ON COLUMN profiles.image_url IS 'Profile picture URL for display purposes'; 