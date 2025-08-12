-- Consolidate all participant tables into a single profiles table

-- Modify profiles table to handle both authenticated and anonymous users
-- Drop foreign key constraint if it exists
DO $$ BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add columns only if they don't exist
DO $$ BEGIN
  -- Add handle column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'handle') THEN
    ALTER TABLE profiles ADD COLUMN handle TEXT UNIQUE;
  END IF;
  
  -- Add phone_number column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_number') THEN
    ALTER TABLE profiles ADD COLUMN phone_number TEXT;
  END IF;
  
  -- Add tagline column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tagline') THEN
    ALTER TABLE profiles ADD COLUMN tagline TEXT;
  END IF;
  
  -- Add website column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
    ALTER TABLE profiles ADD COLUMN website TEXT;
  END IF;
  
  -- Add image_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'image_url') THEN
    ALTER TABLE profiles ADD COLUMN image_url TEXT;
  END IF;
  
  -- Add instagram column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'instagram') THEN
    ALTER TABLE profiles ADD COLUMN instagram TEXT;
  END IF;
  
  -- Add is_authenticated column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_authenticated') THEN
    ALTER TABLE profiles ADD COLUMN is_authenticated BOOLEAN DEFAULT false;
  END IF;
  
  -- Add auth_user_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'auth_user_id') THEN
    ALTER TABLE profiles ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON profiles(handle);
CREATE INDEX IF NOT EXISTS idx_profiles_instagram ON profiles(instagram);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);

-- Update existing profiles to mark them as authenticated
UPDATE profiles 
SET is_authenticated = true, 
    auth_user_id = id 
WHERE id IN (SELECT id FROM auth.users);

-- Create new event_participants table with additional fields
CREATE TABLE event_participants_new (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('DJ', 'Featured Artist', 'Vendor', 'Attendee')),
  bio TEXT,
  performance_details TEXT,
  setup_requirements TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, profile_id)
);

-- Migrate existing data
INSERT INTO event_participants_new (event_id, profile_id, role, bio, social_links, created_at, updated_at)
SELECT event_id, profile_id, role, bio, social_links, created_at, updated_at
FROM event_participants;

-- Migrate anonymous_participants to profiles
INSERT INTO profiles (id, email, full_name, tagline, website, image_url, instagram, is_authenticated, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  email,
  full_name,
  tagline,
  website,
  image_url,
  instagram,
  false,
  created_at,
  updated_at
FROM anonymous_participants;

-- Link anonymous profiles to events
INSERT INTO event_participants_new (event_id, profile_id, role, bio, performance_details, setup_requirements, social_links, created_at, updated_at)
SELECT 
  ap.event_id,
  p.id,
  ap.role,
  ap.tagline as bio,
  ap.performance_details,
  ap.setup_requirements,
  ap.social_links,
  ap.created_at,
  ap.updated_at
FROM anonymous_participants ap
JOIN profiles p ON p.email = ap.email AND p.full_name = ap.full_name AND p.is_authenticated = false;

-- Drop old tables
DROP TABLE event_participants;
DROP TABLE anonymous_participants;
DROP TABLE participants;

-- Rename new table
ALTER TABLE event_participants_new RENAME TO event_participants;

-- Recreate indexes
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_profile_id ON event_participants(profile_id);
CREATE INDEX idx_event_participants_role ON event_participants(role);

-- Update RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can create profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Event participants policies
CREATE POLICY "Anyone can view event participants" ON event_participants FOR SELECT USING (true);
CREATE POLICY "Admins can manage event participants" ON event_participants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Profiles can manage their own event participation" ON event_participants FOR ALL USING (
  profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);

-- Create trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION moddatetime();
