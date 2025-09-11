import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { generateTestArtistRejectionEmail } from '../../../lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const emailContent = generateTestArtistRejectionEmail();

    const result = await resend.emails.send({
      from: 'Art Night Detroit <john@artnightdetroit.com>',
      to: 'john@dpop.tech',
      subject: 'Thank You for Your Artist Application - Art Night Detroit',
      text: emailContent,
    });

    console.log('Test rejection email sent successfully:', result);

    return res.status(200).json({
      success: true,
      message: 'Test rejection email sent successfully',
      emailId: result.data?.id
    });

  } catch (error) {
    console.error('Error sending test rejection email:', error);
    return res.status(500).json({
      error: 'Failed to send test rejection email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
