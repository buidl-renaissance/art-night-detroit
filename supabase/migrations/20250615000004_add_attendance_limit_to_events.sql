-- Add attendance_limit to events table
ALTER TABLE events
ADD COLUMN attendance_limit INTEGER;

-- Add comment to document the new field
COMMENT ON COLUMN events.attendance_limit IS 'Maximum number of attendees allowed for this event. NULL means no limit.'; 