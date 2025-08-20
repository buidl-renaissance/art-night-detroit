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

    // First, check if a profile exists with this handle
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('handle', handle)
      .single();

    // Also check if a user already exists with this email
    const { data: usersList, error: getUserError } = await supabase.auth.admin.listUsers();
    
    if (getUserError) {
      console.error('Error fetching users:', getUserError);
      // Continue without existing user check - we'll handle duplicate creation error later
    }
    
    const existingAuthUser = usersList?.users?.find(user => user.email === email);

    let profileId: string;
    let authUserId: string;

    if (existingProfile) {
      // Update existing profile
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          full_name: name,
          email,
          tagline: tagline || null,
          website: website || null,
          image_url: profile_image_url || null
        })
        .eq('id', existingProfile.id);

      if (updateProfileError) {
        console.error('Error updating profile:', updateProfileError);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      profileId = existingProfile.id;
    } else {
      // Check if we need to create a new auth user or use existing one
      if (existingAuthUser) {
        // Use existing auth user
        authUserId = existingAuthUser.id;
      } else {
        // Create a temporary auth user for anonymous profile
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: crypto.randomUUID(), // Random password they'll never use
          email_confirm: true,
          user_metadata: {
            full_name: name,
            handle: handle,
            is_anonymous: true
          }
        });

        if (authError) {
          console.error('Error creating auth user:', authError);
          return res.status(500).json({ error: 'Failed to create user account' });
        }

        authUserId = authUser.user.id;
      }

      // Now create the profile with the auth user ID
      const { data: newProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: authUserId,
          handle,
          full_name: name,
          email,
          tagline: tagline || null,
          website: website || null,
          image_url: profile_image_url || null,
          is_admin: false
        })
        .select('id')
        .single();

      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        return res.status(500).json({ error: 'Failed to create profile', details: createProfileError });
      }

      profileId = newProfile.id;
    }

    console.log('Using profileId for event participant:', profileId);

    // Now add or update the event participant
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
          role
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
          role
        });

      if (createParticipantError) {
        console.error('Error creating participant:', createParticipantError);
        return res.status(500).json({ error: 'Failed to create participant' });
      }

      console.log('Successfully created event participant with profile_id:', profileId);
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