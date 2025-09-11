import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { generateArtistAcceptanceEmail } from '../../../../lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);


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
    // Generate email content using shared function
    const emailContent = generateArtistAcceptanceEmail(artistData);

    // Send the acceptance email
    const result = await resend.emails.send({
      from: 'Art Night Detroit <john@artnightdetroit.com>',
      to: artistData.email,
      subject: '🎨 Congratulations! Your Artist Application Has Been Accepted',
      text: emailContent,
    });

    console.log('Acceptance email sent successfully:', result);

    return res.status(200).json({ 
      success: true, 
      message: 'Acceptance email sent successfully',
      emailId: result.data?.id
    });

  } catch (error) {
    console.error('Error sending acceptance email:', error);
    return res.status(500).json({ 
      error: 'Failed to send acceptance email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
