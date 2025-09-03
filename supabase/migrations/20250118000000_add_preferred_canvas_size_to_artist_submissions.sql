-- Add preferred_canvas_size column to artist_submissions table
ALTER TABLE artist_submissions 
ADD COLUMN preferred_canvas_size TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN artist_submissions.preferred_canvas_size IS 'Artist preferred canvas size: 18x18, 18x24, or own-canvas';
