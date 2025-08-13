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

-- Drop old tables
DROP TABLE anonymous_participants;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_profile_id ON event_participants(profile_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_role ON event_participants(role);

-- Update RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Anyone can view profiles') THEN
    CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Anyone can create profiles') THEN
    CREATE POLICY "Anyone can create profiles" ON profiles FOR INSERT WITH CHECK (true);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = auth_user_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can manage all profiles') THEN
    CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    );
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Event participants policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_participants' AND policyname = 'Anyone can view event participants') THEN
    CREATE POLICY "Anyone can view event participants" ON event_participants FOR SELECT USING (true);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_participants' AND policyname = 'Admins can manage event participants') THEN
    CREATE POLICY "Admins can manage event participants" ON event_participants FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    );
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_participants' AND policyname = 'Profiles can manage their own event participation') THEN
    CREATE POLICY "Profiles can manage their own event participation" ON event_participants FOR ALL USING (
      profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    );
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create trigger
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'handle_updated_at' AND event_object_table = 'event_participants') THEN
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON event_participants
      FOR EACH ROW EXECUTE FUNCTION moddatetime();
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
