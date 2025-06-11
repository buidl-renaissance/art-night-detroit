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

    const { quantity, price, raffleId, artistId } = req.body;

    if (!quantity || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If raffleId is provided, verify the raffle exists and is active
    if (raffleId) {
      const { data: raffle, error: raffleError } = await supabase
        .from('raffles')
        .select('id, name, status')
        .eq('id', raffleId)
        .single();

      if (raffleError || !raffle) {
        return res.status(404).json({ error: 'Raffle not found' });
      }

      if (raffle.status !== 'active') {
        return res.status(400).json({ error: 'Raffle is not active' });
      }
    }

    // If artistId is provided, verify the artist exists
    if (artistId) {
      const { data: artist, error: artistError } = await supabase
        .from('artists')
        .select('id, name')
        .eq('id', artistId)
        .single();

      if (artistError || !artist) {
        return res.status(404).json({ error: 'Artist not found' });
      }
    }

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: raffleId ? 'Raffle Ticket' : 
                    artistId ? 'Artist Support Ticket' : 
                    'Art Night Detroit Ticket',
              description: raffleId ? 'Ticket for specific raffle' :
                          artistId ? 'Ticket to support specific artist' :
                          'General admission ticket for voting in artist raffles',
            },
            unit_amount: price * 100, // Convert to cents
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/tickets/checkout${raffleId ? `?raffle_id=${raffleId}` : ''}${artistId ? `?artist_id=${artistId}` : ''}`,
      metadata: {
        userId: session.user.id,
        quantity,
        raffleId: raffleId || '',
        artistId: artistId || '',
      },
    });

    return res.status(200).json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Error creating checkout session' });
  }
} 