import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId } = req.query;
  const eventIdString = Array.isArray(eventId) ? eventId[0] : eventId;

  if (!eventIdString) {
    return res.status(400).json({ error: 'Missing event ID' });
  }

  const { profileId, role } = req.body;

  if (!profileId || !role) {
    return res.status(400).json({ error: 'Profile ID and role are required' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Check if the event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, status')
      .eq('id', eventIdString)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if the profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Check if participant already exists for this event
    const { data: existingParticipant } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventIdString)
      .eq('profile_id', profileId)
      .single();

    if (existingParticipant) {
      // Update existing participant
      const { error: updateError } = await supabase
        .from('event_participants')
        .update({ 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingParticipant.id);

      if (updateError) {
        console.error('Error updating participant:', updateError);
        return res.status(500).json({ error: 'Failed to update participant' });
      }
    } else {
      // Create new participant
      const { error: createError } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventIdString,
          profile_id: profileId,
          role
        });

      if (createError) {
        console.error('Error creating participant:', createError);
        return res.status(500).json({ error: 'Failed to create participant' });
      }
    }

    return res.status(200).json({ 
      message: 'Participant added successfully',
      redirectUrl: `/events/${eventIdString}/connect`
    });

  } catch (error) {
    console.error('Error adding participant:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
