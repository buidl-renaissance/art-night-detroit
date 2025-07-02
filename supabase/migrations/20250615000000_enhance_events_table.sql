-- Enhance events table with additional fields
ALTER TABLE events 
  ADD COLUMN image_url TEXT,
  ADD COLUMN external_url TEXT,
  ADD COLUMN time_start TEXT,
  ADD COLUMN time_end TEXT,
  ADD COLUMN slug TEXT UNIQUE,
  ADD COLUMN featured BOOLEAN DEFAULT false;

-- Create index for slug lookups
CREATE INDEX idx_events_slug ON events(slug);

-- Create index for featured events
CREATE INDEX idx_events_featured ON events(featured);

-- Create index for status filtering
CREATE INDEX idx_events_status ON events(status);

-- Create index for date range queries
CREATE INDEX idx_events_date_range ON events(start_date, end_date);

-- Add comment to document the table structure
COMMENT ON TABLE events IS 'Events table for Art Night Detroit with enhanced fields for public display and management'; 