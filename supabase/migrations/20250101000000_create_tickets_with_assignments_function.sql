-- Create a secure function to get tickets with profiles and artist assignments
CREATE OR REPLACE FUNCTION get_tickets_with_profiles_and_assignments(raffle_id UUID)
RETURNS TABLE (
  id UUID,
  ticket_number INTEGER,
  user_id UUID,
  created_at TIMESTAMPTZ,
  email TEXT,
  full_name TEXT,
  artist_name TEXT,
  artist_id UUID,
  submission_date TIMESTAMPTZ
) SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only admins can view tickets';
  END IF;

  RETURN QUERY
  SELECT 
    t.id,
    t.ticket_number,
    to_user.user_id,
    t.created_at,
    p.email,
    p.full_name,
    a.name as artist_name,
    a.id as artist_id,
    ts.submitted_at as submission_date
  FROM tickets t
  JOIN ticket_orders to_user ON t.id = ANY(to_user.issued_tickets)
  JOIN auth.users u ON to_user.user_id = u.id
  JOIN profiles p ON u.id = p.id
  LEFT JOIN ticket_submissions ts ON t.id = ts.ticket_id
  LEFT JOIN raffle_artists ra ON ts.raffle_artist_id = ra.id
  LEFT JOIN artists a ON ra.artist_id = a.id
  WHERE to_user.raffle_id = get_tickets_with_profiles_and_assignments.raffle_id
  ORDER BY t.ticket_number;
END;
$$;
