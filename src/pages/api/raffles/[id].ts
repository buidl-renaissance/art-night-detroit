import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedClient } from '@/lib/getAuthorizedClient';

interface ArtistData {
  id: string;
  artists: {
    id: string;
    name: string;
    bio: string;
    image_url: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const { supabase, user } = await getAuthorizedClient(req);

    // Fetch raffle details
    const { data: raffleData, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', id)
      .single();

    if (raffleError) throw raffleError;

    // Fetch artists with their total ticket counts
    const { data: artistsData, error: artistsError } = await supabase
      .from('raffle_artists')
      .select(`
        id,
        artists (
          id,
          name,
          bio,
          image_url
        )
      `)
      .eq('raffle_id', id);

    if (artistsError) throw artistsError;

    // Get ticket totals from the function
    const { data: ticketTotals, error: totalsError } = await supabase
      .rpc('get_artist_ticket_totals', {
        raffle_id_param: id
      });

    if (totalsError) throw totalsError;

    // Get user's ticket totals
    const { data: userTicketTotals, error: userTotalsError } = await supabase
      .rpc('get_user_artist_tickets', {
        raffle_id_param: id,
        user_id_param: user?.id
      });

    if (userTotalsError) throw userTotalsError;

    // Create maps of artist_id to ticket counts
    const ticketTotalsMap = (ticketTotals || []).reduce((acc: Record<string, number>, curr: { artist_id: string; total_tickets: number }) => ({
      ...acc,
      [curr.artist_id]: curr.total_tickets
    }), {} as Record<string, number>);

    const userTicketTotalsMap = (userTicketTotals || []).reduce((acc: Record<string, number>, curr: { artist_id: string; user_tickets: number }) => ({
      ...acc,
      [curr.artist_id]: curr.user_tickets
    }), {} as Record<string, number>);

    // Combine artist data with ticket totals
    const artistsWithTickets = (artistsData as unknown as ArtistData[]).map(artist => ({
      id: artist.artists.id,
      name: artist.artists.name,
      bio: artist.artists.bio,
      image_url: artist.artists.image_url,
      raffle_artist_id: artist.id,
      total_tickets: ticketTotalsMap[artist.artists.id] || 0,
      user_tickets: userTicketTotalsMap[artist.artists.id] || 0
    }));

    // Fetch unused tickets for the current user
    const { data: unusedTicketsData, error: unusedTicketsError } = await supabase
      .from('tickets')
      .select('id, ticket_number, created_at')
      .eq('user_id', user?.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (unusedTicketsError) throw unusedTicketsError;

    return res.status(200).json({
      raffle: raffleData,
      artists: artistsWithTickets,
      unusedTickets: unusedTicketsData || []
    });

  } catch (err) {
    console.error('Error fetching raffle data:', err);
    return res.status(500).json({ 
      error: err instanceof Error ? err.message : 'Failed to load raffle data'
    });
  }
}