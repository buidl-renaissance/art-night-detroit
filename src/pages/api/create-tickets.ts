import { NextApiRequest, NextApiResponse } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the current session
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing session ID' });
    }

    // Retrieve the checkout session
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!checkoutSession) {
      return res.status(404).json({ error: 'Checkout session not found' });
    }

    if (checkoutSession.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Verify the session belongs to the current user
    if (checkoutSession.metadata?.userId !== session.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const quantity = parseInt(checkoutSession.metadata?.quantity || '0');
    const raffleId = checkoutSession.metadata?.raffleId;
    const artistId = checkoutSession.metadata?.artistId;

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    // Create tickets
    const tickets = Array.from({ length: quantity }, () => ({
      user_id: session.user.id,
      created_at: new Date().toISOString(),
    }));

    const { error: ticketError } = await supabase
      .from('tickets')
      .insert(tickets)
      .select();

    if (ticketError) {
      throw ticketError;
    }

    // If raffleId and artistId are provided, create ticket votes
    if (raffleId && artistId) {
      // Verify the artist is in the raffle
      const { data: raffleArtist, error: raffleArtistError } = await supabase
        .from('raffle_artists')
        .select('id')
        .eq('raffle_id', raffleId)
        .eq('artist_id', artistId)
        .single();

      if (raffleArtistError || !raffleArtist) {
        return res.status(400).json({ error: 'Artist is not in this raffle' });
      }

      // Create ticket votes
      const ticketVotes = Array.from({ length: quantity }, () => ({
        raffle_id: raffleId,
        artist_id: artistId,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
      }));

      const { error: voteError } = await supabase
        .from('ticket_votes')
        .insert(ticketVotes);

      if (voteError) {
        throw voteError;
      }
    }

    return res.status(200).json({ ticketCount: quantity });
  } catch (error) {
    console.error('Error creating tickets:', error);
    return res.status(500).json({ error: 'Error creating tickets' });
  }
} 