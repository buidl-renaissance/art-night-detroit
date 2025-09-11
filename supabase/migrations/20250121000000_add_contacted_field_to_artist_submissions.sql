-- Add contacted field to artist_submissions table to track if acceptance email has been sent
ALTER TABLE artist_submissions 
ADD COLUMN contacted BOOLEAN DEFAULT false;

-- Add index for better performance when filtering by contacted status
CREATE INDEX idx_artist_submissions_contacted ON artist_submissions(contacted);

-- Add a comment to document the column
COMMENT ON COLUMN artist_submissions.contacted IS 'Tracks whether an acceptance email has been sent to the artist';
