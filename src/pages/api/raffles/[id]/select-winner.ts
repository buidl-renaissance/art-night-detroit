import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id: raffleId } = req.query;
    const { artistId, action } = req.body;

    if (!raffleId || !artistId) {
      return res.status(400).json({ error: 'Missing raffleId or artistId' });
    }

    const supabase = createPagesServerClient({ req, res });
    
    // Check if user is admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('auth_user_id', session.user.id)
      .single();

    if (!profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (action === 'select') {
      // Get all tickets for this artist in this raffle
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, ticket_number, participant_id, participants(name, email)')
        .eq('raffle_id', raffleId)
        .eq('artist_id', artistId);

      if (ticketsError) {
        console.error('Error fetching tickets:', ticketsError);
        return res.status(500).json({ error: 'Failed to fetch tickets' });
      }

      if (!tickets || tickets.length === 0) {
        return res.status(404).json({ error: 'No tickets found for this artist' });
      }

      // Randomly select a winner
      const randomIndex = Math.floor(Math.random() * tickets.length);
      const winningTicket = tickets[randomIndex];

      // Update the raffle_artists table with the winner
      const { error: updateError } = await supabase
        .from('raffle_artists')
        .update({
          winner_ticket_id: winningTicket.id,
          winner_selected_at: new Date().toISOString()
        })
        .eq('raffle_id', raffleId)
        .eq('artist_id', artistId);

      if (updateError) {
        console.error('Error updating winner:', updateError);
        return res.status(500).json({ error: 'Failed to update winner' });
      }

      // Format participant name to show first name and last initial only
      const formatName = (fullName: string | null) => {
        if (!fullName) return null;
        const nameParts = fullName.trim().split(' ');
        if (nameParts.length === 1) {
          return nameParts[0]; // Just first name if only one name
        }
        const firstName = nameParts[0];
        const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        return `${firstName} ${lastInitial}.`;
      };

      const participants = winningTicket.participants as { name: string; email: string }[];
      const participant = participants?.[0];
      const formattedName = participant?.name ? formatName(participant.name) : null;

      return res.status(200).json({
        success: true,
        winner: {
          ticketId: winningTicket.id,
          ticketNumber: winningTicket.ticket_number,
          participant: {
            ...participant,
            displayName: formattedName
          }
        }
      });

    } else {
      return res.status(400).json({ error: 'Invalid action. Only "select" is supported' });
    }

  } catch (error) {
    console.error('Winner selection error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
