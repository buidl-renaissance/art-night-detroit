-- Create email subscriptions table for marketing and newsletter signups
CREATE TABLE email_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'general', -- tracks where the subscription came from
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}', -- for storing additional data like interests, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_email_subscriptions_updated_at 
  BEFORE UPDATE ON email_subscriptions
  FOR EACH ROW 
  EXECUTE FUNCTION moddatetime();

-- Create policies
-- Allow anyone to subscribe (INSERT)
CREATE POLICY "Anyone can subscribe to emails" 
  ON email_subscriptions
  FOR INSERT 
  WITH CHECK (true);

-- Allow public to check if email exists (for avoiding duplicates)
CREATE POLICY "Anyone can check email subscription status" 
  ON email_subscriptions
  FOR SELECT 
  USING (true);

-- Only admins can view all subscriptions and update/delete
CREATE POLICY "Admins can manage all email subscriptions" 
  ON email_subscriptions
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX idx_email_subscriptions_source ON email_subscriptions(source);
CREATE INDEX idx_email_subscriptions_status ON email_subscriptions(status);
CREATE INDEX idx_email_subscriptions_subscribed_at ON email_subscriptions(subscribed_at);

-- Add comment to document the table
COMMENT ON TABLE email_subscriptions IS 'Email subscriptions for marketing, newsletters, and cultural banking updates';
