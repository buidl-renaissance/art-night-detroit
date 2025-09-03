import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import { promises as fs } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ArtistSubmissionData {
  name: string;
  artistAlias?: string;
  email: string;
  phone: string;
  instagramLink?: string;
  portfolioLink?: string;
  willingToVolunteer: boolean;
  interestedInFutureEvents: boolean;
  additionalNotes?: string;
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
    // Parse form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
      keepExtensions: true,
      multiples: true, // Allow multiple files
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Formidable parse error:', err);
          reject(err);
        } else {
          resolve([fields, files]);
        }
      });
    });

    // Extract form data
    const submissionData: ArtistSubmissionData = {
      name: Array.isArray(fields.name) ? fields.name[0] : fields.name || '',
      artistAlias: Array.isArray(fields.artistAlias) ? fields.artistAlias[0] : fields.artistAlias || '',
      email: Array.isArray(fields.email) ? fields.email[0] : fields.email || '',
      phone: Array.isArray(fields.phone) ? fields.phone[0] : fields.phone || '',
      instagramLink: Array.isArray(fields.instagramLink) ? fields.instagramLink[0] : fields.instagramLink || '',
      portfolioLink: Array.isArray(fields.portfolioLink) ? fields.portfolioLink[0] : fields.portfolioLink || '',
      willingToVolunteer: (Array.isArray(fields.willingToVolunteer) ? fields.willingToVolunteer[0] : fields.willingToVolunteer) === 'true',
      interestedInFutureEvents: (Array.isArray(fields.interestedInFutureEvents) ? fields.interestedInFutureEvents[0] : fields.interestedInFutureEvents) === 'true',
      additionalNotes: Array.isArray(fields.additionalNotes) ? fields.additionalNotes[0] : fields.additionalNotes || '',
    };

    // Validate required fields
    if (!submissionData.name || !submissionData.email || !submissionData.phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
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

    // Handle portfolio file uploads
    const portfolioFiles: string[] = [];
    
    if (files.multimediaFiles) {
      const fileList = Array.isArray(files.multimediaFiles) ? files.multimediaFiles : [files.multimediaFiles];
      
      for (const file of fileList) {
        if (!file || !file.originalFilename) continue;

        // Validate file type
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'video/mp4', 'video/quicktime', 'video/webm',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (file.mimetype && !allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({ 
            error: `Unsupported file type: ${file.mimetype}. Please upload images, videos, or documents only.` 
          });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.originalFilename.split('.').pop();
        const fileName = `portfolio-${timestamp}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
        const filePath = `artist-submissions/${fileName}`;

        try {
          // Read file buffer
          const fileBuffer = await fs.readFile(file.filepath);
          
          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('artist-portfolios')
            .upload(filePath, fileBuffer, {
              contentType: file.mimetype || 'application/octet-stream',
            });

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            return res.status(500).json({ error: 'Failed to upload portfolio file' });
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('artist-portfolios')
            .getPublicUrl(filePath);

          portfolioFiles.push(urlData.publicUrl);

        } catch (fileError) {
          console.error('Error processing file:', fileError);
          return res.status(500).json({ error: 'Failed to process portfolio file' });
        }
      }
    }

    // Prepare data for database insertion
    const insertData = {
      name: submissionData.name,
      artist_alias: submissionData.artistAlias || null,
      email: submissionData.email,
      phone: submissionData.phone,
      instagram_link: submissionData.instagramLink || null,
      portfolio_link: submissionData.portfolioLink || null,
      portfolio_files: portfolioFiles,
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
