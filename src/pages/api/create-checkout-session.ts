import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedClient } from '@/lib/getAuthorizedClient';
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
    const { supabase, user, error: userError } = await getAuthorizedClient(req);

    if (userError || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { quantity, price, raffleId, artistId } = req.body;

    if (!quantity || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let raffleDetails = null;
    let artistDetails = null;

    // If raffleId is provided, verify the raffle exists and is active
    if (raffleId) {
      const { data: raffle, error: raffleError } = await supabase
        .from('raffles')
        .select('id, name, description, status')
        .eq('id', raffleId)
        .single();

      if (raffleError || !raffle) {
        return res.status(404).json({ error: 'Raffle not found' });
      }

      if (raffle.status !== 'active') {
        return res.status(400).json({ error: 'Raffle is not active' });
      }

      raffleDetails = raffle;
    }

    // If artistId is provided, verify the artist exists and get details
    if (artistId) {
      const { data: artist, error: artistError } = await supabase
        .from('artists')
        .select('id, name, bio')
        .eq('id', artistId)
        .single();

      if (artistError || !artist) {
        return res.status(404).json({ error: 'Artist not found' });
      }

      artistDetails = artist;
    }

    console.log('create-checkout-session order:', {
      user_id: user.id,
        number_of_tickets: quantity,
        status: 'pending',
        raffle_id: raffleId || null,
        artist_id: artistId || null
    })

    // Create ticket order first
    const { data: order, error: orderError } = await supabase
      .from('ticket_orders')
      .insert({
        user_id: user.id,
        number_of_tickets: quantity,
        status: 'pending',
        raffle_id: raffleId || null,
        artist_id: artistId || null
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating ticket order:', orderError);
      return res.status(500).json({ error: 'Error creating ticket order' });
    }

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              metadata: {
                raffle_id: raffleId ?? null,
                artist_id: artistId ?? null,
                order_id: order.id
              },
              name: raffleDetails ? `${raffleDetails.name} Raffle Ticket` : 
                    artistDetails ? `Support ${artistDetails.name}` : 
                    'Art Night Detroit Ticket',
              description: raffleDetails ? 
                          `Ticket for ${raffleDetails.name} raffle. ${raffleDetails.description}` :
                          artistDetails ? 
                          `Support ${artistDetails.name} in their artistic journey. ${artistDetails.bio}` :
                          'Art raffle ticket for voting in artist raffles',
            },
            unit_amount: price * 100, // Convert to cents
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/tickets/success?order_id=${order.id}`,
      cancel_url: `${req.headers.origin}/tickets/checkout${raffleId ? `?raffle_id=${raffleId}` : ''}${artistId ? `&artist_id=${artistId}` : ''}`,
      metadata: {
        userId: user.id,
        orderId: order.id,
        quantity,
        raffleId: raffleId || '',
        artistId: artistId || '',
        raffleName: raffleDetails?.name || '',
        artistName: artistDetails?.name || '',
      },
    });

    // Update order with stripe session id
    const { error: updateError } = await supabase
      .from('ticket_orders')
      .update({ stripe_checkout_session_id: checkoutSession.id })
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order with session ID:', updateError);
      // Continue anyway since the order exists and session is created
    }

    return res.status(200).json({ 
      sessionId: checkoutSession.id,
      orderId: order.id 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Error creating checkout session' });
  }
} 