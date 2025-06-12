-- Create enum for order status
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create ticket_orders table
CREATE TABLE ticket_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    number_of_tickets INTEGER NOT NULL CHECK (number_of_tickets > 0),
    status order_status NOT NULL DEFAULT 'pending',
    raffle_id UUID REFERENCES raffles(id),
    artist_id UUID REFERENCES artists(id),
    issued_tickets UUID[] DEFAULT '{}',
    stripe_checkout_session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_ticket_orders_user_id ON ticket_orders(user_id);

-- Create index on status for faster filtering
CREATE INDEX idx_ticket_orders_status ON ticket_orders(status);

-- Create index on stripe_checkout_session_id for faster lookups
CREATE INDEX idx_ticket_orders_stripe_session ON ticket_orders(stripe_checkout_session_id);

-- Add RLS policies
ALTER TABLE ticket_orders ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own orders
CREATE POLICY "Users can view their own orders"
    ON ticket_orders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to create their own orders
CREATE POLICY "Users can create their own orders"
    ON ticket_orders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own orders
CREATE POLICY "Users can update their own orders"
    ON ticket_orders
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_ticket_orders_updated_at
    BEFORE UPDATE ON ticket_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
