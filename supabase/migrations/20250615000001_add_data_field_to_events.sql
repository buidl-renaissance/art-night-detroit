-- Add data field to events table for flexible event data storage
ALTER TABLE events 
  ADD COLUMN data JSONB DEFAULT '{}'::jsonb;

-- Create index for JSONB data field queries
CREATE INDEX idx_events_data ON events USING GIN (data);

-- Add comment to document the data field
COMMENT ON COLUMN events.data IS 'Flexible JSONB field for storing additional event data like custom fields, metadata, or configuration'; 