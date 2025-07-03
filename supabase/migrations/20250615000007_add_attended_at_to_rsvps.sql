-- Add attended_at field to RSVP table
ALTER TABLE rsvps 
ADD COLUMN attended_at TIMESTAMP WITH TIME ZONE;

-- Add comment to document the new field
COMMENT ON COLUMN rsvps.attended_at IS 'Timestamp when the person arrived at the event';

-- Create index for better performance when querying by attendance
CREATE INDEX idx_rsvps_attended_at ON rsvps(attended_at); 