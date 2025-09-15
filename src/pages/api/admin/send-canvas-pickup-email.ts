import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { generateCanvasPickupEmail } from '../../../lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { artistId, name, artist_alias, email, preferred_canvas_size } = req.body;

    if (!artistId || !name || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields: artistId, name, and email are required' 
      });
    }

    // Generate the email content
    const artistData = {
      name,
      artist_alias: artist_alias || '',
      email,
      preferred_canvas_size: preferred_canvas_size || '18x18',
      isTest: false
    };

    const emailContent = generateCanvasPickupEmail(artistData);

    // Send the canvas pickup email using Resend
    const result = await resend.emails.send({
      from: 'Art Night Detroit <john@artnightdetroit.com>',
      to: email,
      subject: '🎨 Your Canvas - Art Night Detroit',
      text: emailContent,
    });

    console.log('Canvas pickup email sent successfully:', result);

    return res.status(200).json({ 
      success: true, 
      message: 'Canvas pickup email sent successfully',
      recipient: email,
      emailId: result.data?.id
    });

  } catch (error) {
    console.error('Error sending canvas pickup email:', error);
    return res.status(500).json({ 
      error: 'Failed to send canvas pickup email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
