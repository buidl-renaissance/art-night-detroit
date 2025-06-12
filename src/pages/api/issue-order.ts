import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedClient } from '@/lib/getAuthorizedClient';
import { issueTickets } from '@/lib/tickets';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const { supabase, user } = await getAuthorizedClient(req);

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('ticket_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify the order belongs to the user
    if (order.user_id !== user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // If tickets have already been issued, return the order with tickets
    if (order.issued_tickets && order.issued_tickets.length > 0) {
      const { data: updatedOrder, error: fetchError } = await supabase
        .from('ticket_orders')
        .select(`
          *,
          raffle:raffle_id(id, name),
          artist:artist_id(id, name)
        `)
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;

      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, ticket_number, created_at')
        .in('id', order.issued_tickets);

      if (ticketsError) throw ticketsError;

      return res.status(200).json({
        ...updatedOrder,
        raffle: updatedOrder.raffle?.[0] || null,
        artist: updatedOrder.artist?.[0] || null,
        tickets
      });
    }

    // Verify payment with Stripe
    if (!order.stripe_checkout_session_id) {
      return res.status(400).json({ error: 'No Stripe session found for this order' });
    }

    const session = await stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment has not been completed' });
    }

    // Issue tickets using the library function
    const tickets = await issueTickets(
      supabase,
      user,
      order.raffle_id,
      order.artist_id,
      order.number_of_tickets
    );

    // Update order with issued tickets
    const ticketIds = tickets.map(ticket => ticket.id);
    const { error: updateError } = await supabase
      .from('ticket_orders')
      .update({ 
        issued_tickets: ticketIds,
        status: 'completed'
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // Fetch the updated order with details
    const { data: updatedOrder, error: fetchError } = await supabase
      .from('ticket_orders')
      .select(`
        *,
        raffle:raffle_id(id, name),
        artist:artist_id(id, name)
      `)
      .eq('id', orderId)
      .single();

    if (fetchError) throw fetchError;

    return res.status(200).json({
      ...updatedOrder,
      raffle: updatedOrder.raffle?.[0] || null,
      artist: updatedOrder.artist?.[0] || null,
      tickets
    });
  } catch (err) {
    console.error('Error issuing tickets:', err);
    return res.status(500).json({ 
      error: err instanceof Error ? err.message : 'Failed to issue tickets'
    });
  }
} 