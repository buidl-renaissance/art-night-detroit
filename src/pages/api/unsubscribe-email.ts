import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Update subscription status to unsubscribed
    const { data, error } = await supabase
      .from('email_subscriptions')
      .update({ 
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email)
      .eq('status', 'active')
      .select();

    if (error) {
      console.error('Error unsubscribing email:', error);
      return res.status(500).json({ error: 'Failed to unsubscribe' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Email not found or already unsubscribed' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Successfully unsubscribed' 
    });

  } catch (error) {
    console.error('Unsubscribe email API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
