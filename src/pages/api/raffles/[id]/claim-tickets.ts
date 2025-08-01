import { NextApiRequest, NextApiResponse } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { sessionCode, participantData } = req.body;

  if (!sessionCode || !participantData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const supabase = createServerComponentClient({ cookies });

  try {
    // Verify the session is active
    const { data: session, error: sessionError } = await supabase
      .from('qr_code_sessions')
      .select('*')
      .eq('session_code', sessionCode)
      .eq('is_active', true)
      .single();

    if (sessionError || !session) {
      return res.status(400).json({ error: 'Invalid or expired session' });
    }

    // Create participant
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert({
        name: participantData.name,
        phone: participantData.phone,
        email: participantData.email,
        instagram: participantData.instagram || null
      })
      .select()
      .single();

    if (participantError) {
      return res.status(500).json({ error: 'Failed to create participant' });
    }

    // Get available tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('id')
      .eq('raffle_id', id)
      .is('user_id', null)
      .limit(session.ticket_count);

    if (ticketsError) {
      return res.status(500).json({ error: 'Failed to fetch tickets' });
    }

    if (tickets.length < session.ticket_count) {
      return res.status(400).json({ error: 'Not enough tickets available' });
    }

    // Create ticket claims
    const claims = tickets.map(ticket => ({
      participant_id: participant.id,
      ticket_id: ticket.id
    }));

    const { error: claimsError } = await supabase
      .from('ticket_claims')
      .insert(claims);

    if (claimsError) {
      return res.status(500).json({ error: 'Failed to claim tickets' });
    }

    // Deactivate the session
    await supabase
      .from('qr_code_sessions')
      .update({ is_active: false })
      .eq('session_code', sessionCode);

    return res.status(200).json({
      success: true,
      message: `Successfully claimed ${session.ticket_count} ticket(s)`,
      participant: participant,
      ticketsClaimed: tickets.length
    });
  } catch (error) {
    console.error('Error claiming tickets:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 