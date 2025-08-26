-- Add winner_ticket_id to raffle_artists table for more specific winner tracking
ALTER TABLE raffle_artists 
ADD COLUMN winner_ticket_id UUID REFERENCES tickets(id);

-- Add winner_selected_at timestamp to track when winner was selected
ALTER TABLE raffle_artists 
ADD COLUMN winner_selected_at TIMESTAMPTZ;

-- Create index for faster winner lookups
CREATE INDEX idx_raffle_artists_winner_ticket ON raffle_artists(winner_ticket_id) WHERE winner_ticket_id IS NOT NULL;

-- Add comment to document the winner system
COMMENT ON COLUMN raffle_artists.winner_ticket_id IS 'References the specific winning ticket for this artist in the raffle';
COMMENT ON COLUMN raffle_artists.winner_selected_at IS 'Timestamp when the winner was selected for this artist';
