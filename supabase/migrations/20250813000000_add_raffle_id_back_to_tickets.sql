-- Add raffle_id back to tickets table since API code expects it
-- This migration adds the raffle_id column back to the tickets table

-- Add raffle_id column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'raffle_id') THEN
    ALTER TABLE tickets ADD COLUMN raffle_id uuid REFERENCES raffles(id);
  END IF;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create index on raffle_id for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_raffle_id ON tickets(raffle_id);

-- Update RLS policies to include raffle_id
DROP POLICY IF EXISTS "Allow public read on tickets" ON tickets;
DROP POLICY IF EXISTS "Allow public insert on tickets" ON tickets;
DROP POLICY IF EXISTS "Allow public update on tickets" ON tickets;

-- Recreate policies
CREATE POLICY "Allow public read on tickets" ON tickets
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on tickets" ON tickets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on tickets" ON tickets
  FOR UPDATE USING (true);
