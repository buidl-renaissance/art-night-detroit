import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { sessionCode, participantData } = req.body;

  if (!sessionCode || !participantData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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

    // Check if participant already exists with this phone number
    const { data: existingParticipant } = await supabase
      .from('participants')
      .select('*')
      .eq('phone', participantData.phone)
      .single();

    let participant;
    if (existingParticipant) {
      // Use existing participant
      participant = existingParticipant;
    } else {
      // Create new participant
      const { data: newParticipant, error: participantError } = await supabase
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
      participant = newParticipant;
    }

    // Get the highest ticket number for this raffle
    const { data: lastTicket, error: lastTicketError } = await supabase
      .from('tickets')
      .select('ticket_number')
      .eq('raffle_id', id)
      .order('ticket_number', { ascending: false })
      .limit(1)
      .single();

    if (lastTicketError && lastTicketError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return res.status(500).json({ error: 'Failed to get last ticket number' });
    }

    const startNumber = lastTicket ? lastTicket.ticket_number + 1 : 1;

    // Generate new tickets for this claim
    const ticketsToCreate = [];
    for (let i = 0; i < session.ticket_count; i++) {
      ticketsToCreate.push({
        raffle_id: id,
        participant_id: participant.id,
        ticket_number: startNumber + i,
        purchased_at: new Date().toISOString()
      });
    }

    console.log('Creating tickets:', ticketsToCreate);

    // Create the tickets
    const { data: createdTickets, error: ticketsError } = await supabase
      .from('tickets')
      .insert(ticketsToCreate)
      .select('id');

    if (ticketsError) {
      console.error('Ticket creation error:', ticketsError);
      console.error('Tickets to create:', ticketsToCreate);
      return res.status(500).json({ 
        error: 'Failed to create tickets',
        details: ticketsError.message 
      });
    }

    // No need to create ticket_claims since tickets are now directly linked to participants

    // Deactivate the session
    await supabase
      .from('qr_code_sessions')
      .update({ is_active: false })
      .eq('session_code', sessionCode);

    return res.status(200).json({
      success: true,
      message: `Successfully claimed ${session.ticket_count} ticket(s)`,
      participant: participant,
      ticketsClaimed: createdTickets.length
    });
  } catch (error) {
    console.error('Error claiming tickets:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 