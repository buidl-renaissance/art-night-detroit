import { NextApiRequest, NextApiResponse } from 'next';
import { generateArtistThankYouEmail } from '@/lib/emailTemplates';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    // Generate the thank you email with test data
    const testArtistData = {
      name: 'John',
      artist_alias: 'Test Artist',
      email: email,
      preferred_canvas_size: '18x18',
      isTest: true
    };

    const emailContent = generateArtistThankYouEmail(testArtistData);
    
    // Extract subject and body from the email content
    const lines = emailContent.trim().split('\n');
    const subjectLine = lines.find(line => line.startsWith('Subject:'));
    const subject = subjectLine ? subjectLine.replace('Subject: ', '') : 'Thank You for Participating in Art Night Detroit x Murals in the Market';
    
    // Remove the subject line and get the body
    const bodyLines = lines.filter(line => !line.startsWith('Subject:'));
    const emailBody = bodyLines.join('\n').trim();
    
    // Convert to HTML (simple conversion)
    const htmlBody = emailBody
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');

    console.log('Sending test thank you email to:', email);
    console.log('Subject:', subject);

    // Send the email using Resend
    const result = await resend.emails.send({
      from: 'Art Night Detroit <john@artnightdetroit.com>',
      to: email,
      subject: subject,
      html: htmlBody,
      text: emailBody
    });

    console.log('Email result:', result);
    
    return res.status(200).json({
      success: true,
      message: `Test thank you email sent to ${email}`,
      emailContent: emailContent,
      recipient: email,
      result: result
    });

  } catch (error) {
    console.error('Error sending test thank you email:', error);
    return res.status(500).json({ 
      error: 'Failed to send test email', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
