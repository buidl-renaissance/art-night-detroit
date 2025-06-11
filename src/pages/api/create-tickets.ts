import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the authorization token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.split(' ')[1];
    
    // Get the user from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
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
    if (checkoutSession.metadata?.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const quantity = parseInt(checkoutSession.metadata?.quantity || '0');
    const raffleId = checkoutSession.metadata?.raffleId;
    const artistId = checkoutSession.metadata?.artistId;

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    // Get the last ticket number
    const { data: lastTicket, error: lastTicketError } = await supabase
      .from('tickets')
      .select('ticket_number')
      .order('ticket_number', { ascending: false })
      .limit(1)
      .single();

    if (lastTicketError && lastTicketError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw lastTicketError;
    }

    // Start from 1 if no tickets exist, otherwise increment from last ticket number
    const startTicketNumber = lastTicket ? lastTicket.ticket_number + 1 : 1;

    // Create tickets with sequential ticket numbers
    const tickets = Array.from({ length: quantity }, (_, index) => ({
      user_id: user.id,
      ticket_number: startTicketNumber + index,
      created_at: new Date().toISOString(),
    }));

    const { error: ticketError, data: createdTickets } = await supabase
      .from('tickets')
      .insert(tickets)
      .select('ticket_number');

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
        user_id: user.id,
        created_at: new Date().toISOString(),
      }));

      const { error: voteError } = await supabase
        .from('ticket_votes')
        .insert(ticketVotes);

      if (voteError) {
        throw voteError;
      }
    }

    return res.status(200).json({ 
      ticketCount: quantity,
      tickets: createdTickets 
    });
  } catch (error) {
    console.error('Error creating tickets:', error);
    return res.status(500).json({ error: 'Error creating tickets' });
  }
} 