import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { generateTestArtistAcceptanceEmail } from '../../../lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { testEmail } = req.body;

  if (!testEmail) {
    return res.status(400).json({ error: 'Test email is required' });
  }

  try {
    // Generate test email content using shared function
    const emailContent = generateTestArtistAcceptanceEmail();

    // Send the test acceptance email
    const result = await resend.emails.send({
      from: 'Art Night Detroit <john@artnightdetroit.com>',
      to: testEmail,
      subject: '🎨 TEST: Artist Application Accepted - Art Night Detroit',
      text: emailContent,
    });

    console.log('Test acceptance email sent successfully:', result);

    return res.status(200).json({ 
      success: true, 
      message: 'Test acceptance email sent successfully',
      emailId: result.data?.id
    });

  } catch (error) {
    console.error('Error sending test acceptance email:', error);
    return res.status(500).json({ 
      error: 'Failed to send test acceptance email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
