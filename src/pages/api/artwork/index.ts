import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedClient } from '@/lib/getAuthorizedClient';
import { ArtworkClient } from '@/data/artwork';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { supabase, user } = await getAuthorizedClient(req);
    const artworkClient = new ArtworkClient(supabase);

    switch (req.method) {
      case 'GET':
        // Check if user is admin or artist
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (profile?.is_admin) {
          // Admin can see all artwork
          const artwork = await artworkClient.getAllArtwork();
          return res.status(200).json(artwork);
        } else {
          // Artist can only see their own artwork
          const { data: artist } = await supabase
            .from('artists')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (!artist) {
            return res.status(403).json({ error: 'Artist profile not found' });
          }

          const artwork = await artworkClient.getArtworkByArtist(artist.id);
          return res.status(200).json(artwork);
        }

      case 'POST':
        // Check if user is admin or artist
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (!userProfile?.is_admin) {
          // For artists, verify they own the artist profile
          const { data: artist } = await supabase
            .from('artists')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (!artist) {
            return res.status(403).json({ error: 'Artist profile not found' });
          }

          // Ensure the artwork is being created for their own artist profile
          if (req.body.artist_id !== artist.id) {
            return res.status(403).json({ error: 'Can only create artwork for your own artist profile' });
          }
        }

        const newArtwork = await artworkClient.createArtwork(req.body);
        return res.status(201).json(newArtwork);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Artwork API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 