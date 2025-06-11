-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create artists table
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alter raffles table to add new columns and constraints
ALTER TABLE raffles
  ADD COLUMN event_id UUID REFERENCES events(id);

-- Create raffle_artists table (junction table for raffles and artists)
CREATE TABLE raffle_artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  image_url TEXT,
  ticket_count INTEGER NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(raffle_id, artist_id)
);

-- Alter tickets table to add status and remove raffle_id
ALTER TABLE tickets
  ADD COLUMN artist_id UUID REFERENCES artists(id),
  ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  ALTER COLUMN user_id SET NOT NULL;

-- Create ticket_votes table (tracks which artist a ticket is assigned to in a raffle)
CREATE TABLE ticket_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ticket_id, raffle_id) -- A ticket can only vote once per raffle
);

-- Create function to update ticket count
CREATE OR REPLACE FUNCTION update_raffle_artist_ticket_count()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a new vote
  IF (TG_OP = 'INSERT') THEN
    UPDATE raffle_artists
    SET ticket_count = ticket_count + 1
    WHERE raffle_id = NEW.raffle_id
    AND artist_id = NEW.artist_id;
  -- If this is a vote being deleted
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE raffle_artists
    SET ticket_count = ticket_count - 1
    WHERE raffle_id = OLD.raffle_id
    AND artist_id = OLD.artist_id;
  -- If this is a vote being updated (changing artist)
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Decrease count for old artist
    UPDATE raffle_artists
    SET ticket_count = ticket_count - 1
    WHERE raffle_id = OLD.raffle_id
    AND artist_id = OLD.artist_id;
    
    -- Increase count for new artist
    UPDATE raffle_artists
    SET ticket_count = ticket_count + 1
    WHERE raffle_id = NEW.raffle_id
    AND artist_id = NEW.artist_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain ticket counts
CREATE TRIGGER maintain_raffle_artist_ticket_count
AFTER INSERT OR UPDATE OR DELETE ON ticket_votes
FOR EACH ROW
EXECUTE FUNCTION update_raffle_artist_ticket_count();

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create policies for artists
CREATE POLICY "Artists are viewable by everyone" ON artists
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify artists" ON artists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create policies for raffles
CREATE POLICY "Raffles are viewable by everyone" ON raffles
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify raffles" ON raffles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create policies for raffle_artists
CREATE POLICY "Raffle artists are viewable by everyone" ON raffle_artists
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify raffle artists" ON raffle_artists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create policies for tickets
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own tickets" ON tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tickets" ON tickets
  FOR UPDATE USING (user_id = auth.uid());

-- Create policies for ticket_votes
CREATE POLICY "Users can view their own ticket votes" ON ticket_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_votes.ticket_id
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own ticket votes" ON ticket_votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_votes.ticket_id
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own ticket votes" ON ticket_votes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_votes.ticket_id
      AND tickets.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_raffles_event_id ON raffles(event_id);
CREATE INDEX idx_raffle_artists_raffle_id ON raffle_artists(raffle_id);
CREATE INDEX idx_raffle_artists_artist_id ON raffle_artists(artist_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_ticket_votes_ticket_id ON ticket_votes(ticket_id);
CREATE INDEX idx_ticket_votes_raffle_id ON ticket_votes(raffle_id);
CREATE INDEX idx_ticket_votes_artist_id ON ticket_votes(artist_id); 