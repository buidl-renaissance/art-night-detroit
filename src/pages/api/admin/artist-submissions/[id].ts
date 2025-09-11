import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Valid submission ID is required' });
    }

    console.log('Fetching artist submission:', id);

    // Fetch the specific submission
    const { data: submission, error } = await supabase
      .from('artist_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching artist submission:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch artist submission',
        details: error.message || 'Unknown database error'
      });
    }

    if (!submission) {
      return res.status(404).json({ error: 'Artist submission not found' });
    }

    console.log('Successfully fetched artist submission:', submission.id);

    res.status(200).json({ 
      success: true,
      submission
    });

  } catch (error) {
    console.error('Error in fetch-artist-submission:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
