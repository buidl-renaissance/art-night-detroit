-- Enable RLS on tables if not already enabled
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous read access
CREATE POLICY "Allow anonymous read access to raffles"
ON raffles FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous read access to raffle_artists"
ON raffle_artists FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous read access to artists"
ON artists FOR SELECT
TO anon
USING (true);

-- Create policy for the get_artist_ticket_totals function
CREATE POLICY "Allow anonymous access to get_artist_ticket_totals"
ON raffle_artists FOR SELECT
TO anon
USING (true);

-- Grant necessary permissions to anon role
GRANT SELECT ON raffles TO anon;
GRANT SELECT ON raffle_artists TO anon;
GRANT SELECT ON artists TO anon;
GRANT EXECUTE ON FUNCTION get_artist_ticket_totals TO anon;
