-- Update artist_submissions status check constraint to include new statuses
ALTER TABLE artist_submissions 
DROP CONSTRAINT artist_submissions_status_check;

ALTER TABLE artist_submissions 
ADD CONSTRAINT artist_submissions_status_check 
CHECK (status IN (
  'pending_review',
  'under_review',
  'approved',
  'accepted',
  'rejected',
  'declined',
  'contacted'
));
