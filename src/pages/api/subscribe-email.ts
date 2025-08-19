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
      console.log('Attempting to send email to:', email);
      console.log('Resend API Key exists:', !!process.env.RESEND_API_KEY);
      
      const emailResult = await resend.emails.send({
        from: 'Art Night Detroit <noreply@artnightdetroit.com>',
        to: email,
        subject: 'Welcome to the Art Bank Vision! 🏗️✨',
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #121212; color: #ffffff; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #6c63ff; font-size: 2.5rem; margin-bottom: 10px; font-family: 'Baloo 2', cursive;">
                Welcome to the Art Bank Vision! 🏗️
              </h1>
              <p style="color: #a0a0a0; font-size: 1.3rem; line-height: 1.6; font-weight: 600;">
                You're now part of the community building the future of cultural banking.
              </p>
            </div>

            <div style="background: linear-gradient(135deg, rgba(108, 99, 255, 0.2), transparent); border: 2px solid rgba(108, 99, 255, 0.4); border-radius: 16px; padding: 30px; margin-bottom: 30px;">
              <h2 style="color: #ffffff; font-size: 1.8rem; margin-bottom: 20px;">
                🏦 What We're Building: The Art Bank
              </h2>
              <p style="color: #a0a0a0; margin-bottom: 20px; font-size: 1.1rem;">
                <strong style="color: #6c63ff;">Digital Wallet + Cultural Vault</strong><br>
                Imagine banking where you can hold funds, transact, and pay like normal — but it doubles as a cultural bank: curating, collecting, and compounding art, stories, and community growth alongside your money.
              </p>
              
              <div style="margin: 25px 0;">
                <h3 style="color: #6c63ff; font-size: 1.2rem; margin-bottom: 15px;">🎨 The Vision</h3>
                <ul style="color: #a0a0a0; line-height: 1.8; padding-left: 20px; margin: 0;">
                  <li><strong style="color: #6c63ff;">Cultural Dividends:</strong> Instead of earning cents in interest, you'll earn perks: prints, art drops, curated cultural assets</li>
                  <li><strong style="color: #6c63ff;">Receipts as Art:</strong> Your transactions will generate collectible cultural "receipts" (digital art, animations, limited prints)</li>
                  <li><strong style="color: #6c63ff;">Cultural Credit Score:</strong> Based on your participation, support of artists, and community contributions</li>
                  <li><strong style="color: #6c63ff;">Vault of Culture:</strong> Your wallet will double as a gallery of what you've collected and supported</li>
                </ul>
              </div>
            </div>

            <div style="background: rgba(108, 99, 255, 0.1); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
              <h3 style="color: #ffffff; margin-bottom: 15px; font-size: 1.3rem;">💡 Stay Connected to the Journey</h3>
              <p style="color: #a0a0a0; line-height: 1.7; margin: 0;">
                As we build this, you'll get exclusive updates on our progress, early access to features, and input opportunities. 
                When the collective pool grows, it will fund raffles, exhibitions, and cultural events. 
                The "interest" gets redistributed into creative growth — your future wallet will become a vault of art, 
                a record of community, and proof of your growth.
              </p>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <h3 style="color: #ffffff; margin-bottom: 15px; font-size: 1.2rem;">
                Follow the Build Process
              </h3>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://artnightdetroit.com'}/bank" 
                 style="display: inline-block; background: linear-gradient(135deg, #6c63ff, #5a52d5); color: white; padding: 15px 35px; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 10px; font-size: 1.1rem;">
                See the Vision
              </a>
            </div>

            <div style="border-top: 1px solid #2a2a2a; padding-top: 30px; text-align: center;">
              <p style="color: #a0a0a0; font-size: 0.9rem; line-height: 1.6;">
                This is what banking will look like when it's backed by creativity, healing, and shared human stories.<br>
                <strong style="color: #6c63ff;">Banks profit from loans. We'll profit from love.</strong>
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
      
      console.log('Email sent successfully:', emailResult);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      console.error('Email error details:', {
        message: emailError.message,
        name: emailError.name,
        stack: emailError.stack
      });
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
