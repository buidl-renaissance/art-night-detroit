import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { generateCanvasPickupEmail } from '../../../lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { artistIds } = req.body;

    if (!artistIds || !Array.isArray(artistIds) || artistIds.length === 0) {
      return res.status(400).json({ 
        error: 'Missing or invalid artistIds array' 
      });
    }

    // Fetch artist data from database
    const { data: artists, error: fetchError } = await supabase
      .from('artist_submissions')
      .select('id, name, artist_alias, email, preferred_canvas_size')
      .in('id', artistIds)
      .eq('status', 'approved');

    if (fetchError) {
      throw new Error(`Failed to fetch artists: ${fetchError.message}`);
    }

    if (!artists || artists.length === 0) {
      return res.status(404).json({ 
        error: 'No approved artists found with the provided IDs' 
      });
    }

    const emailResults = [];
    const errors = [];

    // Send emails to each artist
    for (const artist of artists) {
      try {
        // Generate the email content
        const artistData = {
          name: artist.name,
          artist_alias: artist.artist_alias || '',
          email: artist.email,
          preferred_canvas_size: artist.preferred_canvas_size || '18x18',
          isTest: false
        };

        const emailContent = generateCanvasPickupEmail(artistData);

        // Send the canvas pickup email using Resend
        const result = await resend.emails.send({
          from: 'Art Night Detroit <john@artnightdetroit.com>',
          to: artist.email,
          subject: '🎨 Your Canvas - Art Night Detroit',
          text: emailContent,
        });

        emailResults.push({
          artistId: artist.id,
          name: artist.name,
          email: artist.email,
          emailId: result.data?.id,
          success: true
        });

        // Update the artist's contacted status
        await supabase
          .from('artist_submissions')
          .update({ contacted: true })
          .eq('id', artist.id);

        console.log(`Canvas pickup email sent to ${artist.name} (${artist.email})`);

      } catch (artistError) {
        console.error(`Failed to send email to ${artist.name}:`, artistError);
        errors.push({
          artistId: artist.id,
          name: artist.name,
          email: artist.email,
          error: artistError instanceof Error ? artistError.message : 'Unknown error',
          success: false
        });
      }
    }

    const successCount = emailResults.length;
    const errorCount = errors.length;

    console.log(`Bulk canvas pickup emails completed: ${successCount} sent, ${errorCount} failed`);

    return res.status(200).json({ 
      success: true, 
      message: `Bulk canvas pickup emails completed: ${successCount} sent, ${errorCount} failed`,
      results: {
        successful: emailResults,
        failed: errors,
        totalProcessed: artists.length,
        successCount,
        errorCount
      }
    });

  } catch (error) {
    console.error('Error sending bulk canvas pickup emails:', error);
    return res.status(500).json({ 
      error: 'Failed to send bulk canvas pickup emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
