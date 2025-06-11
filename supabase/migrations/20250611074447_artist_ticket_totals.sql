-- Create a function to get ticket totals for a specific raffle
CREATE OR REPLACE FUNCTION get_artist_ticket_totals(raffle_id_param UUID)
RETURNS TABLE (
  artist_id UUID,
  total_tickets BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ra.artist_id,
    COUNT(t.id) as total_tickets
  FROM raffle_artists ra
  LEFT JOIN tickets t ON 
    t.artist_id = ra.artist_id 
    AND t.status = 'used' 
    AND t.raffle_id = ra.raffle_id
  WHERE ra.raffle_id = raffle_id_param
  GROUP BY ra.artist_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION get_artist_ticket_totals(UUID) TO public;
