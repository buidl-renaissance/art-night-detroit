-- Create artist_submissions table
CREATE TABLE artist_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  artist_alias TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  instagram_link TEXT,
  portfolio_link TEXT,
  portfolio_files JSONB DEFAULT '[]'::jsonb, -- Array of file URLs
  willing_to_volunteer BOOLEAN DEFAULT false,
  interested_in_future_events BOOLEAN DEFAULT false,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN (
    'pending_review',
    'under_review',
    'approved',
    'rejected',
    'contacted'
  )),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create storage bucket for artist portfolios if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artist-portfolios',
  'artist-portfolios',
  true,
  52428800, -- 50MB limit for portfolio files
  ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for artist-portfolios bucket
CREATE POLICY "Allow public read access to artist portfolios"
ON storage.objects FOR SELECT
USING (bucket_id = 'artist-portfolios');

-- Allow public to upload portfolio files (for submissions)
CREATE POLICY "Allow public upload to artist portfolios"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'artist-portfolios');

-- Only allow admins to delete portfolio files
CREATE POLICY "Only admins can delete portfolio files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'artist-portfolios' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Create RLS policies for artist_submissions table
ALTER TABLE artist_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public users to insert artist submissions
CREATE POLICY "Allow public insert on artist_submissions"
ON artist_submissions FOR INSERT
TO public
WITH CHECK (true);

-- Allow admin users to view all submissions
CREATE POLICY "Allow admin read on artist_submissions"
ON artist_submissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Allow admin users to update submissions (for review process)
CREATE POLICY "Allow admin update on artist_submissions"
ON artist_submissions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Create indexes for better performance
CREATE INDEX idx_artist_submissions_email ON artist_submissions(email);
CREATE INDEX idx_artist_submissions_status ON artist_submissions(status);
CREATE INDEX idx_artist_submissions_created_at ON artist_submissions(created_at);
CREATE INDEX idx_artist_submissions_reviewed_at ON artist_submissions(reviewed_at);

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_artist_submissions_updated_at 
  BEFORE UPDATE ON artist_submissions
  FOR EACH ROW 
  EXECUTE FUNCTION moddatetime();

-- Add comment to document the table
COMMENT ON TABLE artist_submissions IS 'Artist applications for Murals in the Market and other Art Night Detroit events';
