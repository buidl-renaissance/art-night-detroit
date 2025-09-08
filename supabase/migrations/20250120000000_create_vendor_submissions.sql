-- Create vendor_submissions table
CREATE TABLE vendor_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website_link TEXT,
  instagram_link TEXT,
  business_type TEXT NOT NULL, -- food, retail, services, etc.
  business_description TEXT NOT NULL,
  products_services TEXT NOT NULL, -- what they sell/offer
  setup_requirements TEXT, -- space, power, water needs
  insurance_coverage BOOLEAN DEFAULT false,
  previous_event_experience TEXT,
  willing_to_donate_raffle_item BOOLEAN DEFAULT false,
  raffle_item_description TEXT,
  additional_notes TEXT,
  business_license_files JSONB DEFAULT '[]'::jsonb, -- Array of file URLs for licenses/permits
  product_images JSONB DEFAULT '[]'::jsonb, -- Array of file URLs for product photos
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

-- Create storage bucket for vendor files if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendor-submissions',
  'vendor-submissions',
  true,
  52428800, -- 50MB limit for vendor files
  ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for vendor-submissions bucket
CREATE POLICY "Allow public read access to vendor submissions"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-submissions');

-- Allow public to upload vendor files (for submissions)
CREATE POLICY "Allow public upload to vendor submissions"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vendor-submissions');

-- Only allow admins to delete vendor files
CREATE POLICY "Only admins can delete vendor files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vendor-submissions' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Create RLS policies for vendor_submissions table
ALTER TABLE vendor_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public users to insert vendor submissions
CREATE POLICY "Allow public insert on vendor_submissions"
ON vendor_submissions FOR INSERT
TO public
WITH CHECK (true);

-- Allow admin users to view all submissions
CREATE POLICY "Allow admin read on vendor_submissions"
ON vendor_submissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Allow admin users to update submissions (for review process)
CREATE POLICY "Allow admin update on vendor_submissions"
ON vendor_submissions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Create indexes for better performance
CREATE INDEX idx_vendor_submissions_email ON vendor_submissions(email);
CREATE INDEX idx_vendor_submissions_status ON vendor_submissions(status);
CREATE INDEX idx_vendor_submissions_business_type ON vendor_submissions(business_type);
CREATE INDEX idx_vendor_submissions_created_at ON vendor_submissions(created_at);
CREATE INDEX idx_vendor_submissions_reviewed_at ON vendor_submissions(reviewed_at);

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_vendor_submissions_updated_at 
  BEFORE UPDATE ON vendor_submissions
  FOR EACH ROW 
  EXECUTE FUNCTION moddatetime();

-- Add comment to document the table
COMMENT ON TABLE vendor_submissions IS 'Vendor applications for Art Night Detroit events and markets';
