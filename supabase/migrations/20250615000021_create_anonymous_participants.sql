-- Create a table for anonymous participants (non-authenticated users)
CREATE TABLE anonymous_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  tagline text,
  website text,
  instagram text NOT NULL,
  role text NOT NULL CHECK (role IN ('DJ', 'Featured Artist', 'Vendor', 'Attendee')),
  image_url text,
  performance_details text,
  setup_requirements text,
  social_links jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(event_id, email)
);

-- Enable RLS
ALTER TABLE anonymous_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous participants
CREATE POLICY "Anonymous participants are viewable by everyone" ON anonymous_participants
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create anonymous participants" ON anonymous_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can modify anonymous participants" ON anonymous_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_anonymous_participants_updated_at 
  BEFORE UPDATE ON anonymous_participants
  FOR EACH ROW 
  EXECUTE FUNCTION moddatetime();

-- Create indexes for better performance
CREATE INDEX idx_anonymous_participants_event_id ON anonymous_participants(event_id);
CREATE INDEX idx_anonymous_participants_email ON anonymous_participants(email); 