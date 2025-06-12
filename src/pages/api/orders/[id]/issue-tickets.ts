import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedClient } from '@/lib/getAuthorizedClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { supabase, user } = await getAuthorizedClient(req);

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('ticket_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError) throw orderError;
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify the order belongs to the user
    if (order.user_id !== user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Verify the order is completed
    if (order.status !== 'completed') {
      return res.status(400).json({ error: 'Order is not completed' });
    }

    // Check if tickets have already been issued
    if (order.issued_tickets && order.issued_tickets.length > 0) {
      return res.status(400).json({ error: 'Tickets already issued' });
    }

    // Generate tickets
    const ticketIds: string[] = [];
    for (let i = 0; i < order.number_of_tickets; i++) {
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          status: 'active',
          raffle_id: order.raffle_id,
          artist_id: order.artist_id
        })
        .select()
        .single();

      if (ticketError) throw ticketError;
      ticketIds.push(ticket.id);
    }

    // Update order with issued tickets
    const { error: updateError } = await supabase
      .from('ticket_orders')
      .update({ issued_tickets: ticketIds })
      .eq('id', id);

    if (updateError) throw updateError;

    // Fetch the updated order with ticket details
    const { data: updatedOrder, error: fetchError } = await supabase
      .from('ticket_orders')
      .select(`
        *,
        tickets:tickets!issued_tickets(
          id,
          ticket_number,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    return res.status(200).json(updatedOrder);
  } catch (err) {
    console.error('Error issuing tickets:', err);
    return res.status(500).json({ 
      error: err instanceof Error ? err.message : 'Failed to issue tickets'
    });
  }
} 