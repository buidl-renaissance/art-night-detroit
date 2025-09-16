import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { generateArtistAcceptanceEmail, generateArtistRejectionEmail } from '../../../../../lib/emailTemplates';

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

  const validStatuses = ['pending_review', 'under_review', 'approved', 'accepted', 'rejected', 'declined', 'contacted'];
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

    // Send email if status is being changed to 'approved' or 'rejected' and not already contacted
    let emailResult = null;
    let emailSubject = '';
    let emailContent = '';

    if ((status === 'approved' || status === 'rejected') && data && !data.contacted) {
      try {
        if (status === 'approved') {
          // Generate acceptance email content
          emailContent = generateArtistAcceptanceEmail({
            name: data.name,
            artist_alias: data.artist_alias,
            email: data.email,
            preferred_canvas_size: data.preferred_canvas_size
          });
          emailSubject = '🎨 Congratulations! Your Artist Application Has Been Accepted';
        } else if (status === 'rejected') {
          // Generate rejection email content
          emailContent = generateArtistRejectionEmail({
            name: data.name,
            artist_alias: data.artist_alias,
            email: data.email
          });
          emailSubject = 'Thank You for Your Artist Application - Art Night Detroit';
        }

        // Send the email
        emailResult = await resend.emails.send({
          from: 'Art Night Detroit <john@artnightdetroit.com>',
          to: data.email,
          subject: emailSubject,
          text: emailContent,
        });

        console.log(`${status} email sent successfully:`, emailResult);

        // Update the contacted field to true after successful email
        if (emailResult?.data?.id) {
          await supabase
            .from('artist_submissions')
            .update({ contacted: true })
            .eq('id', id);
        }
      } catch (emailError) {
        console.error(`Error sending ${status} email:`, emailError);
        // Don't fail the status update if email fails
        emailResult = { error: emailError instanceof Error ? emailError.message : 'Unknown email error' };
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Submission status updated successfully',
      submission: data,
      emailSent: (status === 'approved' || status === 'rejected') && !data.contacted ? !!emailResult?.data?.id : false,
      emailSkipped: (status === 'approved' || status === 'rejected') && data.contacted ? 'Artist already contacted' : null,
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
