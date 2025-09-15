import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

interface ArtistProfileData {
  submissionId: string;
  name: string;
  email: string;
  handle: string;
  tagline: string;
  website?: string;
  instagram: string;
  profileImage?: string;
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
    const profileData: ArtistProfileData = req.body;

    // Validate required fields
    if (!profileData.submissionId || !profileData.name || !profileData.email || 
        !profileData.handle || !profileData.instagram) {
      return res.status(400).json({ 
        error: 'Submission ID, name, email, handle, and Instagram are required' 
      });
    }

    // Check if the submission exists and is in pending_review status
    const { data: submission, error: submissionError } = await supabase
      .from('artist_submissions')
      .select('*')
      .eq('id', profileData.submissionId)
      .single();

    if (submissionError || !submission) {
      return res.status(404).json({ error: 'Artist submission not found' });
    }

    if (submission.status !== 'pending_review') {
      return res.status(400).json({ 
        error: 'Profile setup is only available for pending submissions' 
      });
    }

    // Prepare profile data for insertion
    const insertData = {
      submission_id: profileData.submissionId,
      name: profileData.name,
      email: profileData.email,
      handle: profileData.handle,
      tagline: profileData.tagline || null,
      website: profileData.website || null,
      instagram: profileData.instagram,
      image_url: profileData.profileImage || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Attempting to save artist profile:', JSON.stringify(insertData, null, 2));

    // Check if profile already exists with this handle
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('handle', profileData.handle)
      .single();

    let profile;
    let profileError;

    if (existingProfile) {
      // Update existing profile
      console.log('Profile exists, updating...');
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          email: profileData.email,
          tagline: profileData.tagline || null,
          website: profileData.website || null,
          instagram: profileData.instagram,
          image_url: profileData.profileImage || null,
          updated_at: new Date().toISOString(),
        })
        .eq('handle', profileData.handle)
        .select()
        .single();
      
      profile = updatedProfile;
      profileError = updateError;
    } else {
      // Create new profile
      console.log('Creating new profile...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([insertData])
        .select()
        .single();
      
      profile = newProfile;
      profileError = createError;
    }

    if (profileError) {
      console.error('Profile save error details:', JSON.stringify(profileError, null, 2));
      console.error('Profile save error message:', profileError.message);
      console.error('Profile save error code:', profileError.code);
      return res.status(500).json({ 
        error: 'Failed to save artist profile', 
        details: profileError.message || 'Unknown database error'
      });
    }

    // Update the submission status to indicate profile is complete
    const { error: updateError } = await supabase
      .from('artist_submissions')
      .update({ 
        status: 'profile_complete',
        updated_at: new Date().toISOString()
      })
      .eq('id', profileData.submissionId);

    if (updateError) {
      console.error('Failed to update submission status:', updateError);
      // Don't fail the entire operation if status update fails
    }

    console.log('Artist profile saved successfully:', profile.id);

    res.status(200).json({ 
      success: true, 
      message: 'Artist profile setup completed successfully',
      profileId: profile.id
    });

  } catch (error) {
    console.error('Error in artist-profile-setup:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
