import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Get all events
    const { data: events, error } = await supabase
      .from('events')
      .select('id, name, status, start_date')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ error: 'Failed to fetch events', details: error });
    }

    return res.status(200).json({ 
      events: events || [],
      count: events?.length || 0
    });

  } catch (error) {
    console.error('Error in test-events:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 