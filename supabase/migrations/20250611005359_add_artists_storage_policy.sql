-- Create the artists bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('artists', 'artists', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'artists');

-- Allow admins to upload images
CREATE POLICY "Admins can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artists' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Allow admins to update their own uploads
CREATE POLICY "Admins can update their uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'artists' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Allow admins to delete their own uploads
CREATE POLICY "Admins can delete their uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'artists' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
); 