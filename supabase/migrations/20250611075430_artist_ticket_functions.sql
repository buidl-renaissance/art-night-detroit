-- Create function to get user's submitted tickets for each artist in a raffle
CREATE OR REPLACE FUNCTION get_user_artist_tickets(raffle_id_param UUID, user_id_param UUID)
RETURNS TABLE (
    artist_id UUID,
    user_tickets BIGINT
) SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as artist_id,
        COUNT(t.id) as user_tickets
    FROM artists a
    LEFT JOIN tickets t ON t.artist_id = a.id
    WHERE t.raffle_id = raffle_id_param
    AND t.user_id = user_id_param
    AND t.status = 'used'
    GROUP BY a.id;
END;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION get_user_artist_tickets TO public;
