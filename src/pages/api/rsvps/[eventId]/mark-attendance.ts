import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventId } = req.query;
    const { rsvpId, attended } = req.body;

    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    if (!rsvpId || typeof rsvpId !== 'string') {
      return res.status(400).json({ error: 'RSVP ID is required' });
    }

    if (typeof attended !== 'boolean') {
      return res.status(400).json({ error: 'Attended status is required' });
    }

    // Update the RSVP with attendance timestamp
    const updateData = attended 
      ? { attended_at: new Date().toISOString() }
      : { attended_at: null };

    const { data, error: updateError } = await supabase
      .from('rsvps')
      .update(updateData)
      .eq('id', rsvpId)
      .eq('event_id', eventId) // Extra safety check
      .select('id, handle, name, email, status, created_at, attended_at')
      .single();

    console.log('data', data);

    if (updateError) {
      console.error('Error updating RSVP attendance:', updateError);
      return res.status(500).json({ error: 'Failed to update attendance' });
    }

    if (!data) {
      return res.status(404).json({ error: 'RSVP not found' });
    }

    return res.status(200).json({ 
      success: true, 
      rsvp: data,
      message: attended ? 'Attendance marked' : 'Attendance unmarked'
    });

  } catch (error) {
    console.error('Mark attendance API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 