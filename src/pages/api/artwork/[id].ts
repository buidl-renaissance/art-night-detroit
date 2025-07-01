import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedClient } from '@/lib/getAuthorizedClient';
import { ArtworkClient } from '@/data/artwork';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { supabase, user } = await getAuthorizedClient(req);
    const artworkClient = new ArtworkClient(supabase);
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Artwork ID is required' });
    }

    switch (req.method) {
      case 'GET':
        const artwork = await artworkClient.getArtworkById(id);
        if (!artwork) {
          return res.status(404).json({ error: 'Artwork not found' });
        }

        // Check permissions
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (!profile?.is_admin && artwork.artist_id !== user.id) {
          return res.status(403).json({ error: 'Access denied' });
        }

        return res.status(200).json(artwork);

      case 'PUT':
        // Check permissions
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (!userProfile?.is_admin) {
          // For artists, verify they own the artwork
          const existingArtwork = await artworkClient.getArtworkById(id);
          if (!existingArtwork) {
            return res.status(404).json({ error: 'Artwork not found' });
          }

          const { data: artist } = await supabase
            .from('artists')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (!artist || existingArtwork.artist_id !== artist.id) {
            return res.status(403).json({ error: 'Can only update your own artwork' });
          }
        }

        const updatedArtwork = await artworkClient.updateArtwork(id, req.body);
        return res.status(200).json(updatedArtwork);

      case 'DELETE':
        // Check permissions
        const { data: deleteProfile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (!deleteProfile?.is_admin) {
          // For artists, verify they own the artwork
          const existingArtwork = await artworkClient.getArtworkById(id);
          if (!existingArtwork) {
            return res.status(404).json({ error: 'Artwork not found' });
          }

          const { data: artist } = await supabase
            .from('artists')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (!artist || existingArtwork.artist_id !== artist.id) {
            return res.status(403).json({ error: 'Can only delete your own artwork' });
          }
        }

        await artworkClient.deleteArtwork(id);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Artwork API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 