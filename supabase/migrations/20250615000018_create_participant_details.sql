-- Create participant_details table for storing additional participant information
CREATE TABLE participant_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  performance_details TEXT,
  setup_requirements TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, profile_id)
);

-- Create indexes for better performance
CREATE INDEX idx_participant_details_event_id ON participant_details(event_id);
CREATE INDEX idx_participant_details_profile_id ON participant_details(profile_id);
CREATE INDEX idx_participant_details_submitted_at ON participant_details(submitted_at);

-- Add RLS policies
ALTER TABLE participant_details ENABLE ROW LEVEL SECURITY;

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON participant_details
  FOR EACH ROW EXECUTE FUNCTION moddatetime();

-- Allow public to insert participant details (for the upload form)
CREATE POLICY "Anyone can create participant details"
  ON participant_details
  FOR INSERT
  WITH CHECK (true);

-- Allow public to read participant details
CREATE POLICY "Anyone can view participant details"
  ON participant_details
  FOR SELECT
  USING (true);

-- Allow admins to update and delete participant details
CREATE POLICY "Admins can manage participant details"
  ON participant_details
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Add comment to document the table structure
COMMENT ON TABLE participant_details IS 'Additional participant information for events including performance details and setup requirements'; 