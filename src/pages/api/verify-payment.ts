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
    const { raffleId, sessionId } = req.body;

    // Get the current user from the request
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId as string);
    
    if (stripeSession.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Get the number of tickets to create from metadata
    const quantity = parseInt(stripeSession.metadata?.quantity || '0');
    if (quantity <= 0) {
      return res.status(400).json({ error: 'Invalid ticket quantity' });
    }

    // Get the current highest ticket number for this raffle
    const { data: lastTicket, error: lastTicketError } = await supabase
      .from('tickets')
      .select('ticket_number')
      .eq('raffle_id', raffleId)
      .order('ticket_number', { ascending: false })
      .limit(1)
      .single();

    if (lastTicketError && lastTicketError.code !== 'PGRST116') {
      throw lastTicketError;
    }

    const startNumber = lastTicket ? lastTicket.ticket_number + 1 : 1;

    // Create the tickets
    const tickets = Array.from({ length: quantity }, (_, i) => ({
      raffle_id: raffleId,
      user_id: user.id,
      ticket_number: startNumber + i,
      created_at: new Date().toISOString(),
    }));

    const { data: newTickets, error: insertError } = await supabase
      .from('tickets')
      .insert(tickets)
      .select('ticket_number');

    if (insertError) {
      throw insertError;
    }

    res.status(200).json({ tickets: newTickets });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Error verifying payment' });
  }
} 