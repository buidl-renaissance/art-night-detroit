-- Create RSVP table
CREATE TABLE rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  handle TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS policies
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON rsvps
  FOR EACH ROW EXECUTE FUNCTION moddatetime();

-- Add RLS policies
-- Allow public to insert RSVPs (for the RSVP form)
CREATE POLICY "Anyone can create RSVPs"
  ON rsvps
  FOR INSERT
  WITH CHECK (true);

-- Allow public to read RSVPs (for viewing RSVP lists)
CREATE POLICY "Anyone can view RSVPs"
  ON rsvps
  FOR SELECT
  USING (true);

-- Allow admins to update and delete RSVPs
CREATE POLICY "Admins can update RSVPs"
  ON rsvps
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete RSVPs"
  ON rsvps
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_rsvps_event_id ON rsvps(event_id);
CREATE INDEX idx_rsvps_email ON rsvps(email);
CREATE INDEX idx_rsvps_created_at ON rsvps(created_at);

-- Add comment to document the table structure
COMMENT ON TABLE rsvps IS 'RSVP table for storing event RSVP information'; 