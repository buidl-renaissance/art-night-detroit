-- Fix infinite recursion in RLS policies
-- This migration fixes policies that were causing infinite recursion due to schema changes

-- Drop existing policies that may cause infinite recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage event participants" ON event_participants;

-- Recreate profiles policies with correct column references
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
      EXISTS (SELECT 1 FROM profiles WHERE profiles.auth_user_id = auth.uid() AND profiles.is_admin = true)
    );
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Recreate event participants policies with correct column references
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
      EXISTS (SELECT 1 FROM profiles WHERE profiles.auth_user_id = auth.uid() AND profiles.is_admin = true)
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
