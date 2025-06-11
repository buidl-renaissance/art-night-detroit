-- Create a secure function to get tickets with profiles
CREATE OR REPLACE FUNCTION get_tickets_with_profiles(raffle_id UUID)
RETURNS TABLE (
  id UUID,
  ticket_number INTEGER,
  user_id UUID,
  created_at TIMESTAMPTZ,
  email TEXT,
  full_name TEXT
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
    t.user_id,
    t.created_at,
    p.email,
    p.full_name
  FROM tickets t
  JOIN auth.users u ON t.user_id = u.id
  JOIN profiles p ON u.id = p.id
  WHERE t.raffle_id = get_tickets_with_profiles.raffle_id
  ORDER BY t.ticket_number;
END;
$$; 