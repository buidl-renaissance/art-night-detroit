import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedClient } from '@/lib/getAuthorizedClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { supabase, user, error } = await getAuthorizedClient(req);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { artistId, ticketIds } = req.body;

    if (!artistId || !ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Verify the raffle exists and is active
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', req.query.id)
      .single();

    if (raffleError || !raffle) {
      return res.status(404).json({ error: 'Raffle not found' });
    }

    if (raffle.status !== 'active') {
      return res.status(400).json({ error: 'Raffle is not active' });
    }

    // Verify the artist is in the raffle
    const { data: artistRaffle, error: artistError } = await supabase
      .from('raffle_artists')
      .select('*')
      .eq('raffle_id', req.query.id)
      .eq('artist_id', artistId)
      .single();

    if (artistError || !artistRaffle) {
      return res.status(404).json({ error: 'Artist not found in raffle' });
    }

    // Verify all tickets belong to the user and are unused
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .in('id', ticketIds)
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (ticketsError) {
      return res.status(500).json({ error: 'Error verifying tickets' });
    }

    if (!tickets || tickets.length !== ticketIds.length) {
      return res.status(400).json({ error: 'Invalid tickets' });
    }

    // Update tickets with raffle and artist info
    const { error: updateError } = await supabase
      .from('tickets')
      .update({
        raffle_id: req.query.id,
        artist_id: artistId,
        status: 'used'
      })
      .in('id', ticketIds);

    if (updateError) {
      return res.status(500).json({ error: 'Error updating tickets' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error submitting tickets:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 