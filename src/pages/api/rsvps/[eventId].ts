import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventId } = req.query;

    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    // Fetch RSVPs for the specific event
    const { data: rsvps, error: fetchError } = await supabase
      .from('rsvps')
      .select('handle, name, email, status, created_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching RSVPs:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch RSVPs' });
    }

    return res.status(200).json({ 
      success: true, 
      rsvps: rsvps || [],
      count: rsvps?.length || 0
    });

  } catch (error) {
    console.error('RSVPs API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 