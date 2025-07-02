-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for event images - anyone can view
CREATE POLICY "Event images are viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'events');

-- Create storage policy for event images - only admins can upload
CREATE POLICY "Only admins can upload event images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'events' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create storage policy for event images - only admins can update
CREATE POLICY "Only admins can update event images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'events' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create storage policy for event images - only admins can delete
CREATE POLICY "Only admins can delete event images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'events' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  ); 