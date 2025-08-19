import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabaseClient';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, source = 'cultural-bank' } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('email_subscriptions')
      .select('id, status')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', checkError);
      return res.status(500).json({ error: 'Database error' });
    }

    // If email already exists and is active, return success
    if (existingSubscription?.status === 'active') {
      return res.status(200).json({ 
        success: true, 
        message: 'Already subscribed',
        alreadySubscribed: true 
      });
    }

    // If email exists but is unsubscribed, reactivate it
    if (existingSubscription?.status === 'unsubscribed') {
      const { error: updateError } = await supabase
        .from('email_subscriptions')
        .update({ 
          status: 'active',
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
          source // Update source to latest
        })
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('Error reactivating subscription:', updateError);
        return res.status(500).json({ error: 'Failed to reactivate subscription' });
      }
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('email_subscriptions')
        .insert({
          email,
          source,
          metadata: {
            subscribed_from_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            user_agent: req.headers['user-agent']
          }
        });

      if (insertError) {
        console.error('Error creating subscription:', insertError);
        return res.status(500).json({ error: 'Failed to create subscription' });
      }
    }

    // Send welcome email with Resend
    try {
      await resend.emails.send({
        from: 'Art Night Detroit <noreply@artnightdetroit.com>',
        to: email,
        subject: 'Welcome to the Cultural Central Bank! 🏦✨',
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #121212; color: #ffffff; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #6c63ff; font-size: 2.5rem; margin-bottom: 10px; font-family: 'Baloo 2', cursive;">
                Welcome to the Cultural Central Bank! 🏦
              </h1>
              <p style="color: #a0a0a0; font-size: 1.2rem; line-height: 1.6;">
                You've just deposited your belief in art. Now watch it earn interest in humanity.
              </p>
            </div>

            <div style="background: linear-gradient(135deg, rgba(108, 99, 255, 0.2), transparent); border: 2px solid rgba(108, 99, 255, 0.4); border-radius: 16px; padding: 30px; margin-bottom: 30px;">
              <h2 style="color: #ffffff; font-size: 1.8rem; margin-bottom: 20px;">
                What happens next?
              </h2>
              <ul style="color: #a0a0a0; line-height: 1.8; padding-left: 20px;">
                <li><strong style="color: #6c63ff;">Artist Spotlights:</strong> Meet Detroit creators whose journeys will inspire you</li>
                <li><strong style="color: #6c63ff;">Investment Opportunities:</strong> Get early access to fractional art ownership</li>
                <li><strong style="color: #6c63ff;">Cultural Returns:</strong> Watch your investments grow with every brushstroke and breakthrough</li>
                <li><strong style="color: #6c63ff;">Community Updates:</strong> Join events where art, healing, and growth intersect</li>
              </ul>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <h3 style="color: #ffffff; margin-bottom: 15px;">
                Ready to explore the art money printer?
              </h3>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://artnightdetroit.com'}/bank" 
                 style="display: inline-block; background: linear-gradient(135deg, #6c63ff, #5a52d5); color: white; padding: 12px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 10px;">
                Visit the Cultural Bank
              </a>
            </div>

            <div style="border-top: 1px solid #2a2a2a; padding-top: 30px; text-align: center;">
              <p style="color: #a0a0a0; font-size: 0.9rem; line-height: 1.6;">
                This is what banking looks like when it's backed by creativity, healing, and shared human stories.<br>
                <strong style="color: #6c63ff;">Banks profit from loans. We profit from love.</strong>
              </p>
              
              <p style="color: #666; font-size: 0.8rem; margin-top: 20px;">
                You're receiving this because you subscribed to Art Night Detroit updates. 
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://artnightdetroit.com'}/unsubscribe?email=${encodeURIComponent(email)}" 
                   style="color: #6c63ff; text-decoration: none;">
                  Unsubscribe
                </a>
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the API call if email fails - subscription was still created
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Successfully subscribed to cultural banking updates!' 
    });

  } catch (error) {
    console.error('Subscribe email API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
