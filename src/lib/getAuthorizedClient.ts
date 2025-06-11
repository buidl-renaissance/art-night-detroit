import { createClient } from '@supabase/supabase-js';
import { NextApiRequest } from 'next';

export async function getAuthorizedClient(req: NextApiRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get the authorization token from headers
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization token');
  }

  const token = authHeader.split(' ')[1];
  
  // Get the user from the token
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid authorization token');
  }

  return { supabase, user, error };
}
  