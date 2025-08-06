import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId, name, email, role, instagram } = req.body;

  console.log('Test participant upload received:', { eventId, name, email, role, instagram });

  if (!eventId || !name || !email || !role || !instagram) {
    return res.status(400).json({ error: 'Missing required fields', received: { eventId, name, email, role, instagram } });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // First, check if the event exists
    console.log('Looking for event with ID:', eventId);
    
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, status')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('Event lookup error:', eventError);
      return res.status(404).json({ error: 'Event not found', details: eventError });
    }

    if (!event) {
      console.error('No event found with ID:', eventId);
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log('Found event:', event);

    return res.status(200).json({ 
      message: 'Event found successfully',
      event: event
    });

  } catch (error) {
    console.error('Error in test participant upload:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 