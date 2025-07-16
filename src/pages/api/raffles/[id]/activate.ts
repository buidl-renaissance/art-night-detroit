import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Raffle ID is required' });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the authorization token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.split(' ')[1];
    
    // Get the user from the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authorization token' });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Get the current raffle to check its status
    const { data: raffle, error: fetchError } = await supabase
      .from('raffles')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Raffle not found' });
    }

    if (raffle.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft raffles can be activated' });
    }

    // Update the raffle status to active
    const { error: updateError } = await supabase
      .from('raffles')
      .update({ status: 'active' })
      .eq('id', id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to activate raffle' });
    }

    return res.status(200).json({ message: 'Raffle activated successfully' });
  } catch (error) {
    console.error('Error activating raffle:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 