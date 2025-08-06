-- Create event_participants table to link profiles to events with roles
CREATE TABLE event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('DJ', 'Featured Artist', 'Vendor', 'Attendee')),
  bio TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, profile_id) -- Each profile can only have one role per event
);

-- Create indexes for better performance
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_profile_id ON event_participants(profile_id);
CREATE INDEX idx_event_participants_role ON event_participants(role);

-- Add RLS policies
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION moddatetime();

-- Allow public to read event participants
CREATE POLICY "Anyone can view event participants"
  ON event_participants
  FOR SELECT
  USING (true);

-- Allow admins to create, update, and delete event participants
CREATE POLICY "Admins can manage event participants"
  ON event_participants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Add comment to document the table structure
COMMENT ON TABLE event_participants IS 'Links profiles to events with specific roles (DJ, Featured Artist, Vendor, Attendee)'; 