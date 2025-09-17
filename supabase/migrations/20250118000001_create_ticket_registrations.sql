-- Create ticket_registrations table for ArtistXclusive after-party tickets
CREATE TABLE ticket_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  ticket_number INTEGER NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints
ALTER TABLE ticket_registrations 
ADD CONSTRAINT ticket_registrations_ticket_number_check 
CHECK (ticket_number >= 1 AND ticket_number <= 40);

-- Add unique constraint for event_id + ticket_number combination
ALTER TABLE ticket_registrations 
ADD CONSTRAINT ticket_registrations_event_ticket_unique 
UNIQUE (event_id, ticket_number);

-- Add indexes
CREATE INDEX idx_ticket_registrations_event_id ON ticket_registrations(event_id);
CREATE INDEX idx_ticket_registrations_ticket_number ON ticket_registrations(ticket_number);
CREATE INDEX idx_ticket_registrations_phone ON ticket_registrations(phone);
CREATE INDEX idx_ticket_registrations_registered_at ON ticket_registrations(registered_at);

-- Add comments
COMMENT ON TABLE ticket_registrations IS 'Stores registration information for ArtistXclusive after-party tickets';
COMMENT ON COLUMN ticket_registrations.event_id IS 'ID of the event this ticket belongs to';
COMMENT ON COLUMN ticket_registrations.name IS 'Name or artist handle of the ticket holder';
COMMENT ON COLUMN ticket_registrations.phone IS 'Phone number for confirmation texts (format: (xxx) xxx-xxxx)';
COMMENT ON COLUMN ticket_registrations.ticket_number IS 'Ticket number from 1 to 40 (unique per event)';
COMMENT ON COLUMN ticket_registrations.registered_at IS 'When the ticket was registered by the user';

-- Enable RLS (Row Level Security)
ALTER TABLE ticket_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for ticket registrations
-- Allow anyone to register a ticket (insert)
CREATE POLICY "Allow ticket registration" ON ticket_registrations
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to read their own registration (by phone number)
CREATE POLICY "Allow users to read own registration" ON ticket_registrations
  FOR SELECT 
  USING (true); -- For now, allow reading all registrations (could be restricted later)

-- Only allow admins to update/delete (will be handled by service role)
CREATE POLICY "Admin only updates" ON ticket_registrations
  FOR UPDATE 
  USING (false); -- No updates allowed through RLS (only service role)

CREATE POLICY "Admin only deletes" ON ticket_registrations
  FOR DELETE 
  USING (false); -- No deletes allowed through RLS (only service role)
