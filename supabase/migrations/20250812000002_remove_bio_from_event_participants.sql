-- Remove bio column from event_participants table
-- Bio should be part of the user's profile, not event-specific

-- Drop the bio column from event_participants
ALTER TABLE event_participants 
DROP COLUMN IF EXISTS bio;

-- Add comment to document the change
COMMENT ON TABLE event_participants IS 'Links profiles to events with specific roles and event-specific data (performance details, setup requirements, social links). User bio is stored in profiles table.';
