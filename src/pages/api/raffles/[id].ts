import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedClient } from '@/lib/getAuthorizedClient';
import { createClient } from '@supabase/supabase-js';

interface ArtistData {
  id: string;
  artists: {
    id: string;
    name: string;
    bio: string;
    image_url: string;
  };
}

interface UnusedTicket {
  id: string;
  ticket_number: number;
  created_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // Create a public client for anonymous access
    const publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch raffle details
    const { data: raffleData, error: raffleError } = await publicClient
      .from('raffles')
      .select('*')
      .eq('id', id)
      .single();

    if (raffleError) throw raffleError;

    // Fetch artists with their total ticket counts
    const { data: artistsData, error: artistsError } = await publicClient
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
    const { data: ticketTotals, error: totalsError } = await publicClient
      .rpc('get_artist_ticket_totals', {
        raffle_id_param: id
      });

    if (totalsError) throw totalsError;

    // Create maps of artist_id to ticket counts
    const ticketTotalsMap = (ticketTotals || []).reduce((acc: Record<string, number>, curr: { artist_id: string; total_tickets: number }) => ({
      ...acc,
      [curr.artist_id]: curr.total_tickets
    }), {} as Record<string, number>);

    // Get user's submitted tickets if authenticated
    let userTicketsMap: Record<string, number> = {};
    try {
      const { supabase, user } = await getAuthorizedClient(req);
      if (user) {
        const { data: userTickets, error: userTicketsError } = await supabase
          .rpc('get_user_artist_tickets', {
            raffle_id_param: id,
            user_id_param: user.id
          });

        if (!userTicketsError) {
          userTicketsMap = (userTickets || []).reduce((acc: Record<string, number>, curr: { artist_id: string; user_tickets: number }) => ({
            ...acc,
            [curr.artist_id]: curr.user_tickets
          }), {} as Record<string, number>);
        }
      }
    } catch {
      // Ignore auth errors - user is anonymous
    }

    // Combine artist data with ticket totals
    const artistsWithTickets = (artistsData as unknown as ArtistData[]).map(artist => ({
      id: artist.artists.id,
      name: artist.artists.name,
      bio: artist.artists.bio,
      image_url: artist.artists.image_url,
      raffle_artist_id: artist.id,
      total_tickets: ticketTotalsMap[artist.artists.id] || 0,
      user_tickets: userTicketsMap[artist.artists.id] || 0
    }));

    // If there's an auth token, get user-specific data
    let unusedTickets: UnusedTicket[] = [];
    try {
      const { supabase, user } = await getAuthorizedClient(req);
      if (user) {
        const { data: unusedTicketsData, error: unusedTicketsError } = await supabase
          .from('tickets')
          .select('id, ticket_number, created_at')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (!unusedTicketsError) {
          unusedTickets = unusedTicketsData || [];
        }
      }
    } catch {
      // Ignore auth errors - user is anonymous
    }

    return res.status(200).json({
      raffle: raffleData,
      artists: artistsWithTickets,
      unusedTickets
    });

  } catch (err) {
    console.error('Error fetching raffle data:', err);
    return res.status(500).json({ 
      error: err instanceof Error ? err.message : 'Failed to load raffle data'
    });
  }
}