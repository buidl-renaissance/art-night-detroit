import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { generateArtistAcceptanceEmail } from '../../../../../lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { status, admin_notes } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Submission ID is required' });
  }

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const validStatuses = ['pending_review', 'under_review', 'approved', 'rejected', 'contacted'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data, error } = await supabase
      .from('artist_submissions')
      .update({
        status,
        admin_notes: admin_notes || null,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Failed to update submission status', 
        details: error.message 
      });
    }

    // Send acceptance email if status is being changed to 'approved'
    let emailResult = null;
    if (status === 'approved' && data) {
      try {
        // Generate email content using shared function
        const emailContent = generateArtistAcceptanceEmail({
          name: data.name,
          artist_alias: data.artist_alias,
          email: data.email,
          preferred_canvas_size: data.preferred_canvas_size
        });

        // Send the acceptance email
        emailResult = await resend.emails.send({
          from: 'Art Night Detroit <noreply@artnightdetroit.com>',
          to: data.email,
          subject: '🎨 Congratulations! Your Artist Application Has Been Accepted',
          text: emailContent,
        });

        console.log('Acceptance email sent successfully:', emailResult);
      } catch (emailError) {
        console.error('Error sending acceptance email:', emailError);
        // Don't fail the status update if email fails
        emailResult = { error: emailError instanceof Error ? emailError.message : 'Unknown email error' };
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Submission status updated successfully',
      submission: data,
      emailSent: status === 'approved' ? !!emailResult?.data?.id : false,
      emailResult: emailResult?.error ? { error: emailResult.error } : null
    });

  } catch (error) {
    console.error('Error updating submission status:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
