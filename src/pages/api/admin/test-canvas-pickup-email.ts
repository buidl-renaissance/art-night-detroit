import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { generateCanvasPickupEmail } from '../../../lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test artist data
    const testArtistData = {
      name: 'John Gulbronson',
      artist_alias: 'Johnny Art',
      email: 'john@dpop.tech',
      preferred_canvas_size: '18x18',
      isTest: true
    };

    // Generate the email content
    const emailContent = generateCanvasPickupEmail(testArtistData);

    // Send the test canvas pickup email using Resend
    const result = await resend.emails.send({
      from: 'Art Night Detroit <john@artnightdetroit.com>',
      to: testArtistData.email,
      subject: '🎨 Your Canvas - Art Night Detroit',
      text: emailContent,
    });

    console.log('Canvas pickup test email sent successfully:', result);

    return res.status(200).json({ 
      success: true, 
      message: 'Canvas pickup test email sent successfully',
      recipient: testArtistData.email,
      emailId: result.data?.id
    });

  } catch (error) {
    console.error('Error sending canvas pickup test email:', error);
    return res.status(500).json({ 
      error: 'Failed to send canvas pickup test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
