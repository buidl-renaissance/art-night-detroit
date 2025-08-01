-- Add RLS policies for tickets table
-- Allow public read access to tickets
CREATE POLICY "Allow public read on tickets" ON tickets
  FOR SELECT USING (true);

-- Allow public insert access to tickets (for QR code claiming)
CREATE POLICY "Allow public insert on tickets" ON tickets
  FOR INSERT WITH CHECK (true);

-- Allow public update access to tickets (for claiming)
CREATE POLICY "Allow public update on tickets" ON tickets
  FOR UPDATE USING (true); 