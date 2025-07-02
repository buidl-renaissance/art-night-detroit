-- Add status to rsvps table
ALTER TABLE rsvps
ADD COLUMN status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'rejected', 'canceled'));

-- Add comment to document the new field
COMMENT ON COLUMN rsvps.status IS 'RSVP status: confirmed, waitlisted, rejected, or canceled. Default is confirmed.';

-- Create index for better performance when filtering by status
CREATE INDEX idx_rsvps_status ON rsvps(status);
CREATE INDEX idx_rsvps_event_status ON rsvps(event_id, status); 