-- Add handle and phone_number columns to profiles table
ALTER TABLE profiles
  ADD COLUMN handle TEXT,
  ADD COLUMN phone_number TEXT;

-- Create index for handle lookups
CREATE INDEX idx_profiles_handle ON profiles(handle);

-- Create index for phone number lookups
CREATE INDEX idx_profiles_phone_number ON profiles(phone_number);

-- Add comments to document the new fields
COMMENT ON COLUMN profiles.handle IS 'User handle/username for display purposes';
COMMENT ON COLUMN profiles.phone_number IS 'User phone number for contact purposes'; 