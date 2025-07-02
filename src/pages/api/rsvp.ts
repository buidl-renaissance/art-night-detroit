import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { CreateRSVPData } from '@/types/rsvp';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event_id, handle, name, email, phone }: CreateRSVPData = req.body;

    // Validate required fields
    if (!event_id || !handle || !name || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields: event_id, handle, name, and email are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user has already RSVP'd for this event
    const { data: existingRSVP, error: checkError } = await supabase
      .from('rsvps')
      .select('id')
      .eq('event_id', event_id)
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Error checking existing RSVP' });
    }

    if (existingRSVP) {
      return res.status(409).json({ error: 'You have already RSVP\'d for this event' });
    }

    // Insert the RSVP
    const { data: rsvp, error: insertError } = await supabase
      .from('rsvps')
      .insert({
        event_id,
        handle,
        name,
        email,
        phone: phone || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting RSVP:', insertError);
      return res.status(500).json({ error: 'Failed to submit RSVP' });
    }

    return res.status(201).json({ 
      success: true, 
      message: 'RSVP submitted successfully',
      rsvp 
    });

  } catch (error) {
    console.error('RSVP API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 