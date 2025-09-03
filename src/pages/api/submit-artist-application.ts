import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

interface ArtistSubmissionData {
  name: string;
  artistAlias?: string;
  email: string;
  phone: string;
  instagramLink?: string;
  portfolioLink?: string;
  preferredCanvasSize: string;
  willingToVolunteer: boolean;
  interestedInFutureEvents: boolean;
  additionalNotes?: string;
  portfolioFileUrls: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Parse JSON body
    const submissionData: ArtistSubmissionData = req.body;

    // Validate required fields
    if (!submissionData.name || !submissionData.email || !submissionData.phone || !submissionData.preferredCanvasSize) {
      return res.status(400).json({ error: 'Name, email, phone, and preferred canvas size are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(submissionData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate phone format (should be formatted as (xxx) xxx-xxxx)
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (!phoneRegex.test(submissionData.phone)) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }

    // Validate portfolio files
    if (!submissionData.portfolioFileUrls || submissionData.portfolioFileUrls.length < 2) {
      return res.status(400).json({ error: 'At least two portfolio files are required' });
    }

    // Prepare data for database insertion
    const insertData = {
      name: submissionData.name,
      artist_alias: submissionData.artistAlias || null,
      email: submissionData.email,
      phone: submissionData.phone,
      instagram_link: submissionData.instagramLink || null,
      portfolio_link: submissionData.portfolioLink || null,
      preferred_canvas_size: submissionData.preferredCanvasSize,
      portfolio_files: submissionData.portfolioFileUrls,
      willing_to_volunteer: submissionData.willingToVolunteer,
      interested_in_future_events: submissionData.interestedInFutureEvents,
      additional_notes: submissionData.additionalNotes || null,
      status: 'pending_review',
      created_at: new Date().toISOString(),
    };

    console.log('Attempting to insert artist submission:', JSON.stringify(insertData, null, 2));

    // Save to database
    const { data: submission, error: dbError } = await supabase
      .from('artist_submissions')
      .insert([insertData])
      .select()
      .single();

    if (dbError) {
      console.error('Database error details:', JSON.stringify(dbError, null, 2));
      console.error('Database error message:', dbError.message);
      console.error('Database error code:', dbError.code);
      return res.status(500).json({ 
        error: 'Failed to save submission', 
        details: dbError.message || 'Unknown database error'
      });
    }

    // Send confirmation email (optional - could be implemented later)
    // await sendConfirmationEmail(submissionData.email, submissionData.name);

    res.status(200).json({ 
      success: true, 
      message: 'Artist application submitted successfully',
      submissionId: submission.id
    });

  } catch (error) {
    console.error('Error in submit-artist-application:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
