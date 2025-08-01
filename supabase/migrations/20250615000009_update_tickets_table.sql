-- Update tickets table to use participant_id instead of user_id

-- Drop existing RLS policies that depend on user_id
DROP POLICY IF EXISTS "Users can view their own raffle tickets" ON raffles;
DROP POLICY IF EXISTS "Users can view their own raffle tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can create their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view their own ticket votes" ON ticket_votes;
DROP POLICY IF EXISTS "Users can create their own ticket votes" ON ticket_votes;
DROP POLICY IF EXISTS "Users can update their own ticket votes" ON ticket_votes;

-- Drop the user_id column and constraint
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_user_id_fkey;
ALTER TABLE tickets DROP COLUMN IF EXISTS user_id;

-- Add participant_id column
ALTER TABLE tickets ADD COLUMN participant_id uuid REFERENCES participants(id);

-- Update the tickets table to make participant_id nullable (since tickets can exist without being claimed)
-- The participant_id will be set when tickets are claimed via QR codes 