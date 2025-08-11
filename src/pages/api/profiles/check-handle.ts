import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { handle } = req.body;

  if (!handle) {
    return res.status(400).json({ error: 'Handle is required' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Check if profile exists with this handle
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('handle', handle)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking handle:', error);
      return res.status(500).json({ error: 'Failed to check handle' });
    }

    if (profile) {
      return res.status(200).json({ 
        exists: true, 
        profile 
      });
    } else {
      return res.status(200).json({ 
        exists: false 
      });
    }

  } catch (error) {
    console.error('Error in check handle:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
