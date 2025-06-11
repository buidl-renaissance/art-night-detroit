-- Create policy for users to view their own tickets
CREATE POLICY "Users can view their own raffle tickets" ON tickets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add policy to allow admins to view all tickets
CREATE POLICY "Admins can view all tickets" ON tickets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
); 