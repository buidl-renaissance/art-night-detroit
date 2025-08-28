import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

interface WinnerData {
  artistName: string;
  ticketNumber: number;
  participantName?: string;
  selectedAt: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create a public client for anonymous access
    const publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch winners from the most recent active raffle
    const { data: winners, error: winnersError } = await publicClient
      .from('raffle_artists')
      .select(`
        winner_selected_at,
        artists!inner(name),
        tickets!winner_ticket_id(
          ticket_number,
          participants(name)
        ),
        raffles!inner(
          id,
          name,
          status
        )
      `)
      .not('winner_ticket_id', 'is', null)
      .eq('raffles.status', 'active')
      .order('winner_selected_at', { ascending: false });

    if (winnersError) {
      console.error('Error fetching winners:', winnersError);
      return res.status(500).json({ error: 'Failed to fetch winners' });
    }

    // Format the response
    const formattedWinners: WinnerData[] = (winners || []).map((winner: any) => {
      // Format participant name to show first name and last initial only
      const formatName = (fullName: string | null) => {
        if (!fullName) return undefined;
        const nameParts = fullName.trim().split(' ');
        if (nameParts.length === 1) {
          return nameParts[0]; // Just first name if only one name
        }
        const firstName = nameParts[0];
        const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        return `${firstName} ${lastInitial}.`;
      };

      const participant = winner.tickets?.participants?.[0];
      
      return {
        artistName: winner.artists?.name || 'Unknown Artist',
        ticketNumber: winner.tickets?.ticket_number || 0,
        participantName: participant?.name ? formatName(participant.name) : undefined,
        selectedAt: winner.winner_selected_at
      };
    });

    return res.status(200).json({ winners: formattedWinners });

  } catch (err) {
    console.error('Error fetching winners:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
