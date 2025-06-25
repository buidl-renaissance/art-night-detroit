-- Add user_id column to artists table
ALTER TABLE artists ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create enum for artwork status
CREATE TYPE artwork_status AS ENUM ('draft', 'active', 'archived');

-- Create artwork table
CREATE TABLE artwork (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    artist_id UUID REFERENCES artists(id) NOT NULL,
    medium TEXT NOT NULL,
    dimensions VARCHAR(100),
    year_created INTEGER,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    status artwork_status NOT NULL DEFAULT 'draft',
    image_url TEXT,
    additional_images TEXT[],
    data JSONB,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_artwork_artist_id ON artwork(artist_id);
CREATE INDEX idx_artwork_status ON artwork(status);
CREATE INDEX idx_artwork_medium ON artwork(medium);
CREATE INDEX idx_artwork_price ON artwork(price);
CREATE INDEX idx_artwork_created_at ON artwork(created_at);

-- Add RLS policies
ALTER TABLE artwork ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active artwork
CREATE POLICY "Public can view active artwork"
    ON artwork
    FOR SELECT
    USING (status = 'active');

-- Allow artists to view their own artwork
CREATE POLICY "Artists can view their own artwork"
    ON artwork
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM artists 
            WHERE artists.id = artwork.artist_id 
            AND artists.user_id = auth.uid()
        )
    );

-- Allow artists to create their own artwork
CREATE POLICY "Artists can create their own artwork"
    ON artwork
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM artists 
            WHERE artists.id = artwork.artist_id 
            AND artists.user_id = auth.uid()
        )
    );

-- Allow artists to update their own artwork
CREATE POLICY "Artists can update their own artwork"
    ON artwork
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM artists 
            WHERE artists.id = artwork.artist_id 
            AND artists.user_id = auth.uid()
        )
    );

-- Allow admins to manage all artwork
CREATE POLICY "Admins can manage all artwork"
    ON artwork
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_artwork_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_artwork_updated_at
    BEFORE UPDATE ON artwork
    FOR EACH ROW
    EXECUTE FUNCTION update_artwork_updated_at();

-- Create a view that joins artwork with artist information
CREATE OR REPLACE VIEW artwork_with_artist AS
SELECT 
    a.*,
    ar.name as artist_name,
    ar.bio as artist_bio,
    ar.instagram_handle as artist_instagram
FROM artwork a
JOIN artists ar ON a.artist_id = ar.id;

-- Grant access to the view
GRANT SELECT ON artwork_with_artist TO authenticated;
GRANT SELECT ON artwork_with_artist TO anon;