-- Remove bio and social_links columns from event_participants table
ALTER TABLE event_participants
  DROP COLUMN IF EXISTS bio,
  DROP COLUMN IF EXISTS social_links;

-- Update comment to reflect simplified structure
COMMENT ON TABLE event_participants IS 'Links profiles to events with specific roles (DJ, Featured Artist, Vendor, Attendee) - simplified structure'; 