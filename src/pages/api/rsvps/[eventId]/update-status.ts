import { NextApiRequest, NextApiResponse } from 'next';
import { updateRSVPStatus } from '@/data/rsvp';
import { getAuthorizedClient } from '@/lib/getAuthorizedClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventId } = req.query;
    const { rsvpId, status } = req.body;

    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    if (!rsvpId || typeof rsvpId !== 'string') {
      return res.status(400).json({ error: 'RSVP ID is required' });
    }

    if (!status || !['confirmed', 'waitlisted', 'rejected', 'canceled'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required: confirmed, waitlisted, rejected, or canceled' });
    }

    // Get authorized client with admin privileges
    const { supabase, user } = await getAuthorizedClient(req);

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Update the RSVP status using the server-side client
    const data = await updateRSVPStatus(rsvpId, status, supabase);

    if (!data) {
      return res.status(404).json({ error: 'RSVP not found' });
    }

    return res.status(200).json({ 
      success: true, 
      rsvp: data,
      message: `RSVP status updated to ${status}`
    });

  } catch (error) {
    console.error('Update RSVP status API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 