import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { generateArtistRejectionEmail } from '../../../../lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { submissionId, artistData } = req.body;

  if (!submissionId) {
    return res.status(400).json({ error: 'Submission ID is required' });
  }

  if (!artistData || !artistData.email) {
    return res.status(400).json({ error: 'Artist email is required' });
  }

  try {
    const emailContent = generateArtistRejectionEmail(artistData);

    const result = await resend.emails.send({
      from: 'Art Night Detroit <john@artnightdetroit.com>',
      to: artistData.email,
      subject: 'Thank You for Your Artist Application - Art Night Detroit',
      text: emailContent,
    });

    console.log('Rejection email sent successfully:', result);

    // Update the contacted field to true after successful email
    if (result?.data?.id) {
      try {
        await supabase
          .from('artist_submissions')
          .update({ contacted: true })
          .eq('id', submissionId);

        console.log('Contacted field updated successfully for submission:', submissionId);
      } catch (dbError) {
        console.error('Error updating contacted field:', dbError);
        // Don't fail the email response if database update fails
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Rejection email sent successfully',
      emailId: result.data?.id
    });

  } catch (error) {
    console.error('Error sending rejection email:', error);
    return res.status(500).json({
      error: 'Failed to send rejection email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
