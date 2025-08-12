-- Drop the anonymous_participants table since we're using profiles + event_participants instead

-- First, drop any policies on the table
DROP POLICY IF EXISTS "Anonymous participants are viewable by everyone" ON anonymous_participants;
DROP POLICY IF EXISTS "Anyone can create anonymous participants" ON anonymous_participants;
DROP POLICY IF EXISTS "Only admins can modify anonymous participants" ON anonymous_participants;

-- Drop any triggers
DROP TRIGGER IF EXISTS handle_anonymous_participants_updated_at ON anonymous_participants;

-- Drop indexes
DROP INDEX IF EXISTS idx_anonymous_participants_event_id;
DROP INDEX IF EXISTS idx_anonymous_participants_email;

-- Finally, drop the table
DROP TABLE IF EXISTS anonymous_participants;

-- Add comment to document the change
COMMENT ON SCHEMA public IS 'Removed anonymous_participants table in favor of profiles + event_participants architecture';
