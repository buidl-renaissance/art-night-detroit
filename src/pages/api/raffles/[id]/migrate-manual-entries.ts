import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ManualEntry {
  ticket_number: number;
  name: string;
  email: string;
  artist: string;
  payment: string;
}

interface RaffleArtistData {
  id: string;
  artists: {
    id: string;
    name: string;
  };
}





export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id: raffleId } = req.query;
    const { entries } = req.body as { entries: ManualEntry[] };

    if (!raffleId || !entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Verify the raffle exists
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', raffleId)
      .single();

    if (raffleError || !raffle) {
      return res.status(404).json({ error: 'Raffle not found' });
    }

    // Get all artists for this raffle
    const { data: raffleArtists, error: raffleArtistsError } = await supabase
      .from('raffle_artists')
      .select(`
        id,
        artists (
          id,
          name
        )
      `)
      .eq('raffle_id', raffleId);

    if (raffleArtistsError) {
      return res.status(500).json({ error: 'Error fetching raffle artists' });
    }
    

    // Create a map of artist names to their IDs
    const artistMap = new Map<string, string>();
    (raffleArtists as unknown as RaffleArtistData[])?.forEach((ra: RaffleArtistData) => {
      if (ra.artists) {
        artistMap.set(ra.artists.name.toLowerCase(), ra.artists.id);
        // Add common name variations
        if (ra.artists.name.toLowerCase().includes('escada')) {
          artistMap.set('escada', ra.artists.id);
          artistMap.set('escada gordon', ra.artists.id);
        }
        if (ra.artists.name.toLowerCase().includes('daniel')) {
          artistMap.set('daniel', ra.artists.id);
          artistMap.set('danny', ra.artists.id);
          artistMap.set('daniel geanes', ra.artists.id);
        }
        if (ra.artists.name.toLowerCase().includes('molly')) {
          artistMap.set('molly', ra.artists.id);
          artistMap.set('molly anna', ra.artists.id);
        }
      }
    });

    console.log('artistMap', artistMap);
    console.log('raffleArtists raw data:', JSON.stringify(raffleArtists, null, 2));

    const results = [];

    for (const entry of entries) {
      try {
        // Find or create participant
        let participant;
        const { data: existingParticipant } = await supabase
          .from('participants')
          .select('*')
          .eq('email', entry.email)
          .single();

        if (existingParticipant) {
          participant = existingParticipant;
        } else {
          // Create new participant
          const { data: newParticipant, error: participantError } = await supabase
            .from('participants')
            .insert({
              name: entry.name,
              email: entry.email,
              phone: '000-000-0000', // Placeholder since we don't have phone numbers
              instagram: null
            })
            .select()
            .single();

          if (participantError) {
            throw new Error(`Failed to create participant: ${participantError.message}`);
          }
          participant = newParticipant;
        }

        // Find artist ID
        console.log(`Looking for artist: "${entry.artist}" (lowercase: "${entry.artist.toLowerCase()}")`);
        console.log('Available artists in map:', Array.from(artistMap.keys()));
        const artistId = artistMap.get(entry.artist.toLowerCase());
        if (!artistId) {
          throw new Error(`Artist "${entry.artist}" not found in raffle. Available artists: ${Array.from(artistMap.keys()).join(', ')}`);
        }
        console.log(`Found artist ID: ${artistId} for artist: ${entry.artist}`);

        // Create ticket with artist_id directly
        const { data: ticket, error: ticketError } = await supabase
          .from('tickets')
          .insert({
            raffle_id: raffleId,
            participant_id: participant.id,
            artist_id: artistId,
            ticket_number: entry.ticket_number,
            status: 'active',
            purchased_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (ticketError) {
          throw new Error(`Failed to create ticket: ${ticketError.message}`);
        }

        console.log(`Successfully created ticket ${ticket.id} with artist_id ${artistId}`);

        results.push({
          success: true,
          entry: entry,
          ticket_number: entry.ticket_number,
          participant_id: participant.id,
          ticket_id: ticket.id
        });
      } catch (error) {
        results.push({
          success: false,
          entry: entry,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${entries.length} entries`,
      results: results,
      summary: {
        total: entries.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    console.error('Error migrating manual entries:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
