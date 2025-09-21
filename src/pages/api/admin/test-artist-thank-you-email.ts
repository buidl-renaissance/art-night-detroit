import { NextApiRequest, NextApiResponse } from 'next';
import { generateTestArtistThankYouEmail } from '@/lib/emailTemplates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const testEmail = generateTestArtistThankYouEmail();
    
    return res.status(200).json({
      success: true,
      message: 'Test artist thank you email generated successfully',
      emailContent: testEmail
    });

  } catch (error) {
    console.error('Error generating test artist thank you email:', error);
    return res.status(500).json({ 
      error: 'Failed to generate test email', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
