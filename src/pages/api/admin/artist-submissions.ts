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
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('API - Current user:', user);
    console.log('API - User error:', userError);

    // Try to fetch submissions directly with service role
    const { data: submissions, error: submissionsError } = await supabase
      .from('artist_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('API - Submissions data:', submissions);
    console.log('API - Submissions error:', submissionsError);

    if (submissionsError) {
      return res.status(500).json({ 
        error: 'Failed to fetch submissions', 
        details: submissionsError 
      });
    }

    res.status(200).json({ 
      success: true, 
      submissions: submissions || [],
      count: (submissions || []).length
    });

  } catch (error) {
    console.error('Error in artist-submissions API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
