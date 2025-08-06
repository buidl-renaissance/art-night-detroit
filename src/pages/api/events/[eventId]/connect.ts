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
    });

    if (!name || !email || !role || !instagram) {
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

    // Check if an anonymous participant already exists with this email for this event
    const { data: existingAnonymousParticipant } = await supabase
      .from('anonymous_participants')
      .select('id')
      .eq('event_id', eventIdString)
      .eq('email', email)
      .single();

    if (existingAnonymousParticipant) {
      // Update existing anonymous participant
      const updateData: {
        full_name: string;
        tagline: string | null;
        website: string | null;
        role: string;
        instagram: string;
        image_url?: string;
        performance_details?: string;
        setup_requirements?: string;
        social_links: Record<string, string>;
        updated_at: string;
      } = {
        full_name: name,
        tagline: tagline || null,
        website: website || null,
        role,
        instagram,
        social_links: { instagram },
        updated_at: new Date().toISOString(),
      };

      if (profile_image_url) {
        updateData.image_url = profile_image_url;
      }

      if (performance_details) {
        updateData.performance_details = performance_details;
      }

      if (setup_requirements) {
        updateData.setup_requirements = setup_requirements;
      }

      const { error: updateError } = await supabase
        .from('anonymous_participants')
        .update(updateData)
        .eq('id', existingAnonymousParticipant.id);

      if (updateError) {
        console.error('Error updating anonymous participant:', updateError);
        return res.status(500).json({ error: 'Failed to update participant information' });
      }
    } else {
      // Create new anonymous participant
      const insertData: {
        event_id: string;
        email: string;
        full_name: string;
        tagline: string | null;
        website: string | null;
        instagram: string;
        role: string;
        image_url?: string;
        performance_details?: string;
        setup_requirements?: string;
        social_links: Record<string, string>;
      } = {
        event_id: eventIdString,
        email,
        full_name: name,
        tagline: tagline || null,
        website: website || null,
        instagram,
        role,
        social_links: { instagram },
      };

      if (profile_image_url) {
        insertData.image_url = profile_image_url;
      }

      if (performance_details) {
        insertData.performance_details = performance_details;
      }

      if (setup_requirements) {
        insertData.setup_requirements = setup_requirements;
      }

      const { error: createError } = await supabase
        .from('anonymous_participants')
        .insert(insertData);

      if (createError) {
        console.error('Error creating anonymous participant:', createError);
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