import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { status, admin_notes } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid submission ID' });
  }

  if (!status || typeof status !== 'string') {
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
    // Get current user for reviewed_by field
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    const updateData: any = {
      status,
      admin_notes: admin_notes || null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add reviewed_by if we have a user
    if (user && !userError) {
      updateData.reviewed_by = user.id;
    }

    const { data: submission, error: updateError } = await supabase
      .from('vendor_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating vendor submission:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update submission status', 
        details: updateError.message 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Vendor submission status updated successfully',
      submission
    });

  } catch (error) {
    console.error('Error in vendor submission status update:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
