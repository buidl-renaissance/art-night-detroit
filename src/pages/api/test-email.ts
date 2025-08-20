import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Testing email send to:', email);
    console.log('API Key exists:', !!process.env.RESEND_API_KEY);
    console.log('API Key length:', process.env.RESEND_API_KEY?.length);

    // Try a simple test email first
    const result = await resend.emails.send({
      from: 'noreply@artnightdetroit.com',
      to: email,
      subject: 'Test Email from Art Night Detroit',
      html: '<h1>Test Email</h1><p>This is a test email to verify Resend configuration.</p>',
    });

    console.log('Email result:', result);

    return res.status(200).json({ 
      success: true, 
      result,
      message: 'Test email sent successfully'
    });

  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({ 
      error: 'Failed to send test email',
      details: (error as Error)?.message || 'No message'
    });
  }
}
