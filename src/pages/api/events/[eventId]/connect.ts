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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    console.log('Received request for event ID:', eventIdString);
    console.log('Request headers:', req.headers);
    
    const {
      name,
      email,
      role,
      tagline,
      website,
      instagram,
      performance_details,
      setup_requirements,
      profile_image_url,
      handle,
    } = req.body;

    console.log('Received form data:', {
      name,
      email,
      role,
      tagline,
      website,
      instagram,
      performance_details,
      setup_requirements,
      profile_image_url,
      handle,
    });

    if (!name || !email || !role || !instagram || !handle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // First, check if the event exists
    console.log('Looking for event with ID:', eventIdString);
    
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, status')
      .eq('id', eventIdString)
      .single();

    if (eventError) {
      console.error('Event lookup error:', eventError);
      return res.status(404).json({ error: 'Event not found', details: eventError });
    }

    if (!event) {
      console.error('No event found with ID:', eventIdString);
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log('Found event:', event);

    // First, create or update the profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('handle', handle)
      .single();

    let profileId: string;

    if (existingProfile) {
      // Update existing profile
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          full_name: name,
          email,
          tagline: tagline || null,
          website: website || null,
          image_url: profile_image_url || null,
          instagram: instagram || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id);

      if (updateProfileError) {
        console.error('Error updating profile:', updateProfileError);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      profileId = existingProfile.id;
    } else {
      // Create new profile
      const { data: newProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          handle,
          full_name: name,
          email,
          tagline: tagline || null,
          website: website || null,
          image_url: profile_image_url || null,
          instagram: instagram || null,
          is_admin: false,
          is_authenticated: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        return res.status(500).json({ error: 'Failed to create profile' });
      }

      profileId = newProfile.id;
    }

    // Now add the profile to the event as a participant
    const { data: existingParticipant } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventIdString)
      .eq('profile_id', profileId)
      .single();

    if (existingParticipant) {
      // Update existing participant
      const { error: updateParticipantError } = await supabase
        .from('event_participants')
        .update({
          role,
          bio: tagline || null,
          performance_details: performance_details || null,
          setup_requirements: setup_requirements || null,
          social_links: { instagram: instagram || null },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingParticipant.id);

      if (updateParticipantError) {
        console.error('Error updating participant:', updateParticipantError);
        return res.status(500).json({ error: 'Failed to update participant' });
      }
    } else {
      // Create new participant
      const { error: createParticipantError } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventIdString,
          profile_id: profileId,
          role,
          bio: tagline || null,
          performance_details: performance_details || null,
          setup_requirements: setup_requirements || null,
          social_links: { instagram: instagram || null },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createParticipantError) {
        console.error('Error creating participant:', createParticipantError);
        return res.status(500).json({ error: 'Failed to create participant' });
      }
    }

    return res.status(200).json({ 
      message: 'Participant information submitted successfully',
              redirectUrl: `/events/${eventIdString}/connect`
    });

  } catch (error) {
    console.error('Error in participant upload:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 