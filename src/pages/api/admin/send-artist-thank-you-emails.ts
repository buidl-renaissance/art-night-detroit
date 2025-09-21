import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { generateArtistThankYouEmail } from '@/lib/emailTemplates';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Create a service role client for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ArtistData {
  id: string;
  name: string;
  artist_alias?: string;
  email: string;
  preferred_canvas_size?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all accepted artists from the database
    const { data: acceptedArtists, error: fetchError } = await supabase
      .from('artist_submissions')
      .select('id, name, artist_alias, email, preferred_canvas_size')
      .eq('status', 'accepted');

    if (fetchError) {
      console.error('Error fetching accepted artists:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch accepted artists', details: fetchError.message });
    }

    if (!acceptedArtists || acceptedArtists.length === 0) {
      return res.status(404).json({ error: 'No accepted artists found' });
    }

    // List of emails that were already sent (from your report)
    const alreadySentEmails = [
      'preshyart@gmail.com',
      'becauseartmattersllc@yahoo.com',
      'thepsycholeopard@gmail.com',
      'mariahnkohmitchell@gmail.com',
      'patrick.simo@hotmail.com',
      'queenmika8@gmail.com',
      'eyeneyellc@gmail.com',
      'AidelFinman@gmail.com',
      'aidelFinman@gmail.com',
      'nayetayeeveryday@gmail.com',
      'Naeemeshareef@gmail.com',
      'naeemeshareef@gmail.com',
      'wordenashely@gmail.com',
      'sakara93@gmail.com',
    ];

    // Filter out artists who already received emails
    const artistsToEmail = acceptedArtists.filter(artist => 
      !alreadySentEmails.includes(artist.email.toLowerCase())
    );

    console.log(`Found ${acceptedArtists.length} accepted artists total`);
    console.log(`${alreadySentEmails.length} emails already sent`);
    console.log(`${artistsToEmail.length} artists remaining to email`);

    if (artistsToEmail.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All accepted artists have already received thank you emails',
        emailCount: acceptedArtists.length,
        alreadySentCount: alreadySentEmails.length,
        remainingCount: 0,
        emails: []
      });
    }

    // Send emails individually for each remaining artist
    const emailResults = [];
    const subject = 'Thank You for Participating in Art Night Detroit x Murals in the Market';
    
    for (let i = 0; i < artistsToEmail.length; i++) {
      const artist = artistsToEmail[i];
      
      try {
        const artistData: ArtistData = {
          id: artist.id,
          name: artist.name,
          artist_alias: artist.artist_alias,
          email: artist.email,
          preferred_canvas_size: artist.preferred_canvas_size
        };

        const emailContent = generateArtistThankYouEmail(artistData);
        
        // Convert to HTML (simple conversion)
        const htmlBody = emailContent
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>')
          .replace(/^/, '<p>')
          .replace(/$/, '</p>');

        console.log(`Sending thank you email to: ${artist.email} (${i + 1}/${artistsToEmail.length})`);

        // Send the email using Resend
        const result = await resend.emails.send({
          from: 'Art Night Detroit <john@artnightdetroit.com>',
          to: artist.email,
          subject: subject,
          html: htmlBody,
          text: emailContent
        });

        emailResults.push({
          artistId: artist.id,
          artistName: artist.artist_alias || artist.name,
          email: artist.email,
          status: 'sent',
          result: result
        });

        console.log(`Successfully sent email to ${artist.email}`);

        // Add delay between emails to avoid rate limiting (except for the last email)
        if (i < artistsToEmail.length - 1) {
          console.log(`Waiting 2 seconds before sending next email...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (emailError) {
        console.error(`Error sending email to ${artist.email}:`, emailError);
        emailResults.push({
          artistId: artist.id,
          artistName: artist.artist_alias || artist.name,
          email: artist.email,
          status: 'failed',
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        });
        
        // Still add delay even on failure to avoid overwhelming the API
        if (i < artistsToEmail.length - 1) {
          console.log(`Waiting 2 seconds before sending next email...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    const successfulEmails = emailResults.filter(result => result.status === 'sent');
    const failedEmails = emailResults.filter(result => result.status === 'failed');

    return res.status(200).json({
      success: true,
      message: `Thank you emails processed: ${successfulEmails.length} sent, ${failedEmails.length} failed (${alreadySentEmails.length} already sent previously)`,
      emailCount: acceptedArtists.length,
      alreadySentCount: alreadySentEmails.length,
      successfulCount: successfulEmails.length,
      failedCount: failedEmails.length,
      emails: emailResults
    });

  } catch (error) {
    console.error('Error sending artist thank you emails:', error);
    return res.status(500).json({ 
      error: 'Failed to send artist thank you emails', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
