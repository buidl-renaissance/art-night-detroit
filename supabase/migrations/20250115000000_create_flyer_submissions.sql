-- Create flyer_submissions table
CREATE TABLE flyer_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  organizer_email TEXT NOT NULL,
  organizer_phone TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  event_location TEXT NOT NULL,
  event_description TEXT NOT NULL,
  event_website TEXT,
  instagram_handle TEXT,
  ticket_price TEXT,
  event_category TEXT NOT NULL CHECK (event_category IN (
    'art-exhibition',
    'music-performance', 
    'dance-performance',
    'theater',
    'workshop',
    'community-event',
    'fundraiser',
    'other'
  )),
  additional_notes TEXT,
  flyer_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN (
    'pending_extraction',
    'pending_review',
    'approved',
    'rejected',
    'published'
  )),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create storage bucket for flyers if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'flyers',
  'flyers',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for flyers bucket
CREATE POLICY "Allow public read access to flyers"
ON storage.objects FOR SELECT
USING (bucket_id = 'flyers');

CREATE POLICY "Allow authenticated users to upload flyers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'flyers');

-- Create RLS policies for flyer_submissions table
ALTER TABLE flyer_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public users to insert flyer submissions
CREATE POLICY "Allow public insert on flyer_submissions"
ON flyer_submissions FOR INSERT
TO public
WITH CHECK (true);

-- Allow admin users to view all submissions
CREATE POLICY "Allow admin read on flyer_submissions"
ON flyer_submissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Allow admin users to update submissions
CREATE POLICY "Allow admin update on flyer_submissions"
ON flyer_submissions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Create indexes for performance
CREATE INDEX idx_flyer_submissions_status ON flyer_submissions(status);
CREATE INDEX idx_flyer_submissions_event_date ON flyer_submissions(event_date);
CREATE INDEX idx_flyer_submissions_created_at ON flyer_submissions(created_at);
CREATE INDEX idx_flyer_submissions_organizer_email ON flyer_submissions(organizer_email);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_flyer_submissions_updated_at
    BEFORE UPDATE ON flyer_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE flyer_submissions IS 'Community event flyer submissions for Art Night Detroit';
